import fs from 'fs-extra';
import path from 'path';
import { ArtifactValidation, FixtureManifestEntry, ValidationIssue } from './types';

const GROUND_TRUTH_MARKER = '<!-- @ground-truth:';
const STUB_MARKERS = ['Simulated Local Output', '[TO BE COMPLETED BY AGENT]'];

export interface RepoContext {
  languages: string[];
  frameworks: string[];
  entrypoints: string[];
  modules: string[];
  patterns: string[];
}

function issue(severity: 'error' | 'warning', code: string, message: string): ValidationIssue {
  return { severity, code, message };
}

export function parseRepoContext(workspaceDir: string): RepoContext | null {
  const contextPath = path.join(workspaceDir, '.ai', 'context', 'repo-context.json');
  if (!fs.existsSync(contextPath)) return null;
  try {
    return fs.readJSONSync(contextPath) as RepoContext;
  } catch {
    return null;
  }
}

export function validateRepoContext(workspaceDir: string): ArtifactValidation {
  const relPath = '.ai/context/repo-context.json';
  const fullPath = path.join(workspaceDir, relPath);
  const issues: ValidationIssue[] = [];

  if (!fs.existsSync(fullPath)) {
    return { path: relPath, exists: false, valid: false, issues: [issue('error', 'CTX_MISSING', 'repo-context.json not found')] };
  }

  let data: unknown;
  try {
    data = fs.readJSONSync(fullPath);
  } catch {
    return { path: relPath, exists: true, valid: false, issues: [issue('error', 'CTX_INVALID_JSON', 'repo-context.json is not valid JSON')] };
  }

  const required = ['languages', 'frameworks', 'entrypoints', 'modules', 'patterns'];
  for (const key of required) {
    if (!Array.isArray((data as Record<string, unknown>)[key])) {
      issues.push(issue('error', 'CTX_SCHEMA', `Missing or invalid array field: ${key}`));
    }
  }

  return { path: relPath, exists: true, valid: issues.length === 0, issues };
}

export function validateRepoMap(workspaceDir: string): ArtifactValidation {
  const relPath = '.ai/repo-map.json';
  const fullPath = path.join(workspaceDir, relPath);
  const issues: ValidationIssue[] = [];

  if (!fs.existsSync(fullPath)) {
    return { path: relPath, exists: false, valid: false, issues: [issue('error', 'MAP_MISSING', 'repo-map.json not found')] };
  }

  try {
    const data = fs.readJSONSync(fullPath) as Record<string, unknown>;
    if (!Array.isArray(data.languages)) issues.push(issue('error', 'MAP_SCHEMA', 'languages must be an array'));
    if (!Array.isArray(data.entrypoints)) issues.push(issue('error', 'MAP_SCHEMA', 'entrypoints must be an array'));
  } catch {
    issues.push(issue('error', 'MAP_INVALID_JSON', 'repo-map.json is not valid JSON'));
  }

  return { path: relPath, exists: true, valid: issues.length === 0, issues };
}

