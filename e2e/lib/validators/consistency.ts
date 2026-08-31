import fs from 'fs-extra';
import path from 'path';
import { FixtureManifestEntry, ValidationIssue } from '../types';
import { RepoContext } from '../validators';
import { CheckResult } from './analysis';

function issue(severity: 'error' | 'warning', code: string, message: string): ValidationIssue {
  return { severity, code, message };
}

function readDoc(workspaceDir: string, relPath: string): string | null {
  const fullPath = path.join(workspaceDir, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, 'utf8');
}

export function validateCrossArtifactConsistency(
  workspaceDir: string,
  context: RepoContext | null,
  fixture: FixtureManifestEntry
): CheckResult {
  const warnings: ValidationIssue[] = [];
  let passed = 0;
  let total = 0;

  const projectMd = readDoc(workspaceDir, '.ctxstack/project.md');
  const architectureMd = readDoc(workspaceDir, '.ctxstack/architecture.md');
  const rulesMd = readDoc(workspaceDir, '.ctxstack/rules.md');

  if (!context) {
    return { passed: 0, total: 1, warnings: [issue('warning', 'CONSIST_NO_CTX', 'No context for consistency checks')] };
  }

  for (const fw of context.frameworks) {
    total += 1;
    if (projectMd && projectMd.toLowerCase().includes(fw.toLowerCase())) {
      passed += 1;
    } else {
      warnings.push(
        issue('warning', 'CONSIST_FW_PROJECT', `project.md missing framework "${fw}"`)
      );
    }
  }

  if (context.frameworks.length > 0) {
    total += 1;
    if (!projectMd || !projectMd.includes('Frameworks:** None detected')) {
      passed += 1;
    } else {
      warnings.push(
        issue('warning', 'CONSIST_FW_CONTRA', 'project.md says None detected but context has frameworks')
      );
    }
  }

  for (const mod of context.modules) {
    total += 1;
    const inArch = architectureMd?.includes(mod) ?? false;
    const inRules = rulesMd?.includes(mod) ?? false;
    if (inArch || inRules) {
      passed += 1;
    } else {
      warnings.push(
        issue('warning', 'CONSIST_MOD', `module "${mod}" not found in architecture.md or rules.md`)
      );
    }
  }

  for (const pat of context.patterns) {
    total += 1;
    const inArch = architectureMd?.includes(pat) ?? false;
    const inRules = rulesMd?.includes(pat) ?? false;
    if (inArch || inRules) {
      passed += 1;
    } else {
      warnings.push(
        issue('warning', 'CONSIST_PAT', `pattern "${pat}" not found in architecture.md or rules.md`)
      );
    }
  }

  if (fixture.expectedDocMentions) {
    for (const [relPath, mentions] of Object.entries(fixture.expectedDocMentions)) {
      const content = readDoc(workspaceDir, relPath);
      for (const mention of mentions) {
        total += 1;
        if (content && content.toLowerCase().includes(mention.toLowerCase())) {
          passed += 1;
        } else {
          warnings.push(
            issue('warning', 'CONSIST_MENTION', `${relPath} missing expected mention "${mention}"`)
          );
        }
      }
    }
  }

  if (fixture.minDocLength) {
    for (const [relPath, minLen] of Object.entries(fixture.minDocLength)) {
      total += 1;
      const content = readDoc(workspaceDir, relPath);
      if (content && content.length >= minLen) {
        passed += 1;
      } else {
        warnings.push(
          issue('warning', 'CONSIST_MINLEN', `${relPath} shorter than minimum ${minLen} chars`)
        );
      }
    }
  }

  if (total === 0) {
    return { passed: 1, total: 1, warnings: [] };
  }

  return { passed, total, warnings };
}
