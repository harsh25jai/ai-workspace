export type Verdict = 'PASS' | 'PARTIAL' | 'FAIL';

export interface FixtureManifestEntry {
  id: string;
  name: string;
  stack: string;
  verdict: Verdict;
  explainFile: string | null;
  expectedFrameworks: string[];
  expectedNotInFrameworks?: string[];
  expectedModules: string[];
  expectedPatterns: string[];
  expectedLayout?: 'monorepo' | 'single-package';
  expectedPackages?: string[];
  expectedAnalysisDepth?: 'full' | 'partial';
  expectedHttpAdapters?: string[];
  workflows: string[];
  notes?: string;
  expectedArtifacts?: string[];
  expectedDocMentions?: Record<string, string[]>;
  expectedWorkflows?: string[];
  minDocLength?: Record<string, number>;
}

export interface FixtureManifest {
  version: number;
  fixtures: FixtureManifestEntry[];
}

export interface CommandResult {
  command: string;
  exitCode: number;
  durationMs: number;
  stdout: string;
  stderr: string;
}

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
}

export interface ArtifactValidation {
  path: string;
  exists: boolean;
  valid: boolean;
  issues: ValidationIssue[];
}

export type QualityDimension =
  | 'reliability'
  | 'structure'
  | 'analysis'
  | 'consistency'
  | 'agentReadiness';

export interface DimensionScore {
  dimension: QualityDimension;
  score: number;
  maxScore: number;
  passedChecks: number;
  totalChecks: number;
  warnings: ValidationIssue[];
}

export interface QualityReport {
  overallScore: number;
  dimensions: DimensionScore[];
}

export interface FixtureRunResult {
  id: string;
  name: string;
  stack: string;
  expectedVerdict: Verdict;
  actualVerdict: Verdict;
  pass: boolean;
  durationMs: number;
  commands: CommandResult[];
  artifacts: ArtifactValidation[];
  frameworksDetected: string[];
  modulesDetected: string[];
  patternsDetected: string[];
  warnings: string[];
  errors: string[];
  filesScanned: number;
  quality: QualityReport;
  explainValidation?: ArtifactValidation;
}

export interface E2EReport {
  generatedAt: string;
  bundlePath: string;
  nodeVersion: string;
  totalDurationMs: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    partial: number;
  };
  results: FixtureRunResult[];
  compatibilityMatrix: CompatibilityRow[];
}

export interface CompatibilityRow {
  repository: string;
  stack: string;
  frameworkDetected: string;
  commandsExecuted: string[];
  artifactsGenerated: string[];
  warnings: string[];
  status: Verdict;
  durationMs: number;
  overallQualityScore: number;
}

export interface SuiteQualityReport {
  generatedAt: string;
  averageOverallScore: number;
  dimensionAverages: Record<QualityDimension, number>;
  fixtures: Array<{
    id: string;
    name: string;
    overallScore: number;
    dimensions: Record<QualityDimension, number>;
  }>;
}
