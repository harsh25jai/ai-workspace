import { ScannerResult } from '../analyzer/repoScanner';

export function validateSkill(content: string, context: ScannerResult): string {
  // Example validation rule: 
  // If the skill references a module that does not exist in repo-context via a markdown list bullet
  const lines = content.split('\\n');
  const validLines = [];
  
  for (const line of lines) {
    let keepLine = true;
    
    // Naively checking if a line is a bullet point mentioning a src folder path
    if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
      if (line.includes('src/')) {
        const parts = line.split('/');
        // parts[1] is typically the module name if path is \`src/module_name/... \`
        if (parts.length > 1) {
          const modName = parts[1].replace(/[^a-zA-Z0-9_-]/g, '');
          if (modName && !context.modules.includes(modName)) {
            console.warn(`[Validator] Sanitized hallucinated module reference: ${modName}`);
            keepLine = false; 
          }
        }
      }
    }
    
    if (keepLine) {
      validLines.push(line);
    }
  }

  return validLines.join('\\n');
}
