import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';

export async function generateRepoContext(rootDir: string, scannerResult: ScannerResult): Promise<void> {
  const repoContextPath = path.join(rootDir, '.ai', 'context', 'repo-context.json');
  
  const contextData = {
    languages: scannerResult.languages,
    frameworks: scannerResult.frameworks,
    entrypoints: scannerResult.entrypoints,
    modules: scannerResult.modules,
    patterns: scannerResult.patterns
  };

  await fs.ensureDir(path.dirname(repoContextPath));
  await fs.writeJSON(repoContextPath, contextData, { spaces: 2 });
}
