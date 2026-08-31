import fs from 'fs-extra';
import path from 'path';
import { runCli, runCliOrThrow } from '../helpers/cli';
import { createTempProject, cleanupTempProject } from '../helpers/project';

describe('regenerate command', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempProject(__dirname, '.tmp-regen-', {
      dependencies: { express: '^4' },
      modules: ['controllers'],
    });
    runCliOrThrow(['init'], tmpDir);
    runCliOrThrow(['analyze'], tmpDir);
    runCliOrThrow(['generate'], tmpDir);
  });

  afterEach(() => {
    cleanupTempProject(tmpDir);
  });

  it('forces rebuild even when hash is unchanged', () => {
    const projectPath = path.join(tmpDir, '.ctxstack', 'project.md');
    const original = fs.readFileSync(projectPath, 'utf8');

    fs.writeFileSync(projectPath, '# Corrupted content\n');

    runCliOrThrow(['regenerate'], tmpDir);

    const restored = fs.readFileSync(projectPath, 'utf8');
    expect(restored).not.toBe('# Corrupted content\n');
    expect(restored).toContain('Tech Stack');
    expect(restored.length).toBeGreaterThan(original.length * 0.5);
  });

  it('exits with error when context is missing', () => {
    fs.removeSync(path.join(tmpDir, '.ctxstack', 'context', 'repo-context.json'));
    const result = runCli(['regenerate'], tmpDir);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('repo-context.json not found');
  });
});
