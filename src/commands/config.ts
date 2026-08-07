import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

export const configCommand = new Command('config')
  .description('Configure AI provider settings (API keys via environment variables)')
  .action(async (): Promise<void> => {
    try {
      const cwd = process.cwd();
      const configPath = path.join(cwd, '.ai', 'config.json');

      if (!fs.existsSync(configPath)) {
        console.error('Error: .ai/config.json not found. Run "ctxstack init" first.');
        process.exit(1);
      }

      const currentConfig = await fs.readJSON(configPath);

      console.log('--- Current Configuration ---');
      console.log(`Provider: ${currentConfig.provider}`);
      console.log(`Model: ${currentConfig.model}`);
      console.log('-----------------------------\n');
      console.log('Note: API keys are read from environment variables only.');
      console.log('Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your shell or .env file.\n');

      const answers = await inquirer.prompt<{ provider: string }>([
        {
          type: 'list',
          name: 'provider',
          message: 'Select new AI provider:',
          choices: ['openai', 'anthropic', 'local'],
          default: currentConfig.provider
        }
      ]);

      const updatedConfig = {
        provider: answers.provider,
        model: answers.provider === 'openai' ? 'gpt-4' : (answers.provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'local')
      };

      await fs.writeJSON(configPath, updatedConfig, { spaces: 2 });
      console.log('\nConfiguration updated successfully!');
      console.log('Set your API key via environment variable before running generate --ai.');

    } catch (error) {
      console.error('Error updating config:', error);
      process.exit(1);
    }
  });
