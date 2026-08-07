import fs from 'fs-extra';
import path from 'path';
import { runCli } from '../helpers/cli';
import { createTempProject, cleanupTempProject } from '../helpers/project';

describe('error handling', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempProject(__dirname, '.tmp-errors-', {
      dependencies: {},
      modules: ['utils'],
    });
  });

  afterEach(() => {
    cleanupTempProject(tmpDir);
  });

  it('analyze exits 1 when .ctxstack/ is missing', () => {
    const result = runCli(['analyze'], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('ctxstack init');
  });

  it('generate exits 1 when repo-context.json is missing', () => {
    runCli(['init'], tmpDir);
    fs.removeSync(path.join(tmpDir, '.ctxstack', 'context', 'repo-context.json'));
    const result = runCli(['generate'], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('repo-context.json not found');
  });

  it('generate --ai exits 1 without API key (REG-04)', () => {
    runCli(['init'], tmpDir);
    runCli(['analyze'], tmpDir);

    const result = runCli(['generate', '--ai'], tmpDir, {
      OPENAI_API_KEY: '',
      ANTHROPIC_API_KEY: '',
    });
    expect(result.exitCode).toBe(1);
    expect(result.stderr + result.stdout).toMatch(/API key|Error during generation/i);
  });

  it('export exits 1 when rules.md is missing', () => {
    runCli(['init'], tmpDir);
    runCli(['analyze'], tmpDir);
    runCli(['generate'], tmpDir);

    fs.removeSync(path.join(tmpDir, '.ctxstack', 'rules.md'));
    const result = runCli(['export'], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('rules.md not found');
  });
});
