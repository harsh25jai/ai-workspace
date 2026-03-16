import { ScannerResult } from '../analyzer/repoScanner';

export function validateArchitecture(content: string, context: ScannerResult): string {
  // If the architecture doc lists frameworks the repo-context doesn't have, sanitize it
  const lines = content.split('\\n');
  
  return lines.map(line => {
    // Basic example: If the line claims we use Django but we are a Node shop
    if (line.toLowerCase().includes('django') && !context.frameworks.includes('django')) {
      console.warn(`[Validator] Sanitized architecture hallucination regarding framework: django`);
       return '> [Sanitized] Content omitted due to hallucination failure.';
    }
    return line;
  }).join('\\n');
}
