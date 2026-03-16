import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';

export async function generateProject(rootDir: string, scannerResult: ScannerResult): Promise<void> {
  const projectPath = path.join(rootDir, '.ai', 'project.md');
  
  const content = `# Project Summary

This project has been analyzed by \`ai-workspace\`.

## Detected Languages
${scannerResult.languages.map(l => `- ${l}`).join('\n')}

## Entrypoints
${scannerResult.entrypoints.map(e => `- \`${e}\``).join('\n')}

## Root Directories
${Object.keys(scannerResult.structure).filter(k => k !== '_files').map(d => `- \`${d}/\``).join('\n')}

**Note to AI Agents**:
- Review \`architecture.md\` for system design.
- Review \`repo-map.json\` for exact file layouts.
- Obey the rules defined in \`rules.md\` and the specific \`skills/\`.
`;

  await fs.writeFile(projectPath, content);
}
