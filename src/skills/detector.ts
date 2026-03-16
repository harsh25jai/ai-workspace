import fs from 'fs-extra';
import path from 'path';

export interface SkillMetadata {
  name: string;
  type: string;
  importance: 'high' | 'medium' | 'low';
}

export async function detectSkills(rootDir: string): Promise<SkillMetadata[]> {
  const contextPath = path.join(rootDir, '.ai', 'context', 'repo-context.json');
  if (!fs.existsSync(contextPath)) {
    throw new Error('repo-context.json not found. Run analyze first.');
  }

  const contextData = await fs.readJSON(contextPath);
  const skills: SkillMetadata[] = [];

  const modules = contextData.modules || [];
  const frameworks = contextData.frameworks || [];
  const patterns = contextData.patterns || [];

  // Simulate an internal detection matrix
  if (modules.includes('controllers') || modules.includes('routes') || frameworks.includes('express')) {
    skills.push({ name: 'rest-api-pattern', type: 'backend', importance: 'high' });
  }

  if (modules.includes('auth') || modules.includes('authentication') || modules.includes('sessions')) {
    skills.push({ name: 'authentication-system', type: 'backend', importance: 'high' });
  }

  if (modules.includes('models') || modules.includes('database') || modules.includes('db')) {
    skills.push({ name: 'database-access-layer', type: 'backend', importance: 'high' });
  }

  if (frameworks.includes('react') || frameworks.includes('vue') || modules.includes('components')) {
    skills.push({ name: 'component-based-ui', type: 'frontend', importance: 'high' });
  }

  // Fallback default
  if (skills.length === 0) {
    skills.push({ name: 'general-architecture', type: 'systems', importance: 'medium' });
  }

  return skills;
}
