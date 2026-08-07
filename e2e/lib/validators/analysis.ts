import fs from 'fs-extra';
import path from 'path';
import { FixtureManifestEntry, ValidationIssue } from '../types';
import { RepoContext, validateDetection } from '../validators';

function issue(severity: 'error' | 'warning', code: string, message: string): ValidationIssue {
  return { severity, code, message };
}

function arraysEqual(a: string[], b: string[]): boolean {
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  if (sortedA.length !== sortedB.length) return false;
  return sortedA.every((v, i) => v === sortedB[i]);
}

function hasEntrypointFile(workspaceDir: string): boolean {
  const candidates = [
    'src/index.ts',
    'src/index.js',
    'src/main.ts',
    'src/main.js',
    'src/app.ts',
    'src/app.js',
    'src/server.ts',
    'src/server.js',
    'src/cli/index.ts',
    'src/cli/index.js',
  ];
  return candidates.some((rel) => fs.existsSync(path.join(workspaceDir, rel)));
}

export interface CheckResult {
  passed: number;
  total: number;
  warnings: ValidationIssue[];
}

export function validateAnalysisCorrectness(
  workspaceDir: string,
  context: RepoContext | null,
  fixture: FixtureManifestEntry
): CheckResult {
  const warnings: ValidationIssue[] = [];
  let passed = 0;
  let total = 0;

  const detectionIssues = validateDetection(context, fixture);
  const detectionChecks =
    fixture.expectedFrameworks.length +
    fixture.expectedModules.length +
    fixture.expectedPatterns.length;

  if (detectionChecks > 0) {
    total += detectionChecks;
    passed += detectionChecks - detectionIssues.length;
    warnings.push(...detectionIssues);
  } else if (detectionIssues.length > 0) {
    for (const di of detectionIssues) {
      total += 1;
      warnings.push(di);
    }
  }

  if (!context) {
    total += 1;
    warnings.push(issue('warning', 'ANALYSIS_NO_CTX', 'No repo-context for analysis checks'));
    return { passed, total, warnings };
  }

  const usesTypeScript =
    fixture.stack.toLowerCase().includes('typescript') ||
    fixture.stack.toLowerCase().includes('nestjs') ||
    fixture.stack.toLowerCase().includes('react') ||
    fixture.stack.toLowerCase().includes('express');

  total += 1;
  if (!usesTypeScript || context.languages.includes('typescript')) {
    passed += 1;
  } else {
    warnings.push(
      issue('warning', 'ANALYSIS_LANG', 'Expected typescript in languages for TS fixture')
    );
  }

  if (hasEntrypointFile(workspaceDir)) {
    total += 1;
    if (context.entrypoints.length > 0) {
      passed += 1;
    } else {
      warnings.push(
        issue('warning', 'ANALYSIS_ENTRY', 'Fixture has entrypoint file but none detected in context')
      );
    }
  }

  const mapPath = path.join(workspaceDir, '.ai', 'repo-map.json');
  if (fs.existsSync(mapPath)) {
    try {
      const mapData = fs.readJSONSync(mapPath) as {
        languages?: string[];
        entrypoints?: string[];
      };
      const mapLangs = mapData.languages || [];
      const mapEps = mapData.entrypoints || [];

      total += 1;
      if (arraysEqual(mapLangs, context.languages)) {
        passed += 1;
      } else {
        warnings.push(
          issue(
            'warning',
            'ANALYSIS_MAP_LANG',
            `repo-map languages [${mapLangs.join(', ')}] differ from repo-context [${context.languages.join(', ')}]`
          )
        );
      }

      total += 1;
      if (arraysEqual(mapEps, context.entrypoints)) {
        passed += 1;
      } else {
        warnings.push(
          issue(
            'warning',
            'ANALYSIS_MAP_EP',
            `repo-map entrypoints [${mapEps.join(', ')}] differ from repo-context [${context.entrypoints.join(', ')}]`
          )
        );
      }
    } catch {
      total += 1;
      warnings.push(issue('warning', 'ANALYSIS_MAP_READ', 'Could not read repo-map.json for alignment check'));
    }
  }

  return { passed, total: Math.max(total, 1), warnings };
}
