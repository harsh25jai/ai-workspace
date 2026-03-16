import { Command } from 'commander';
import { runAgents } from '../agents/runner';
import fs from 'fs-extra';
import path from 'path';
import { getState, generateHash, saveState } from '../workspace/state';

export const generateCommand = new Command('generate')
  .description('Generate documentation via LLM agents')
  .action(async () => {
    const cwd = process.cwd();
    const contextPath = path.join(cwd, '.ai', 'context', 'repo-context.json');
    
    if (!fs.existsSync(contextPath)) {
      console.error('Error: repo-context.json not found. Run analyze first.');
      process.exit(1);
    }
    
    const contextContent = await fs.readFile(contextPath, 'utf8');
    const currentHash = generateHash(contextContent);
    const state = await getState(cwd);
    
    if (state && state.repoHash === currentHash) {
      console.log('Workspace is already up to date matching current repo context (hash unchanged). Skipping generation.');
      console.log('Use "ai-workspace regenerate" to force rebuild.');
      return;
    }
    
    await runAgents(cwd);
    await saveState(cwd, currentHash);
  });
