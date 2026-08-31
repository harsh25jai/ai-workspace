import { ArtifactValidation, FixtureManifestEntry, ValidationIssue } from '../types';

function issue(severity: 'error' | 'warning', code: string, message: string): ValidationIssue {
  return { severity, code, message };
}

export function validateExplainOutput(
  stdout: string,
  fixture: FixtureManifestEntry
): ArtifactValidation {
  const issues: ValidationIssue[] = [];

  if (!fixture.explainFile) {
    return { path: 'explain', exists: false, valid: true, issues: [] };
  }

  if (!stdout || stdout.trim().length === 0) {
    return {
      path: 'explain',
      exists: false,
      valid: false,
      issues: [issue('warning', 'EXPLAIN_EMPTY', 'explain produced no stdout')],
    };
  }

  if (!stdout.includes('--- File Explanation ---')) {
    issues.push(issue('warning', 'EXPLAIN_HEADER', 'explain stdout missing File Explanation header'));
  }

  if (!stdout.includes(`Path: ${fixture.explainFile}`)) {
    issues.push(
      issue('warning', 'EXPLAIN_PATH', `explain stdout missing Path: ${fixture.explainFile}`)
    );
  }

  if (!stdout.includes('Imports:')) {
    issues.push(issue('warning', 'EXPLAIN_IMPORTS', 'explain stdout missing Imports section'));
  }

  if (!stdout.includes('Matched Skills:')) {
    issues.push(issue('warning', 'EXPLAIN_SKILLS', 'explain stdout missing Matched Skills section'));
  }

  const valid = issues.filter((i) => i.severity === 'error').length === 0 &&
    issues.filter((i) => i.code.startsWith('EXPLAIN_')).length === 0;

  return {
    path: `explain:${fixture.explainFile}`,
    exists: true,
    valid,
    issues,
  };
}
