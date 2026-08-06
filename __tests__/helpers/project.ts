import fs from 'fs-extra';
import path from 'path';

export interface TempProjectOptions {
  name?: string;
  dependencies?: Record<string, string>;
  modules?: string[];
  entryFile?: string;
}

export function createTempProject(
  baseDir: string,
  prefix: string,
  options: TempProjectOptions = {}
): string {
  const tmpDir = fs.mkdtempSync(path.join(baseDir, prefix));
  fs.writeJSONSync(path.join(tmpDir, 'package.json'), {
    name: options.name || 'test-project',
    dependencies: options.dependencies || {},
  });
  fs.ensureDirSync(path.join(tmpDir, 'src'));
  for (const mod of options.modules || []) {
    fs.ensureDirSync(path.join(tmpDir, 'src', mod));
  }
  if (options.entryFile) {
    fs.writeFileSync(path.join(tmpDir, options.entryFile), '');
  }
  return tmpDir;
}

export function cleanupTempProject(tmpDir: string): void {
  if (tmpDir && fs.existsSync(tmpDir)) {
    fs.removeSync(tmpDir);
  }
}