export function validateMarkdownDoc(
  workspaceDir: string,
  relPath: string,
  requiredSections: string[]
): ArtifactValidation {
  const fullPath = path.join(workspaceDir, relPath);
  const issues: ValidationIssue[] = [];

  if (!fs.existsSync(fullPath)) {
    return { path: relPath, exists: false, valid: false, issues: [issue('error', 'MD_MISSING', `${relPath} not found`)] };
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  if (content.trim().length === 0) {
    issues.push(issue('error', 'MD_EMPTY', `${relPath} is empty`));
  }
  if (!content.includes(GROUND_TRUTH_MARKER)) {
    issues.push(issue('warning', 'MD_NO_MARKER', `${relPath} missing ground-truth marker`));
  }
  for (const marker of STUB_MARKERS) {
    if (content.includes(marker)) {
      issues.push(issue('error', 'MD_STUB', `${relPath} contains stub text: ${marker}`));
    }
  }
  for (const section of requiredSections) {
    if (!content.includes(section)) {
      issues.push(issue('error', 'MD_SECTION', `${relPath} missing section: ${section}`));
    }
  }

  return { path: relPath, exists: true, valid: issues.filter(i => i.severity === 'error').length === 0, issues };
}

export function validateConfig(workspaceDir: string): ArtifactValidation {
  const relPath = '.ai/config.json';
  const fullPath = path.join(workspaceDir, relPath);
  const issues: ValidationIssue[] = [];

  if (!fs.existsSync(fullPath)) {
    return { path: relPath, exists: false, valid: false, issues: [issue('error', 'CFG_MISSING', 'config.json not found')] };
  }

  const raw = fs.readFileSync(fullPath, 'utf8');
  const config = JSON.parse(raw) as Record<string, unknown>;

  if (config.openaiKey || config.anthropicKey) {
    issues.push(issue('error', 'CFG_SECRET', 'API keys must not be persisted in config.json'));
  }
  if (!config.provider) {
    issues.push(issue('error', 'CFG_PROVIDER', 'config.json missing provider field'));
  }

  return { path: relPath, exists: true, valid: issues.filter(i => i.severity === 'error').length === 0, issues };
}

export function validateExport(workspaceDir: string): ArtifactValidation {
  const relPath = '.cursorrules';
  const fullPath = path.join(workspaceDir, relPath);
  const issues: ValidationIssue[] = [];

  if (!fs.existsSync(fullPath)) {
    return { path: relPath, exists: false, valid: false, issues: [issue('error', 'EXPORT_MISSING', '.cursorrules not found')] };
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  if (!content.includes('EXPORTED FROM AI-WORKSPACE')) {
    issues.push(issue('error', 'EXPORT_HEADER', '.cursorrules missing export header'));
  }
  if (!content.includes('Development Rules')) {
    issues.push(issue('warning', 'EXPORT_CONTENT', '.cursorrules may not include rules content'));
  }

  return { path: relPath, exists: true, valid: issues.filter(i => i.severity === 'error').length === 0, issues };
}

export function validateAgentsStructure(workspaceDir: string): ArtifactValidation {
  const relPath = '.agents/skills/index.json';
  const fullPath = path.join(workspaceDir, relPath);
  const issues: ValidationIssue[] = [];

  if (!fs.existsSync(fullPath)) {
    return { path: relPath, exists: false, valid: false, issues: [issue('warning', 'SKILLS_MISSING', 'skills index not found')] };
  }

  try {
    const data = fs.readJSONSync(fullPath) as { skills?: unknown };
    if (!Array.isArray(data.skills)) {
      issues.push(issue('warning', 'SKILLS_SCHEMA', 'skills index missing skills array'));
    }
  } catch {
    issues.push(issue('error', 'SKILLS_INVALID', 'skills index is not valid JSON'));
  }

  return { path: relPath, exists: true, valid: issues.filter(i => i.severity === 'error').length === 0, issues };
}

export function validateAllArtifacts(workspaceDir: string): ArtifactValidation[] {
  return [
    validateConfig(workspaceDir),
    validateRepoContext(workspaceDir),
    validateRepoMap(workspaceDir),
    validateMarkdownDoc(workspaceDir, '.ai/project.md', ['# Project Summary', '## Tech Stack']),
    validateMarkdownDoc(workspaceDir, '.ai/architecture.md', ['# Architecture']),
    validateMarkdownDoc(workspaceDir, '.ai/rules.md', ['# Development Rules']),
    validateExport(workspaceDir),
    validateAgentsStructure(workspaceDir),
    validateState(workspaceDir),
  ];
}

export function validateState(workspaceDir: string): ArtifactValidation {
  const relPath = '.ai/context/state.json';
  const fullPath = path.join(workspaceDir, relPath);
  const issues: ValidationIssue[] = [];

  if (!fs.existsSync(fullPath)) {
    return { path: relPath, exists: false, valid: false, issues: [issue('warning', 'STATE_MISSING', 'state.json not found after generate')] };
  }

  try {
    const state = fs.readJSONSync(fullPath) as Record<string, unknown>;
    if (typeof state.repoHash !== 'string' || !/^[a-f0-9]{7}$/.test(state.repoHash)) {
      issues.push(issue('error', 'STATE_HASH', 'state.json repoHash invalid'));
    }
  } catch {
    issues.push(issue('error', 'STATE_INVALID', 'state.json is not valid JSON'));
  }

  return { path: relPath, exists: true, valid: issues.filter(i => i.severity === 'error').length === 0, issues };
}

export function validateDetection(
  context: RepoContext | null,
  fixture: FixtureManifestEntry
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!context) {
    issues.push(issue('error', 'DETECT_NO_CONTEXT', 'Cannot validate detection without context'));
    return issues;
  }

  for (const fw of fixture.expectedFrameworks) {
    if (!context.frameworks.includes(fw)) {
      issues.push(issue('warning', 'DETECT_FRAMEWORK', `Expected framework "${fw}" not detected`));
    }
  }
  for (const mod of fixture.expectedModules) {
    if (!context.modules.includes(mod)) {
      issues.push(issue('warning', 'DETECT_MODULE', `Expected module "${mod}" not detected`));
    }
  }
  for (const pat of fixture.expectedPatterns) {
    if (!context.patterns.includes(pat)) {
      issues.push(issue('warning', 'DETECT_PATTERN', `Expected pattern "${pat}" not detected`));
    }
  }

  return issues;
}

export function deriveVerdict(
  fixture: FixtureManifestEntry,
  errors: string[],
  detectionIssues: ValidationIssue[]
): 'PASS' | 'PARTIAL' | 'FAIL' {
  if (errors.length > 0) return 'FAIL';
  const detectionWarnings = detectionIssues.filter(i => i.severity === 'warning');
  if (fixture.verdict === 'PARTIAL' || detectionWarnings.length > 0) return 'PARTIAL';
  return 'PASS';
}
