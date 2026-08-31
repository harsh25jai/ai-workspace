import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';
import { CTXSTACK_DIR } from '../constants';

function buildContextPayload(scannerResult: ScannerResult): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    version: scannerResult.version ?? 1,
    languages: scannerResult.languages,
    frameworks: scannerResult.frameworks,
    entrypoints: scannerResult.entrypoints,
    modules: scannerResult.modules,
    patterns: scannerResult.patterns,
  };

  if (scannerResult.layout) payload.layout = scannerResult.layout;
  if (scannerResult.packages?.length) payload.packages = scannerResult.packages;
  if (scannerResult.httpAdapters?.length) payload.httpAdapters = scannerResult.httpAdapters;
  if (scannerResult.bootstrap && Object.keys(scannerResult.bootstrap).length > 0) {
    payload.bootstrap = scannerResult.bootstrap;
  }
  if (scannerResult.analysisDepth) payload.analysisDepth = scannerResult.analysisDepth;

  return payload;
}

export async function generateRepoContext(rootDir: string, scannerResult: ScannerResult): Promise<void> {
  const repoContextPath = path.join(rootDir, CTXSTACK_DIR, 'context', 'repo-context.json');
  await fs.ensureDir(path.dirname(repoContextPath));
  await fs.writeJSON(repoContextPath, buildContextPayload(scannerResult), { spaces: 2 });
}
