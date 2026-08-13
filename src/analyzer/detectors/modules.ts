import fs from 'fs-extra';
import path from 'path';
import { listExistingSourceRoots } from './sourceRoots';

const MODULE_FILE_PATTERNS = [/\.module\.ts$/, /\.controller\.ts$/, /\.service\.ts$/];

const FILE_CONVENTIONS: Array<{ pattern: RegExp; convention: string }> = [
  { pattern: /\.module\.(ts|js)$/, convention: 'decorated-modules' },
  { pattern: /\.provider\.(ts|js)$/, convention: 'provider-registration' },
];

export function detectModules(rootDir: string, ignorePatterns: Set<string>): string[] {
  const modules = new Set<string>();

  for (const rootName of listExistingSourceRoots(rootDir)) {
    const rootPath = path.join(rootDir, rootName);
    if (rootName === 'app') {
      // Next.js app router: treat app/ as a single module bucket
      modules.add('app');
      continue;
    }

    for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
      if (ignorePatterns.has(entry.name)) continue;
      if (entry.isDirectory()) {
        modules.add(rootName === 'src' ? entry.name : `${rootName}/${entry.name}`);
      }
    }
    collectConventionModules(rootPath, rootDir, rootName, modules, ignorePatterns, 0, 2);
  }

  return [...modules].sort();
}

/** File-naming conventions that imply architecture (framework-agnostic). */
export function detectConventions(rootDir: string, ignorePatterns: Set<string>): string[] {
  const found = new Set<string>();

  for (const rootName of listExistingSourceRoots(rootDir)) {
    walkConventions(path.join(rootDir, rootName), ignorePatterns, found, 0, 4);
  }

  const workspaces = path.join(rootDir, 'packages');
  if (fs.existsSync(workspaces)) {
    for (const entry of fs.readdirSync(workspaces, { withFileTypes: true })) {
      if (!entry.isDirectory() || ignorePatterns.has(entry.name)) continue;
      walkConventions(path.join(workspaces, entry.name), ignorePatterns, found, 0, 4);
    }
  }

  return [...found].sort();
}

function walkConventions(
  dir: string,
  ignorePatterns: Set<string>,
  found: Set<string>,
  depth: number,
  maxDepth: number
): void {
  if (depth > maxDepth) return;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (ignorePatterns.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isFile()) {
      for (const { pattern, convention } of FILE_CONVENTIONS) {
        if (pattern.test(entry.name)) found.add(convention);
      }
    } else if (entry.isDirectory()) {
      walkConventions(full, ignorePatterns, found, depth + 1, maxDepth);
    }
  }
}

function collectConventionModules(
  dir: string,
  rootDir: string,
  rootName: string,
  modules: Set<string>,
  ignorePatterns: Set<string>,
  depth: number,
  maxDepth: number
): void {
  if (depth > maxDepth) return;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (ignorePatterns.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isFile() && MODULE_FILE_PATTERNS.some((re) => re.test(entry.name))) {
      const parent = path.basename(path.dirname(full));
      if (parent !== rootName && parent !== '.') {
        modules.add(rootName === 'src' ? parent : `${rootName}/${parent}`);
      }
    } else if (entry.isDirectory()) {
      collectConventionModules(full, rootDir, rootName, modules, ignorePatterns, depth + 1, maxDepth);
    }
  }
}
