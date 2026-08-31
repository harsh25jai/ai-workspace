import fs from 'fs-extra';
import path from 'path';
import { SkillMetadata } from './detector';

export async function loadSkillsIndex(rootDir: string): Promise<SkillMetadata[]> {
  const standardIndex = path.join(rootDir, '.agents', 'skills', 'index.json');
  const legacyIndex = path.join(rootDir, '.ai', 'skills', 'index.json'); // legacy pre-ctxstack dir

  const indexPath = fs.existsSync(standardIndex) ? standardIndex : legacyIndex;
  if (!fs.existsSync(indexPath)) {
    return [];
  }

  try {
    const data = await fs.readJSON(indexPath);
    return data.skills || [];
  } catch {
    return [];
  }
}
