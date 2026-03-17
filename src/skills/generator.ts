import fs from 'fs-extra';
import path from 'path';
import { detectSkills } from '../skills/detector';

export async function generateSkillsPipeline(rootDir: string): Promise<void> {
  const agentsDir = path.join(rootDir, '.agents');
  const skillsDir = path.join(agentsDir, 'skills');
  
  console.log('Detecting skills from repository context...');
  const detectedSkills = await detectSkills(rootDir);
  
  console.log(`Found ${detectedSkills.length} skills. Generating index.json...`);
  
  // Write index file (Internal tracking)
  const indexPath = path.join(skillsDir, 'index.json');
  await fs.ensureDir(skillsDir);
  await fs.writeJSON(indexPath, { skills: detectedSkills }, { spaces: 2 });
  
  console.log('Simulating LLM generation of SKILL.md folders...');
  
  for (const skill of detectedSkills) {
    const skillFolderName = skill.name.toLowerCase().replace(/\s+/g, '-');
    const skillFolderPath = path.join(skillsDir, skillFolderName);
    const filepath = path.join(skillFolderPath, 'SKILL.md');

    await fs.ensureDir(skillFolderPath);
    
    const simulatedContent = `---
name: ${skill.name}
description: ${skill.name} skill for automated repository management.
type: ${skill.type}
importance: ${skill.importance}
---

# ${skill.name}

## Summary
Auto-generated instructions for ${skill.name} discovery and management.

## Files Handled
${(skill as any).files?.map((f: string) => `- ${f}`).join('\n') || '- (auto-discovered files)'}

## Rules
* Maintain consistency with project ${skill.type} patterns.
* Ensure all changes are validated against repository architecture.
`;
    
    await fs.writeFile(filepath, simulatedContent);
    console.log(`- Generated ${skillFolderName}/SKILL.md`);
  }
  
  console.log('Skills auto-discovery complete.');
}
