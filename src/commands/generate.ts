import { Command } from 'commander';
import { runAgents } from '../agents/runner';

export const generateCommand = new Command('generate')
  .description('Generate documentation via LLM agents')
  .action(async () => {
    const cwd = process.cwd();
    await runAgents(cwd);
  });
