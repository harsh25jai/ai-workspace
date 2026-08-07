import { execFileSync } from 'child_process';
import path from 'path';
import { CommandResult } from './types';

const NON_AGENT_ENV: NodeJS.ProcessEnv = {
  AI_AGENT: 'false',
  CURSOR: 'false',
  TERM_PROGRAM: 'dumb',
};

export function resolveBundlePath(repoRoot: string): string {
  const bundlePath = path.join(repoRoot, 'releases', 'ctxstack.js');
  return bundlePath;
}

export function assertBundleExists(bundlePath: string): void {
  const fs = require('fs') as typeof import('fs');
  if (!fs.existsSync(bundlePath)) {
    throw new Error(
      `Bundle not found at ${bundlePath}. Run "npm run bundle" before E2E tests.`
    );
  }
}

export function runBundleCli(
  bundlePath: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv = {}
): CommandResult {
  const command = `node ${path.basename(bundlePath)} ${args.join(' ')}`;
  const start = Date.now();

  try {
    const stdout = execFileSync(process.execPath, [bundlePath, ...args], {
      cwd,
      encoding: 'utf8',
      env: { ...NON_AGENT_ENV, ...env },
      maxBuffer: 10 * 1024 * 1024,
    });
    return {
      command,
      exitCode: 0,
      durationMs: Date.now() - start,
      stdout,
      stderr: '',
    };
  } catch (err: unknown) {
    const e = err as { stdout?: string | Buffer; stderr?: string | Buffer; status?: number };
    return {
      command,
      exitCode: e.status ?? 1,
      durationMs: Date.now() - start,
      stdout: e.stdout?.toString() || '',
      stderr: e.stderr?.toString() || '',
    };
  }
}

export function runBundleCliOrThrow(
  bundlePath: string,
  args: string[],
  cwd: string,
  env: NodeJS.ProcessEnv = {}
): CommandResult {
  const result = runBundleCli(bundlePath, args, cwd, env);
  if (result.exitCode !== 0) {
    throw new Error(
      `Bundle CLI failed: ${result.command}\nstderr: ${result.stderr}\nstdout: ${result.stdout}`
    );
  }
  return result;
}
