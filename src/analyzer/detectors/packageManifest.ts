import fs from 'fs-extra';
import path from 'path';
import { PackageManifestInfo } from '../types';
import { resolveWorkspaceDirs } from './sourceRoots';

export function readPackageManifest(rootDir: string): PackageManifestInfo | null {
  const pkgPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return null;

  try {
    const pkg = fs.readJSONSync(pkgPath) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
      main?: string;
      bin?: string | Record<string, string>;
      workspaces?: string[] | { packages?: string[] };
    };

    const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const languages: string[] = [];
    if (allDeps['typescript']) languages.push('typescript');
    else if (Object.keys(allDeps).length > 0 || pkg.main) languages.push('javascript');

    let workspaces: string[] | undefined;
    if (Array.isArray(pkg.workspaces)) {
      workspaces = pkg.workspaces;
    } else if (pkg.workspaces && Array.isArray(pkg.workspaces.packages)) {
      workspaces = pkg.workspaces.packages;
    }

    return {
      languages,
      allDeps,
      scripts: pkg.scripts || {},
      main: pkg.main,
      bin: pkg.bin,
      workspaces,
    };
  } catch {
    return null;
  }
}

export function collectWorkspaceDeps(rootDir: string, workspaces: string[]): Record<string, string> {
  const merged: Record<string, string> = {};
  for (const pattern of workspaces) {
    const dirs = resolveWorkspaceDirs(rootDir, pattern);
    for (const dir of dirs) {
      const info = readPackageManifest(dir);
      if (info) Object.assign(merged, info.allDeps);
    }
  }
  return merged;
}
