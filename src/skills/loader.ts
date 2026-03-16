import fs from 'fs-extra';
import path from 'path';
import { SkillMetadata } from './detector';

export async function loadSkillsIndex(rootDir: string): Promise<SkillMetadata[]> {
  const indexPath = path.join(rootDir, '.ai', 'skills', 'index.json');
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
