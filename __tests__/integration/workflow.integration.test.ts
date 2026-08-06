import fs from 'fs-extra';
import path from 'path';
import { runCliOrThrow, runCli } from '../helpers/cli';
import { createTempProject, cleanupTempProject } from '../helpers/project';

describe('full workflow integration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempProject(__dirname, '.tmp-workflow-', {
      dependencies: { express: '^4' },
      modules: ['controllers'],
      entryFile: 'src/index.ts',
    });
  });

  afterEach(() => {
    cleanupTempProject(tmpDir);
  });

  it('init → analyze → generate → export → status', () => {
    runCliOrThrow(['init'], tmpDir);
    runCliOrThrow(['analyze'], tmpDir);
    runCliOrThrow(['generate'], tmpDir);
    runCliOrThrow(['export'], tmpDir);
    const status = runCliOrThrow(['status'], tmpDir);

    expect(fs.existsSync(path.join(tmpDir, '.ai', 'config.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'context', 'repo-context.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'project.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'architecture.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.ai', 'rules.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.cursorrules'))).toBe(true);

    const context = fs.readJSONSync(path.join(tmpDir, '.ai', 'context', 'repo-context.json'));
    expect(context.frameworks).toContain('express');
    expect(context.modules).toContain('controllers');

    expect(status).toContain('Repository analyzed ✔');
    expect(status).toContain('Docs generated ✔');
  });

  it('generate is idempotent when context unchanged', () => {
    runCliOrThrow(['init'], tmpDir);
    runCliOrThrow(['analyze'], tmpDir);
    runCliOrThrow(['generate'], tmpDir);

    const projectBefore = fs.readFileSync(path.join(tmpDir, '.ai', 'project.md'), 'utf8');
    const mtimeBefore = fs.statSync(path.join(tmpDir, '.ai', 'project.md')).mtimeMs;

    const skipResult = runCli(['generate'], tmpDir);
    expect(skipResult.exitCode).toBe(0);
    expect(skipResult.stdout).toContain('already up to date');

    const projectAfter = fs.readFileSync(path.join(tmpDir, '.ai', 'project.md'), 'utf8');
    expect(projectAfter).toBe(projectBefore);
    expect(fs.statSync(path.join(tmpDir, '.ai', 'project.md')).mtimeMs).toBe(mtimeBefore);
  });
});
