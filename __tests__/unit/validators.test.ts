import { validateArchitecture } from '../../src/validators/architectureValidator';
import { ScannerResult } from '../../src/analyzer/repoScanner';

/**
 * Regression: architectureValidator previously used '\\n' literal instead of '\n',
 * producing malformed output. See Phase 1 fix.
 */
describe('validateArchitecture', () => {
  const context: ScannerResult = {
    languages: ['typescript'],
    frameworks: ['express'],
    entrypoints: [],
    modules: [],
    patterns: [],
  };

  it('preserves real newlines in output (REG-01)', () => {
    const input = 'Line one\nLine two\nLine three';
    const output = validateArchitecture(input, context);

    expect(output).toBe(input);
    expect(output.split('\n')).toHaveLength(3);
    expect(output).not.toContain('\\n');
  });

  it('sanitizes django hallucination when django not in context', () => {
    const input = 'This project uses Django for routing.';
    const output = validateArchitecture(input, context);

    expect(output).toContain('[Sanitized]');
    expect(output).not.toContain('Django');
  });

  it('allows django mention when framework is detected', () => {
    const djangoContext: ScannerResult = { ...context, frameworks: ['django'] };
    const input = 'This project uses Django for routing.';
    const output = validateArchitecture(input, djangoContext);

    expect(output).toBe(input);
  });
});
