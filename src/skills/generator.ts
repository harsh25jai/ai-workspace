import fs from 'fs-extra';
import path from 'path';
import { detectSkills } from '../skills/detector';

export async function generateSkillsPipeline(rootDir: string): Promise<void> {
  const aiDir = path.join(rootDir, '.ai');
  const skillsDir = path.join(aiDir, 'skills');
  
  console.log('Detecting skills from repository context...');
  const detectedSkills = await detectSkills(rootDir);
  
  console.log(`Found ${detectedSkills.length} skills. Generating index.json...`);
  
  // Write index file
  const indexPath = path.join(skillsDir, 'index.json');
  await fs.ensureDir(skillsDir);
  await fs.writeJSON(indexPath, { skills: detectedSkills }, { spaces: 2 });
  
  // Simulate LLM Generation of individual skill files
  console.log('Simulating LLM generation of .skill.md files...');
  
  for (const skill of detectedSkills) {
    const filename = `${skill.name}.skill.md`;
    const filepath = path.join(skillsDir, filename);
    
    const simulatedContent = `Skill: ${skill.name.toUpperCase().replace(/-/g, ' ')}\n\nDescription:\nAuto-generated simulated instructions for configuring and modifying the ${skill.name}.\n\nRules:\n- Generated rule 1\n- Generated rule 2\n`;
    
    await fs.writeFile(filepath, simulatedContent);
    console.log(`- Generated ${filename}`);
  }
  
  console.log('Skills auto-discovery complete.');
}
