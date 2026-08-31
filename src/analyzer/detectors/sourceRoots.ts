import fs from 'fs-extra';
import path from 'path';

/** Directories commonly used as application source roots (not only Nest). */
export const SOURCE_ROOT_DIRS = ['src', 'apps', 'app', 'lib'] as const;

export function listExistingSourceRoots(rootDir: string): string[] {
  return SOURCE_ROOT_DIRS.filter((dir) => fs.existsSync(path.join(rootDir, dir)));
}

export function resolveWorkspaceDirs(rootDir: string, pattern: string): string[] {
  if (pattern.endsWith('/*')) {
    const base = path.join(rootDir, pattern.slice(0, -2));
    if (!fs.existsSync(base)) return [];
    return fs.readdirSync(base, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => path.join(base, e.name))
      .filter((d) => fs.existsSync(path.join(d, 'package.json')));
  }
  const resolved = path.join(rootDir, pattern);
  return fs.existsSync(path.join(resolved, 'package.json')) ? [resolved] : [];
}
