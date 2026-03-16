import { loadSkillsIndex } from './loader';
import { SkillMetadata } from './detector';

export async function getSkillsForFile(rootDir: string, filePath: string): Promise<SkillMetadata[]> {
  const allSkills = await loadSkillsIndex(rootDir);
  const activeSkills: SkillMetadata[] = [];
  
  const normalizedPath = filePath.toLowerCase();
  
  for (const skill of allSkills) {
    let matches = false;
    
    // Very basic heuristic matching for MVP MVP Skill Activator
    if (skill.name === 'authentication-system') {
      if (normalizedPath.includes('auth') || normalizedPath.includes('login') || normalizedPath.includes('user')) {
        matches = true;
      }
    } else if (skill.name === 'rest-api-pattern' || skill.name.includes('express')) {
      if (normalizedPath.includes('controller') || normalizedPath.includes('route') || normalizedPath.includes('api')) {
        matches = true;
      }
    } else if (skill.name === 'database-access-layer') {
      if (normalizedPath.includes('model') || normalizedPath.includes('entity') || normalizedPath.includes('db')) {
        matches = true;
      }
    } else if (skill.name === 'component-based-ui' || skill.name.includes('react')) {
      if (normalizedPath.endsWith('.tsx') || normalizedPath.endsWith('.jsx') || normalizedPath.includes('component')) {
        matches = true;
      }
    } else {
      // General architecture/fallback rules usually apply globally or to core files
      if (skill.type === 'systems' || skill.importance === 'high') {
         matches = true; 
      }
    }

    if (matches) {
      activeSkills.push(skill);
    }
  }

  return activeSkills;
}
