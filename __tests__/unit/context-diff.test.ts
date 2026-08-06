import { diffContexts } from '../../src/context/diff';
import { ScannerResult } from '../../src/analyzer/repoScanner';

describe('diffContexts', () => {
  const base: ScannerResult = {
    languages: ['typescript'],
    frameworks: ['express'],
    entrypoints: ['src/index.ts'],
    modules: ['controllers'],
    patterns: [],
  };

  it('detects added modules', () => {
    const updated: ScannerResult = { ...base, modules: ['controllers', 'services'] };
    const diff = diffContexts(base, updated);

    expect(diff.addedModules).toEqual(['services']);
    expect(diff.removedModules).toEqual([]);
    expect(diff.structureChanged).toBe(true);
  });

  it('detects removed frameworks', () => {
    const updated: ScannerResult = { ...base, frameworks: [] };
    const diff = diffContexts(base, updated);

    expect(diff.removedFrameworks).toEqual(['express']);
    expect(diff.structureChanged).toBe(true);
  });

  it('reports no change when contexts match', () => {
    const diff = diffContexts(base, { ...base });

    expect(diff.structureChanged).toBe(false);
    expect(diff.addedModules).toEqual([]);
    expect(diff.removedModules).toEqual([]);
  });
});
