import { Command } from 'commander';
import { initCommand } from '../commands/init';
import { analyzeCommand } from '../commands/analyze';
import { generateCommand } from '../commands/generate';
import { skillsCommand } from '../commands/skills';
import { regenerateCommand } from '../commands/regenerate';

const program = new Command();

program
  .name('ai-workspace')
  .description('CLI to convert a repository into an AI-ready workspace (v2)')
  .version('2.0.0');

program.addCommand(initCommand);
program.addCommand(analyzeCommand);
program.addCommand(generateCommand);
program.addCommand(skillsCommand);
program.addCommand(regenerateCommand);

program.parse();
