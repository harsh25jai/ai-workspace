import path from 'path';
import { runCliOrThrow } from '../helpers/cli';
import { createTempProject, cleanupTempProject } from '../helpers/project';

describe('status command', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempProject(__dirname, '.tmp-status-', {
      dependencies: {},
      modules: ['utils'],
    });
  });

  afterEach(() => {
    cleanupTempProject(tmpDir);
  });

  it('reports missing analysis before init', () => {
    const output = runCliOrThrow(['status'], tmpDir);
    expect(output).toContain('Repository analyzed ✘');
    expect(output).toContain('Docs generated ✘');
  });

  it('reports healthy workspace after full pipeline', () => {
    runCliOrThrow(['init'], tmpDir);
    runCliOrThrow(['analyze'], tmpDir);
    runCliOrThrow(['generate'], tmpDir);

    const output = runCliOrThrow(['status'], tmpDir);
    expect(output).toContain('Repository analyzed ✔');
    expect(output).toContain('Docs generated ✔');
    expect(output).toContain('Agent Detected: No');
  });
});
