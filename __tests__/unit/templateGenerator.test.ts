import { generateFromContext } from '../../src/generators/templateGenerator';
import { ScannerResult } from '../../src/analyzer/repoScanner';

const sampleContext: ScannerResult = {
  languages: ['typescript'],
  frameworks: ['express'],
  entrypoints: ['src/index.ts'],
  modules: ['controllers', 'services'],
  patterns: ['controller-service'],
};

describe('generateFromContext', () => {
  it('includes ground-truth marker in all outputs', () => {
    const output = generateFromContext(sampleContext);
    const marker = '<!-- @ground-truth:';

    expect(output.projectMd).toContain(marker);
    expect(output.architectureMd).toContain(marker);
    expect(output.rulesMd).toContain(marker);
  });

  it('includes required project.md sections', () => {
    const { projectMd } = generateFromContext(sampleContext);

    expect(projectMd).toContain('# Project Summary');
    expect(projectMd).toContain('## Overview');
    expect(projectMd).toContain('## Tech Stack');
    expect(projectMd).toContain('typescript');
    expect(projectMd).toContain('express');
  });

  it('includes module tree in architecture.md', () => {
    const { architectureMd } = generateFromContext(sampleContext);

    expect(architectureMd).toContain('# Architecture');
    expect(architectureMd).toContain('controllers/');
    expect(architectureMd).toContain('services/');
    expect(architectureMd).toContain('controller-service');
  });

  it('handles empty context gracefully', () => {
    const empty: ScannerResult = {
      languages: [],
      frameworks: [],
      entrypoints: [],
      modules: [],
      patterns: [],
    };
    const output = generateFromContext(empty);

    expect(output.projectMd).toContain('Unknown');
    expect(output.architectureMd).toContain('(empty)');
    expect(output.rulesMd).toContain('none');
  });
});
