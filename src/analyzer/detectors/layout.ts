import fs from 'fs-extra';
import path from 'path';
import { PackageManifestInfo, RepoLayout, WorkspacePackage } from '../types';
import { readPackageManifest } from './packageManifest';
import { listExistingSourceRoots, resolveWorkspaceDirs } from './sourceRoots';

export function detectLayout(rootDir: string, manifest: PackageManifestInfo | null): RepoLayout {
  const sourceRoots = [...listExistingSourceRoots(rootDir)];
  if (fs.existsSync(path.join(rootDir, 'packages')) && !sourceRoots.includes('packages')) {
    sourceRoots.push('packages');
  }

  if (manifest?.workspaces && manifest.workspaces.length > 0) {
    return {
      type: 'monorepo',
      packageManager: 'npm',
      workspaces: manifest.workspaces,
      sourceRoots: sourceRoots.length > 0 ? sourceRoots : ['packages'],
    };
  }

  return {
    type: 'single-package',
    sourceRoots: sourceRoots.length > 0 ? sourceRoots : undefined,
  };
}

export function detectWorkspacePackages(rootDir: string, workspaces: string[]): WorkspacePackage[] {
  const packages: WorkspacePackage[] = [];

  for (const pattern of workspaces) {
    const dirs = resolveWorkspaceDirs(rootDir, pattern);
    for (const dir of dirs) {
      const info = readPackageManifest(dir);
      if (!info) continue;
      const name = readPackageName(dir);
      if (!name) continue;
      packages.push({
        name,
        path: path.relative(rootDir, dir),
        role: inferPackageRole(name),
      });
    }
  }

  return packages;
}

function readPackageName(pkgDir: string): string | null {
  try {
    const pkg = fs.readJSONSync(path.join(pkgDir, 'package.json')) as { name?: string };
    return pkg.name || null;
  } catch {
    return null;
  }
}

function inferPackageRole(name: string): string {
  if (name.includes('platform-') || name.includes('-adapter')) return 'adapter';
  if (name.startsWith('@') && (name.endsWith('/core') || name.endsWith('/common'))) return 'framework';
  return 'library';
}
