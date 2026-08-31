import fs from 'fs-extra';
import path from 'path';
import { BootstrapInfo, PackageManifestInfo } from '../types';
import { listExistingSourceRoots, resolveWorkspaceDirs } from './sourceRoots';

const ENTRY_NAMES = new Set(['index', 'main', 'app', 'server', 'page', 'layout']);
const ENTRY_EXTS = new Set(['.ts', '.js', '.tsx', '.jsx', '.mjs', '.cjs']);
const SCRIPT_KEYS = ['start', 'dev', 'serve'];

export function detectEntrypoints(
  rootDir: string,
  manifest: PackageManifestInfo | null,
  ignorePatterns: Set<string>
): { entrypoints: string[]; bootstrap: BootstrapInfo } {
  const entrypoints = new Set<string>();
  const bootstrap: BootstrapInfo = {};

  if (manifest?.main) {
    entrypoints.add(normalizeRel(manifest.main));
    bootstrap.main = normalizeRel(manifest.main);
  }

  if (manifest?.bin) {
    if (typeof manifest.bin === 'string') {
      entrypoints.add(normalizeRel(manifest.bin));
    } else {
      for (const target of Object.values(manifest.bin)) {
        entrypoints.add(normalizeRel(target));
      }
    }
  }

  const startScripts: string[] = [];
  if (manifest?.scripts) {
    for (const key of SCRIPT_KEYS) {
      if (manifest.scripts[key]) startScripts.push(key);
    }
    if (startScripts.length > 0) bootstrap.startScripts = startScripts;
  }

  for (const rootName of listExistingSourceRoots(rootDir)) {
    scanDirForEntrypoints(path.join(rootDir, rootName), rootDir, ignorePatterns, entrypoints, 0, 3);
  }

  if (manifest?.workspaces) {
    for (const pattern of manifest.workspaces) {
      scanWorkspaceEntrypoints(rootDir, pattern, ignorePatterns, entrypoints);
    }
  }

  return { entrypoints: [...entrypoints].sort(), bootstrap };
}

function scanWorkspaceEntrypoints(
  rootDir: string,
  pattern: string,
  ignorePatterns: Set<string>,
  entrypoints: Set<string>
): void {
  const dirs = resolveWorkspaceDirs(rootDir, pattern);

  for (const pkgDir of dirs) {
    for (const rootName of listExistingSourceRoots(pkgDir)) {
      scanDirForEntrypoints(path.join(pkgDir, rootName), rootDir, ignorePatterns, entrypoints, 0, 3);
    }
    const pkgMain = readPackageMain(pkgDir);
    if (pkgMain) entrypoints.add(path.relative(rootDir, path.join(pkgDir, pkgMain)));
  }
}

function scanDirForEntrypoints(
  dir: string,
  rootDir: string,
  ignorePatterns: Set<string>,
  entrypoints: Set<string>,
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
      const ext = path.extname(entry.name);
      const base = path.basename(entry.name, ext);
      if (ENTRY_NAMES.has(base) && ENTRY_EXTS.has(ext)) {
        entrypoints.add(path.relative(rootDir, full));
      }
    } else if (entry.isDirectory()) {
      scanDirForEntrypoints(full, rootDir, ignorePatterns, entrypoints, depth + 1, maxDepth);
    }
  }
}

function readPackageMain(pkgDir: string): string | null {
  try {
    const pkg = fs.readJSONSync(path.join(pkgDir, 'package.json')) as { main?: string };
    return pkg.main || null;
  } catch {
    return null;
  }
}

function normalizeRel(p: string): string {
  return p.replace(/^\.\//, '');
}
