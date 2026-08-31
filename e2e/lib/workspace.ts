import fs from 'fs-extra';
import path from 'path';
import { E2EContext } from './context';

export function createWorkspaceFromFixture(
  fixtureDir: string,
  workspacesRoot: string,
  fixtureId: string
): string {
  const workspaceDir = path.join(workspacesRoot, fixtureId);
  fs.removeSync(workspaceDir);
  fs.copySync(fixtureDir, workspaceDir, {
    filter: (src) => {
      const base = path.basename(src);
      if (base === '.ctxstack' || base === '.agents' || base === '.cursorrules' || base === '.cursor') {
        return false;
      }
      return true;
    },
  });
  return workspaceDir;
}

export function countSourceFiles(workspaceDir: string): number {
  let count = 0;
  const ignore = new Set(['node_modules', '.git', '.ctxstack', '.agents', 'dist', 'build']);

  function walk(dir: string): void {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignore.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        count += 1;
      }
    }
  }

  walk(workspaceDir);
  return count;
}

export function ensureWorkspacesRoot(ctx: E2EContext): string {
  const root = path.join(ctx.reportsRoot, '..', '.workspaces');
  fs.ensureDirSync(root);
  return root;
}

export function cleanupWorkspaces(ctx: E2EContext): void {
  const root = path.join(ctx.reportsRoot, '..', '.workspaces');
  if (fs.existsSync(root)) {
    fs.removeSync(root);
  }
}
