import { ScannerResult } from '../analyzer/repoScanner';

export function validateArchitecture(content: string, context: ScannerResult): string {
  const lines = content.split('\n');

  return lines.map(line => {
    if (line.toLowerCase().includes('django') && !context.frameworks.includes('django')) {
      console.warn('[Validator] Sanitized architecture hallucination regarding framework: django');
      return '> [Sanitized] Content omitted due to hallucination failure.';
    }
    return line;
  }).join('\n');
}
