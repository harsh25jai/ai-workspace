import { FixtureManifestEntry, ValidationIssue } from '../types';
import { RepoContext } from '../validators';

function issue(severity: 'error' | 'warning', code: string, message: string): ValidationIssue {
  return { severity, code, message };
}

export interface RepoContextQualityResult {
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export interface ExtendedRepoContext extends RepoContext {
  version?: number;
  layout?: { type?: string };
  packages?: Array<{ name: string; path: string }>;
  httpAdapters?: string[];
  analysisDepth?: 'full' | 'partial';
  bootstrap?: { main?: string; startScripts?: string[]; hints?: string[] };
}

export function validateRepoContextQuality(
  context: ExtendedRepoContext | null,
  fixture: FixtureManifestEntry
): RepoContextQualityResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  if (!context) {
    errors.push(issue('error', 'CTX_MISSING', 'repo-context.json missing or invalid'));
    return { errors, warnings };
  }

  if (context.version !== 1) {
    warnings.push(issue('warning', 'CTX_VERSION', `Expected version 1, got ${context.version}`));
  }

  for (const fw of fixture.expectedNotInFrameworks || []) {
    if (context.frameworks.includes(fw)) {
      errors.push(issue('error', 'CTX_FALSE_FRAMEWORK', `frameworks must not include adapter "${fw}"`));
    }
  }

  if (fixture.expectedLayout && context.layout?.type !== fixture.expectedLayout) {
    errors.push(
      issue('error', 'CTX_LAYOUT', `Expected layout.type "${fixture.expectedLayout}", got "${context.layout?.type}"`)
    );
  }

  if (fixture.expectedAnalysisDepth && context.analysisDepth !== fixture.expectedAnalysisDepth) {
    errors.push(
      issue(
        'error',
        'CTX_DEPTH',
        `Expected analysisDepth "${fixture.expectedAnalysisDepth}", got "${context.analysisDepth}"`
      )
    );
  }

  for (const pkg of fixture.expectedPackages || []) {
    const names = (context.packages || []).map((p) => p.name);
    if (!names.includes(pkg)) {
      errors.push(issue('error', 'CTX_PACKAGE', `Expected workspace package "${pkg}" not found`));
    }
  }

  for (const adapter of fixture.expectedHttpAdapters || []) {
    if (!context.httpAdapters?.includes(adapter)) {
      warnings.push(issue('warning', 'CTX_ADAPTER', `Expected httpAdapters to include "${adapter}"`));
    }
  }

  return { errors, warnings };
}
