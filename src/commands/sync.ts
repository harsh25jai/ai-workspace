import { Command } from 'commander';
import { syncWorkspace } from '../workspace/sync';

export const syncCommand = new Command('sync')
  .description('Synchronize the .ai workspace with repository changes')
  .action(async () => {
    try {
      const cwd = process.cwd();
      await syncWorkspace(cwd);
    } catch (error: any) {
      console.error(`Error during sync: ${error.message}`);
      process.exit(1);
    }
  });
