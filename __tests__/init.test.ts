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

describe('init command', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-init-'));
    fs.writeJSONSync(path.join(tmpDir, 'package.json'), { name: 'test', dependencies: {} });
    fs.ensureDirSync(path.join(tmpDir, 'src'));
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  it('creates .ai directory and config.json', () => {
    runCli('init', tmpDir);
    expect(fs.existsSync(path.join(tmpDir, '.ai'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'config.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'context', 'repo-context.json'))).toBe(true);
  });
});
