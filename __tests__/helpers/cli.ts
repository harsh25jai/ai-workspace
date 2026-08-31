import { execFileSync } from 'child_process';
import path from 'path';

const CLI = path.join(__dirname, '..', '..', 'dist', 'cli', 'index.js');

const NON_AGENT_ENV: NodeJS.ProcessEnv = {
  ...process.env,
  AI_AGENT: 'false',
  CURSOR: 'false',
  TERM_PROGRAM: 'dumb',
};

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function runCli(args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): CliResult {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      cwd,
      encoding: 'utf8',
      env: { ...NON_AGENT_ENV, ...env },
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: e.stdout?.toString() || '',
      stderr: e.stderr?.toString() || '',
      exitCode: e.status ?? 1,
    };
  }
}

export function runCliOrThrow(args: string[], cwd: string, env: NodeJS.ProcessEnv = {}): string {
  const result = runCli(args, cwd, env);
  if (result.exitCode !== 0) {
    throw new Error(`CLI failed (${args.join(' ')}): ${result.stderr || result.stdout}`);
  }
  return result.stdout;
}

export function getCliPath(): string {
  return CLI;
}
