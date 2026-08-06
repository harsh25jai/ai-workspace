import { execSync } from 'child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const CLI = path.join(__dirname, '..', 'dist', 'cli', 'index.js');

function runCli(args: string, cwd: string): string {
  return execSync(`node "${CLI}" ${args}`, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      AI_AGENT: 'false',
      CURSOR: 'false',
      TERM_PROGRAM: 'dumb',
    },
  });
}

describe('sync command', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-sync-'));
    fs.writeJSONSync(path.join(tmpDir, 'package.json'), { name: 'test', dependencies: {} });
    fs.ensureDirSync(path.join(tmpDir, 'src'));
    runCli('init', tmpDir);
    runCli('analyze', tmpDir);
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  it('updates context when new module is added', () => {
    const contextBefore = fs.readJSONSync(path.join(tmpDir, '.ai', 'context', 'repo-context.json'));
    expect(contextBefore.modules).not.toContain('services');

    fs.ensureDirSync(path.join(tmpDir, 'src', 'services'));
    runCli('sync', tmpDir);

    const contextAfter = fs.readJSONSync(path.join(tmpDir, '.ai', 'context', 'repo-context.json'));
    expect(contextAfter.modules).toContain('services');
  });

  it('runs full analyze when context is missing', () => {
    fs.removeSync(path.join(tmpDir, '.ai', 'context', 'repo-context.json'));
    runCli('sync', tmpDir);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'context', 'repo-context.json'))).toBe(true);
  });
});
