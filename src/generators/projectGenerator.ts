import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';
import { CTXSTACK_DIR } from '../constants';

export async function generateProject(rootDir: string, scannerResult: ScannerResult): Promise<void> {
  const projectPath = path.join(rootDir, CTXSTACK_DIR, 'project.md');
  
  const structure = scannerResult.structure as Record<string, unknown> | undefined;
  const rootDirs = structure
    ? Object.keys(structure).filter((k) => k !== '_files')
    : [];

  const content = `# Project Summary

This project has been analyzed by \`ctxstack\`.

## Detected Languages
${scannerResult.languages.map(l => `- ${l}`).join('\n')}

## Entrypoints
${scannerResult.entrypoints.map(e => `- \`${e}\``).join('\n')}

## Root Directories
${rootDirs.map(d => `- \`${d}/\``).join('\n') || '- (none detected)'}

**Note to AI Agents**:
- Review \`architecture.md\` for system design.
- Review \`repo-map.json\` for exact file layouts.
- Obey the rules defined in \`rules.md\` and the specific \`skills/\`.
`;

  await fs.writeFile(projectPath, content);
}
