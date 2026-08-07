import {
  ArtifactValidation,
  CommandResult,
  FixtureManifestEntry,
  QualityReport,
  ValidationIssue,
} from '../types';
import { buildQualityReport, scoreFromChecks } from '../scoring';
import { RepoContext } from '../validators';
import { validateAnalysisCorrectness } from './analysis';
import { validateBaseline } from './baseline';
import { validateCrossArtifactConsistency } from './consistency';
import { validateExplainOutput } from './explain';
import { validateAgentReadiness } from './readiness';

export interface ProductQualityInput {
  workspaceDir: string;
  repoRoot: string;
  fixture: FixtureManifestEntry;
  context: RepoContext | null;
  commands: CommandResult[];
  artifacts: ArtifactValidation[];
  explainStdout?: string;
  updateBaselines?: boolean;
}

export interface ProductQualityResult {
  quality: QualityReport;
  explainValidation?: ArtifactValidation;
  qualityWarnings: ValidationIssue[];
}

function scoreStructure(artifacts: ArtifactValidation[]): {
  passed: number;
  total: number;
  warnings: ValidationIssue[];
} {
  const warnings: ValidationIssue[] = [];
  if (artifacts.length === 0) {
    return { passed: 0, total: 1, warnings };
  }

  let passed = 0;
  for (const artifact of artifacts) {
    if (artifact.exists && artifact.valid) {
      passed += 1;
    } else {
      for (const i of artifact.issues) {
        if (i.severity === 'warning') warnings.push(i);
      }
    }
  }

  return { passed, total: artifacts.length, warnings };
}

function scoreReliability(commands: CommandResult[]): {
  passed: number;
  total: number;
  warnings: ValidationIssue[];
} {
  const warnings: ValidationIssue[] = [];
  const total = commands.length || 1;
  let passed = 0;
  for (const cmd of commands) {
    if (cmd.exitCode === 0) passed += 1;
    else {
      warnings.push({
        severity: 'warning',
        code: 'REL_CMD_FAIL',
        message: `Command exited ${cmd.exitCode}: ${cmd.command}`,
      });
    }
  }
  return { passed, total, warnings };
}

export function validateProductQuality(input: ProductQualityInput): ProductQualityResult {
  const {
    workspaceDir,
    repoRoot,
    fixture,
    context,
    commands,
    artifacts,
    explainStdout,
    updateBaselines = false,
  } = input;

  const explainValidation = explainStdout !== undefined
    ? validateExplainOutput(explainStdout, fixture)
    : undefined;

  const reliability = scoreReliability(commands);
  const structure = scoreStructure(artifacts);
  const analysis = validateAnalysisCorrectness(workspaceDir, context, fixture);
  const consistency = validateCrossArtifactConsistency(workspaceDir, context, fixture);
  const readiness = validateAgentReadiness(workspaceDir, context, fixture, explainValidation);
  const baseline = validateBaseline(repoRoot, fixture.id, workspaceDir, updateBaselines);

  const dimensions = [
    scoreFromChecks('reliability', reliability.passed, reliability.total, reliability.warnings),
    scoreFromChecks('structure', structure.passed, structure.total, structure.warnings),
    scoreFromChecks('analysis', analysis.passed, analysis.total, analysis.warnings),
    scoreFromChecks('consistency', consistency.passed, consistency.total, consistency.warnings),
    scoreFromChecks('agentReadiness', readiness.passed, readiness.total, readiness.warnings),
  ];

  // Fold baseline warnings into consistency dimension (informational)
  if (baseline.warnings.length > 0) {
    const consistencyDim = dimensions.find((d) => d.dimension === 'consistency');
    if (consistencyDim) {
      consistencyDim.warnings.push(...baseline.warnings);
      if (baseline.total > 0 && baseline.passed < baseline.total) {
        const extraFailed = baseline.total - baseline.passed;
        consistencyDim.passedChecks = Math.max(0, consistencyDim.passedChecks - extraFailed);
        consistencyDim.totalChecks += baseline.total;
        consistencyDim.score = Math.round(
          (consistencyDim.passedChecks / consistencyDim.totalChecks) * 100
        );
      }
    }
  }

  const qualityWarnings: ValidationIssue[] = [
    ...reliability.warnings,
    ...structure.warnings,
    ...analysis.warnings,
    ...consistency.warnings,
    ...readiness.warnings,
    ...baseline.warnings,
  ];

  if (explainValidation) {
    qualityWarnings.push(...explainValidation.issues);
  }

  return {
    quality: buildQualityReport(dimensions),
    explainValidation,
    qualityWarnings,
  };
}
