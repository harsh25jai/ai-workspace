import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';

export async function generateRepoMap(rootDir: string, scannerResult: ScannerResult): Promise<void> {
  const repoMapPath = path.join(rootDir, '.ai', 'repo-map.json');
  
  const mapData = {
    languages: scannerResult.languages,
    entrypoints: scannerResult.entrypoints,
    structure: scannerResult.structure
  };

  await fs.ensureDir(path.dirname(repoMapPath));
  await fs.writeJSON(repoMapPath, mapData, { spaces: 2 });
}
