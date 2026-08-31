import fs from 'fs-extra';
import path from 'path';
import { ArtifactValidation, FixtureManifestEntry, ValidationIssue } from '../types';
import { RepoContext } from '../validators';
import { CheckResult } from './analysis';

function issue(severity: 'error' | 'warning', code: string, message: string): ValidationIssue {
  return { severity, code, message };
}

const FRAMEWORK_RULES: Record<string, string> = {
  express: '.cursor/rules/express-api-standards.mdc',
  react: '.cursor/rules/react-best-practices.mdc',
};

function validateCursorRule(
  workspaceDir: string,
  relPath: string
): { passed: boolean; warning?: ValidationIssue } {
  const fullPath = path.join(workspaceDir, relPath);
  if (!fs.existsSync(fullPath)) {
    return {
      passed: false,
      warning: issue('warning', 'READY_CURSOR_RULE', `Missing cursor rule: ${relPath}`),
    };
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes('globs:')) {
    return {
      passed: false,
      warning: issue('warning', 'READY_CURSOR_GLOBS', `${relPath} missing globs frontmatter`),
    };
  }
  return { passed: true };
}

export function validateAgentReadiness(
  workspaceDir: string,
  context: RepoContext | null,
  fixture: FixtureManifestEntry,
  explainValidation?: ArtifactValidation
): CheckResult {
  const warnings: ValidationIssue[] = [];
  let passed = 0;
  let total = 0;

  if (context?.languages.includes('typescript')) {
    total += 1;
    const result = validateCursorRule(workspaceDir, '.cursor/rules/typescript-standards.mdc');
    if (result.passed) passed += 1;
    else if (result.warning) warnings.push(result.warning);
  }

  if (context) {
    for (const fw of context.frameworks) {
      const rulePath = FRAMEWORK_RULES[fw];
      if (rulePath) {
        total += 1;
        const result = validateCursorRule(workspaceDir, rulePath);
        if (result.passed) passed += 1;
        else if (result.warning) warnings.push(result.warning);
      }
    }

    if (context.frameworks.includes('react')) {
      total += 1;
      const wfPath = '.agents/workflows/create-react-component.md';
      if (fs.existsSync(path.join(workspaceDir, wfPath))) {
        passed += 1;
      } else {
        warnings.push(issue('warning', 'READY_REACT_WF', `Missing workflow: ${wfPath}`));
      }
    }
  }

  const coreWorkflows = [
    '.agents/workflows/regenerate-all.md',
    '.agents/workflows/update-readme.md',
  ];
  for (const wf of coreWorkflows) {
    total += 1;
    if (fs.existsSync(path.join(workspaceDir, wf))) {
      passed += 1;
    } else {
      warnings.push(issue('warning', 'READY_WORKFLOW', `Missing workflow: ${wf}`));
    }
  }

  if (fixture.expectedWorkflows) {
    for (const wf of fixture.expectedWorkflows) {
      total += 1;
      if (fs.existsSync(path.join(workspaceDir, wf))) {
        passed += 1;
      } else {
        warnings.push(issue('warning', 'READY_EXPECTED_WF', `Missing expected workflow: ${wf}`));
      }
    }
  }

  const agentRulesPath = path.join(workspaceDir, '.agents', 'rules', 'repo-rules.md');
  total += 1;
  if (fs.existsSync(agentRulesPath)) {
    const content = fs.readFileSync(agentRulesPath, 'utf8');
    if (content.trim().length > 0) {
      passed += 1;
    } else {
      warnings.push(issue('warning', 'READY_AGENT_RULES_EMPTY', 'repo-rules.md is empty'));
    }
  } else {
    warnings.push(issue('warning', 'READY_AGENT_RULES', 'Missing .agents/rules/repo-rules.md'));
  }

  if (fixture.expectedArtifacts) {
    for (const artifact of fixture.expectedArtifacts) {
      total += 1;
      if (fs.existsSync(path.join(workspaceDir, artifact))) {
        passed += 1;
      } else {
        warnings.push(issue('warning', 'READY_ARTIFACT', `Missing expected artifact: ${artifact}`));
      }
    }
  }

  const skillsIndexPath = path.join(workspaceDir, '.agents', 'skills', 'index.json');
  if (fs.existsSync(skillsIndexPath)) {
    try {
      const data = fs.readJSONSync(skillsIndexPath) as { skills?: Array<{ name: string; path?: string }> };
      for (const skill of data.skills || []) {
        total += 1;
        const skillName = skill.name.toLowerCase().replace(/\s+/g, '-');
        const skillMd = path.join(workspaceDir, '.agents', 'skills', skillName, 'SKILL.md');
        if (fs.existsSync(skillMd)) {
          passed += 1;
        } else {
          warnings.push(issue('warning', 'READY_SKILL', `Skill folder missing SKILL.md for "${skill.name}"`));
        }
      }
    } catch {
      total += 1;
      warnings.push(issue('warning', 'READY_SKILLS_INDEX', 'Could not parse skills index.json'));
    }
  }

  if (fixture.explainFile) {
    total += 1;
    if (explainValidation?.valid) {
      passed += 1;
    } else if (explainValidation) {
      for (const i of explainValidation.issues) {
        warnings.push(i);
      }
    } else {
      warnings.push(issue('warning', 'READY_EXPLAIN', 'explain validation not run'));
    }
  }

  if (total === 0) {
    return { passed: 1, total: 1, warnings: [] };
  }

  return { passed, total, warnings };
}
