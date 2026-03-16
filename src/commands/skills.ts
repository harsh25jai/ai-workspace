import { Command } from 'commander';
import { generateSkillsPipeline } from '../skills/generator';

export const skillsCommand = new Command('skills')
  .description('Manage auto-discovered skills');

skillsCommand.command('generate')
  .description('Run the skills auto-discovery system')
  .action(async () => {
    const cwd = process.cwd();
    await generateSkillsPipeline(cwd);
  });
