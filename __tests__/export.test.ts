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

describe('export command', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-export-'));
    fs.writeJSONSync(path.join(tmpDir, 'package.json'), { name: 'test', dependencies: {} });
    fs.ensureDirSync(path.join(tmpDir, 'src'));
    runCli('init', tmpDir);
    runCli('analyze', tmpDir);
    runCli('generate', tmpDir);
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  it('creates .cursorrules from rules.md', () => {
    runCli('export', tmpDir);
    expect(fs.existsSync(path.join(tmpDir, '.cursorrules'))).toBe(true);
    const content = fs.readFileSync(path.join(tmpDir, '.cursorrules'), 'utf8');
    expect(content).toContain('EXPORTED FROM CTXSTACK');
    expect(content).toContain('Development Rules');
  });
});
