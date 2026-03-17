import { Command } from 'commander';
import * as dotenv from 'dotenv';

dotenv.config();
import { initCommand } from '../commands/init';
import { analyzeCommand } from '../commands/analyze';
import { generateCommand } from '../commands/generate';
import { skillsCommand } from '../commands/skills';
import { regenerateCommand } from '../commands/regenerate';
import { statusCommand } from '../commands/status';
import { syncCommand } from '../commands/sync';
import { configCommand } from '../commands/config';
import { exportCommand } from '../commands/export';

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
program.addCommand(statusCommand);
program.addCommand(syncCommand);
program.addCommand(configCommand);
program.addCommand(exportCommand);

program.parse();
