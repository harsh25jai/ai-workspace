import crypto from 'crypto';
import fs from 'fs-extra';
import path from 'path';
import { ValidationIssue } from '../types';
import { CheckResult } from './analysis';

function issue(severity: 'error' | 'warning', code: string, message: string): ValidationIssue {
  return { severity, code, message };
}

function normalizeJson(content: string): string {
  try {
    return JSON.stringify(JSON.parse(content), null, 0);
  } catch {
    return content.replace(/\s+/g, ' ').trim();
  }
}

function sectionHeadingHash(content: string): string {
  const headings = content
    .split('\n')
    .filter((line) => /^#{1,3}\s/.test(line))
    .map((line) => line.trim())
    .join('|');
  return crypto.createHash('sha256').update(headings).digest('hex').slice(0, 16);
}

export interface BaselineData {
  repoContextHash?: string;
  projectHeadingsHash?: string;
  architectureHeadingsHash?: string;
}

function fingerprintArtifact(workspaceDir: string, relPath: string, kind: 'json' | 'headings'): string | null {
  const fullPath = path.join(workspaceDir, relPath);
  if (!fs.existsSync(fullPath)) return null;
  const content = fs.readFileSync(fullPath, 'utf8');
  const normalized = kind === 'json' ? normalizeJson(content) : sectionHeadingHash(content);
  return crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}

export function loadBaseline(repoRoot: string, fixtureId: string): BaselineData | null {
  const baselinePath = path.join(repoRoot, 'e2e', 'fixtures', 'baselines', `${fixtureId}.json`);
  if (!fs.existsSync(baselinePath)) return null;
  return fs.readJSONSync(baselinePath) as BaselineData;
}

export function writeBaseline(repoRoot: string, fixtureId: string, workspaceDir: string): BaselineData {
  const data: BaselineData = {
    repoContextHash: fingerprintArtifact(workspaceDir, '.ai/context/repo-context.json', 'json') || undefined,
    projectHeadingsHash: fingerprintArtifact(workspaceDir, '.ai/project.md', 'headings') || undefined,
    architectureHeadingsHash: fingerprintArtifact(workspaceDir, '.ai/architecture.md', 'headings') || undefined,
  };
  const dir = path.join(repoRoot, 'e2e', 'fixtures', 'baselines');
  fs.ensureDirSync(dir);
  fs.writeJSONSync(path.join(dir, `${fixtureId}.json`), data, { spaces: 2 });
  return data;
}

export function validateBaseline(
  repoRoot: string,
  fixtureId: string,
  workspaceDir: string,
  updateBaselines: boolean
): CheckResult {
  if (updateBaselines) {
    writeBaseline(repoRoot, fixtureId, workspaceDir);
    return { passed: 1, total: 1, warnings: [] };
  }

  const baseline = loadBaseline(repoRoot, fixtureId);
  if (!baseline) {
    return {
      passed: 1,
      total: 1,
      warnings: [issue('warning', 'BASELINE_MISSING', `No baseline file for ${fixtureId} (run with --update-baselines)`)],
    };
  }

  const warnings: ValidationIssue[] = [];
  let passed = 0;
  let total = 0;

  const checks: Array<{ key: keyof BaselineData; path: string; kind: 'json' | 'headings' }> = [
    { key: 'repoContextHash', path: '.ai/context/repo-context.json', kind: 'json' },
    { key: 'projectHeadingsHash', path: '.ai/project.md', kind: 'headings' },
    { key: 'architectureHeadingsHash', path: '.ai/architecture.md', kind: 'headings' },
  ];

  for (const check of checks) {
    const expected = baseline[check.key];
    if (!expected) continue;
    total += 1;
    const actual = fingerprintArtifact(workspaceDir, check.path, check.kind);
    if (actual === expected) {
      passed += 1;
    } else {
      warnings.push(
        issue(
          'warning',
          'BASELINE_DRIFT',
          `${check.path} fingerprint drift (expected ${expected}, got ${actual || 'missing'})`
        )
      );
    }
  }

  if (total === 0) {
    return { passed: 1, total: 1, warnings: [] };
  }

  return { passed, total, warnings };
}
