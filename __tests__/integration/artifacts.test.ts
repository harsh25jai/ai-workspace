import fs from 'fs-extra';
import path from 'path';
import { runCliOrThrow } from '../helpers/cli';
import { createTempProject, cleanupTempProject } from '../helpers/project';

describe('generated artifacts', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempProject(__dirname, '.tmp-artifacts-', {
      dependencies: { express: '^4', react: '^18' },
      modules: ['controllers', 'components'],
      entryFile: 'src/index.ts',
    });
    runCliOrThrow(['init'], tmpDir);
    runCliOrThrow(['analyze'], tmpDir);
    runCliOrThrow(['generate'], tmpDir);
  });

  afterEach(() => {
    cleanupTempProject(tmpDir);
  });

  it('repo-context.json has required schema fields', () => {
    const context = fs.readJSONSync(path.join(tmpDir, '.ctxstack', 'context', 'repo-context.json'));

    expect(context).toHaveProperty('languages');
    expect(context).toHaveProperty('frameworks');
    expect(context).toHaveProperty('entrypoints');
    expect(context).toHaveProperty('modules');
    expect(context).toHaveProperty('patterns');
    expect(Array.isArray(context.languages)).toBe(true);
    expect(context.frameworks).toEqual(expect.arrayContaining(['express', 'react']));
  });

  it('markdown docs contain required sections and ground-truth marker', () => {
    const docs = ['project.md', 'architecture.md', 'rules.md'] as const;
    const requiredSections: Record<string, string[]> = {
      'project.md': ['# Project Summary', '## Tech Stack'],
      'architecture.md': ['# Architecture', '## Modules'],
      'rules.md': ['# Development Rules', '## Ctxstack'],
    };

    for (const doc of docs) {
      const content = fs.readFileSync(path.join(tmpDir, '.ctxstack', doc), 'utf8');
      expect(content).toContain('<!-- @ground-truth:');
      for (const section of requiredSections[doc]) {
        expect(content).toContain(section);
      }
    }
  });

  it('state.json is written after generate', () => {
    const statePath = path.join(tmpDir, '.ctxstack', 'context', 'state.json');
    expect(fs.existsSync(statePath)).toBe(true);
    const state = fs.readJSONSync(statePath);
    expect(state).toHaveProperty('repoHash');
    expect(state).toHaveProperty('lastGenerated');
    expect(state.repoHash).toMatch(/^[a-f0-9]{7}$/);
  });

  it('export mirrors rules.md content into .cursorrules', () => {
    const rulesMd = fs.readFileSync(path.join(tmpDir, '.ctxstack', 'rules.md'), 'utf8');
    runCliOrThrow(['export'], tmpDir);
    const cursorRules = fs.readFileSync(path.join(tmpDir, '.cursorrules'), 'utf8');

    expect(cursorRules).toContain('EXPORTED FROM CTXSTACK');
    expect(cursorRules).toContain('Development Rules');
    expect(cursorRules).toContain(rulesMd.split('\n').find(l => l.includes('Development Rules')) || '');
  });
});
