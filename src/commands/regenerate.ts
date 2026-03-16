import { Command } from 'commander';

export const regenerateCommand = new Command('regenerate')
  .description('Rebuild the workspace')
  .action(async () => {
    console.log('regenerate command (to be implemented)');
  });
