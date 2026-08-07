import fs from 'fs-extra';
import path from 'path';
import { E2EContext } from './context';
import { runBundleCliOrThrow } from './bundleCli';
import {
  deriveVerdict,
  parseRepoContext,
  validateAllArtifacts,
  validateDetection,
} from './validators';
import { validateProductQuality } from './validators/index';
import { emptyQualityReport } from './scoring';
import { countSourceFiles } from './workspace';
import {
  CommandResult,
  FixtureManifestEntry,
  FixtureRunResult,
} from './types';

function collectArtifactErrors(
  artifacts: ReturnType<typeof validateAllArtifacts>,
  detectionIssues: ReturnType<typeof validateDetection>
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const artifact of artifacts) {
    for (const issue of artifact.issues) {
      const msg = `[${artifact.path}] ${issue.message}`;
      if (issue.severity === 'error') errors.push(msg);
      else warnings.push(msg);
    }
  }

  for (const issue of detectionIssues) {
    const msg = `[detection] ${issue.message}`;
    if (issue.severity === 'error') errors.push(msg);
    else warnings.push(msg);
  }

  return { errors, warnings };
}

export function buildExpectationsFromContext(
  repoPath: string,
  context: ReturnType<typeof parseRepoContext>,
  overrides?: Partial<FixtureManifestEntry>
): FixtureManifestEntry {
  const baseName = path.basename(repoPath);
  return {
    id: overrides?.id ?? baseName,
    name: overrides?.name ?? baseName,
    stack: overrides?.stack ?? 'external',
    verdict: overrides?.verdict ?? 'PARTIAL',
    explainFile: overrides?.explainFile ?? null,
    expectedFrameworks: overrides?.expectedFrameworks ?? context?.frameworks ?? [],
    expectedModules: overrides?.expectedModules ?? context?.modules ?? [],
    expectedPatterns: overrides?.expectedPatterns ?? context?.patterns ?? [],
    workflows: overrides?.workflows ?? [],
    expectedArtifacts: overrides?.expectedArtifacts,
    expectedDocMentions: overrides?.expectedDocMentions,
    expectedWorkflows: overrides?.expectedWorkflows,
    minDocLength: overrides?.minDocLength,
    notes: overrides?.notes,
  };
}

export interface ValidateRepoOptions {
  repoPath: string;
  ctx: E2EContext;
  expectations?: Partial<FixtureManifestEntry>;
  commands?: CommandResult[];
  updateBaselines?: boolean;
}

/**
 * Validate AI workspace artifacts in an external repository (no CLI execution).
 */
export function validateRepoArtifacts(options: ValidateRepoOptions): FixtureRunResult {
  const { repoPath, ctx, expectations, commands = [], updateBaselines = false } = options;
  const absRepo = path.resolve(repoPath);
  const start = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!fs.existsSync(absRepo)) {
    return failResult(path.basename(absRepo), 'external', expectations?.verdict ?? 'PARTIAL', start, [
      `Repository not found: ${absRepo}`,
    ], commands);
  }

  if (!fs.existsSync(path.join(absRepo, '.ai'))) {
    return failResult(path.basename(absRepo), 'external', expectations?.verdict ?? 'PARTIAL', start, [
      'No .ai/ directory found. Run ctxstack init && analyze && generate first, or use "run" command.',
    ], commands);
  }

  const context = parseRepoContext(absRepo);
  const fixture = buildExpectationsFromContext(absRepo, context, expectations);

  const artifacts = validateAllArtifacts(absRepo);
  const detectionIssues = validateDetection(context, fixture);
  const collected = collectArtifactErrors(artifacts, detectionIssues);
  errors.push(...collected.errors);
  warnings.push(...collected.warnings);

  const explainStdout = commands.find((c) => c.command.includes('explain'))?.stdout;
  const productQuality = validateProductQuality({
    workspaceDir: absRepo,
    repoRoot: ctx.testerRoot,
    fixture,
    context,
    commands,
    artifacts,
    explainStdout,
    updateBaselines,
    baselinesRoot: ctx.baselinesRoot,
  });

  for (const qw of productQuality.qualityWarnings) {
    warnings.push(`[quality:${qw.code}] ${qw.message}`);
  }

  const actualVerdict = deriveVerdict(fixture, errors, detectionIssues);
  const pass = actualVerdict !== 'FAIL';

  return {
    id: fixture.id,
    name: fixture.name,
    stack: fixture.stack,
    expectedVerdict: fixture.verdict,
    actualVerdict,
    pass,
    durationMs: Date.now() - start,
    commands,
    artifacts,
    frameworksDetected: context?.frameworks ?? [],
    modulesDetected: context?.modules ?? [],
    patternsDetected: context?.patterns ?? [],
    warnings,
    errors,
    filesScanned: countSourceFiles(absRepo),
    quality: productQuality.quality,
    explainValidation: productQuality.explainValidation,
  };
}

export interface RunAndValidateOptions extends ValidateRepoOptions {
  ctxstackBundle: string;
  runExplain?: string | null;
}

/**
 * Run ctxstack bundle against a repo, then validate generated artifacts.
 */
export async function runAndValidateRepo(options: RunAndValidateOptions): Promise<FixtureRunResult> {
  const { repoPath, ctxstackBundle, runExplain } = options;
  const absRepo = path.resolve(repoPath);
  const commands: CommandResult[] = [];

  commands.push(runBundleCliOrThrow(ctxstackBundle, ['init'], absRepo));
  commands.push(runBundleCliOrThrow(ctxstackBundle, ['analyze'], absRepo));
  commands.push(runBundleCliOrThrow(ctxstackBundle, ['generate'], absRepo));
  commands.push(runBundleCliOrThrow(ctxstackBundle, ['status'], absRepo));

  const explainFile = runExplain ?? options.expectations?.explainFile ?? null;
  if (explainFile) {
    commands.push(runBundleCliOrThrow(ctxstackBundle, ['explain', explainFile], absRepo));
  }

  commands.push(runBundleCliOrThrow(ctxstackBundle, ['export'], absRepo));

  const result = validateRepoArtifacts({ ...options, commands });
  const cmdErrors = commands.filter((c) => c.exitCode !== 0);
  if (cmdErrors.length > 0) {
    return {
      ...result,
      pass: false,
      actualVerdict: 'FAIL',
      errors: [
        ...cmdErrors.map((c) => `Command failed (exit ${c.exitCode}): ${c.command}`),
        ...result.errors,
      ],
    };
  }
  return result;
}

function failResult(
  id: string,
  stack: string,
  expectedVerdict: FixtureManifestEntry['verdict'],
  start: number,
  errors: string[],
  commands: CommandResult[]
): FixtureRunResult {
  return {
    id,
    name: id,
    stack,
    expectedVerdict,
    actualVerdict: 'FAIL',
    pass: false,
    durationMs: Date.now() - start,
    commands,
    artifacts: [],
    frameworksDetected: [],
    modulesDetected: [],
    patternsDetected: [],
    warnings: [],
    errors,
    filesScanned: 0,
    quality: emptyQualityReport(),
  };
}
