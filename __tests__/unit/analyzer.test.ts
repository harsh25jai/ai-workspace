import fs from 'fs-extra';
import path from 'path';
import { scanRepository } from '../../src/analyzer/repoScanner';
import { createTempProject, cleanupTempProject } from '../helpers/project';

describe('scanRepository', () => {
  let tmpDir: string;

  afterEach(() => {
    if (tmpDir) cleanupTempProject(tmpDir);
  });

  it('detects Express and controller-service pattern', async () => {
    tmpDir = createTempProject(__dirname, '.tmp-analyzer-express-', {
      dependencies: { express: '^4' },
      modules: ['controllers', 'services'],
      entryFile: 'src/index.ts',
    });

    const result = await scanRepository(tmpDir);

    expect(result.frameworks).toContain('express');
    expect(result.modules).toEqual(expect.arrayContaining(['controllers', 'services']));
    expect(result.patterns).toContain('controller-service');
    expect(result.entrypoints).toContain('src/index.ts');
    expect(result.languages).toContain('javascript');
  });

  it('detects React and component-based-ui pattern', async () => {
    tmpDir = createTempProject(__dirname, '.tmp-analyzer-react-', {
      dependencies: { react: '^18' },
      modules: ['components'],
    });

    const result = await scanRepository(tmpDir);

    expect(result.frameworks).toContain('react');
    expect(result.patterns).toContain('component-based-ui');
  });

  it('handles empty src/ directory', async () => {
    tmpDir = createTempProject(__dirname, '.tmp-analyzer-empty-', {
      dependencies: {},
    });

    const result = await scanRepository(tmpDir);

    expect(result.modules).toEqual([]);
    expect(result.entrypoints).toEqual([]);
    expect(result.languages).toContain('javascript');
  });

  it('respects .aiignore patterns', async () => {
    tmpDir = createTempProject(__dirname, '.tmp-analyzer-ignore-', {
      modules: ['controllers', 'internal'],
    });
    fs.writeFileSync(path.join(tmpDir, '.aiignore'), 'internal\n');

    const result = await scanRepository(tmpDir);

    expect(result.modules).toContain('controllers');
    expect(result.modules).not.toContain('internal');
  });
});
