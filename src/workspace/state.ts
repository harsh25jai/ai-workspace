import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import { CTXSTACK_DIR } from '../constants';

export interface WorkspaceState {
  repoHash: string;
  lastGenerated: string;
}

export function generateHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 7);
}

export async function saveState(rootDir: string, hash: string): Promise<void> {
  const statePath = path.join(rootDir, CTXSTACK_DIR, 'context', 'state.json');
  const payload: WorkspaceState = {
    repoHash: hash,
    lastGenerated: new Date().toISOString()
  };
  await fs.ensureDir(path.dirname(statePath));
  await fs.writeJSON(statePath, payload, { spaces: 2 });
}

export async function getState(rootDir: string): Promise<WorkspaceState | null> {
  const statePath = path.join(rootDir, CTXSTACK_DIR, 'context', 'state.json');
  if (fs.existsSync(statePath)) {
    try {
      return await fs.readJSON(statePath);
    } catch {
      return null;
    }
  }
  return null;
}
