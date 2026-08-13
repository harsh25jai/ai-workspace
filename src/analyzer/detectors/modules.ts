import fs from 'fs-extra';
import path from 'path';
import { listExistingSourceRoots } from './sourceRoots';

const MODULE_FILE_PATTERNS = [/\.module\.ts$/, /\.controller\.ts$/, /\.service\.ts$/];

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
