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

describe('generate command', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-gen-'));
    fs.writeJSONSync(path.join(tmpDir, 'package.json'), {
      name: 'test',
      dependencies: { express: '^4' },
    });
    fs.ensureDirSync(path.join(tmpDir, 'src', 'controllers'));
    runCli('init', tmpDir);
    runCli('analyze', tmpDir);
  });

  afterEach(() => {
    fs.removeSync(tmpDir);
  });

  it('produces real template content, not stub text', () => {
    runCli('generate', tmpDir);
    const projectMd = fs.readFileSync(path.join(tmpDir, '.ai', 'project.md'), 'utf8');
    expect(projectMd).not.toContain('Simulated Local Output');
    expect(projectMd).toContain('Tech Stack');
    expect(projectMd).toContain('Overview');
  });
});
