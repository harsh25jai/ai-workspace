import { Command } from 'commander';
import { runAgents } from '../agents/runner';
import fs from 'fs-extra';
import path from 'path';
import { generateHash, saveState } from '../workspace/state';

export const regenerateCommand = new Command('regenerate')
  .description('Force rebuild the workspace skipping hash checks')
  .action(async () => {
    const cwd = process.cwd();
    const contextPath = path.join(cwd, '.ai', 'context', 'repo-context.json');
    
    if (!fs.existsSync(contextPath)) {
      console.error('Error: repo-context.json not found. Run analyze first.');
      process.exit(1);
    }
    
    console.log('Force regenerating workspace...');
    
    const contextContent = await fs.readFile(contextPath, 'utf8');
    const currentHash = generateHash(contextContent);
    
    await runAgents(cwd);
    await saveState(cwd, currentHash);
    
    console.log('Regeneration complete.');
  });
