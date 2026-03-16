import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

export const configCommand = new Command('config')
  .description('Configure AI provider and API keys')
  .action(async () => {
    try {
      const cwd = process.cwd();
      const configPath = path.join(cwd, '.ai', 'config.json');

      if (!fs.existsSync(configPath)) {
        console.error('Error: .ai/config.json not found. Run "ai-workspace init" first.');
        process.exit(1);
      }

      const currentConfig = await fs.readJSON(configPath);

      console.log('--- Current Configuration ---');
      console.log(`Provider: ${currentConfig.provider}`);
      console.log(`Model: ${currentConfig.model}`);
      console.log('-----------------------------\n');

      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: 'Select new AI provider:',
          choices: ['openai', 'anthropic', 'local'],
          default: currentConfig.provider
        },
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter API key (leave empty to keep current or use env):',
          when: (a) => a.provider !== 'local'
        }
      ]);

      const updatedConfig = {
        ...currentConfig,
        provider: answers.provider,
        model: answers.provider === 'openai' ? 'gpt-4' : (answers.provider === 'anthropic' ? 'claude-3-opus-20240229' : 'local')
      };

      if (answers.apiKey) {
        if (answers.provider === 'openai') {
          updatedConfig.openaiKey = answers.apiKey;
        } else if (answers.provider === 'anthropic') {
          updatedConfig.anthropicKey = answers.apiKey;
        }
      }

      await fs.writeJSON(configPath, updatedConfig, { spaces: 2 });
      console.log('\nConfiguration updated successfully! ✔');

    } catch (error) {
      console.error('Error updating config:', error);
      process.exit(1);
    }
  });
