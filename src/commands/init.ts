import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { isAgentEnvironment } from '../utils/agentDetector';
import { scanRepository } from '../analyzer/repoScanner';
import { generateRepoMap } from '../generators/repoMapGenerator';
import { generateRepoContext } from '../generators/repoContextGenerator';

export const initCommand = new Command('init')
  .description('Initialize AI workspace by creating the .ai directory and base structure')
  .option('-u, --user', 'Force interactive user mode (bypass agent detection)')
  .action(async (options) => {
    try {
      const cwd = process.cwd();
      const aiDir = path.join(cwd, '.ai');
      const rootDir = cwd;

      console.log('Initializing ai-workspace...');

      const agentMode = !options.user && isAgentEnvironment();
      console.log(`[Mode: ${agentMode ? 'AI Agent' : 'User'}]`);

      // First check for Agent
      if (agentMode) {
        console.log('\n[Agent Detected] Running automatic analysis and handoff...\n');
        
        await fs.ensureDir(aiDir);
        await fs.ensureDir(path.join(aiDir, 'context'));
        await fs.ensureDir(path.join(aiDir, 'decisions'));
        await fs.ensureDir(path.join(aiDir, 'skills'));

        const scannerResult = await scanRepository(rootDir);
        await generateRepoMap(rootDir, scannerResult);
        await generateRepoContext(rootDir, scannerResult);

        // Place empty files for the agent to fill
        const files = [
          { path: 'project.md', content: '# Project Summary\n\n[TO BE COMPLETED BY AGENT]\n' },
          { path: 'architecture.md', content: '# Architecture\n\n[TO BE COMPLETED BY AGENT]\n' },
          { path: 'rules.md', content: '# Rules\n\n[TO BE COMPLETED BY AGENT]\n' }
        ];

        for (const file of files) {
          const fullPath = path.join(aiDir, file.path);
          if (!fs.existsSync(fullPath)) {
            await fs.writeFile(fullPath, file.content);
          }
        }

        console.log('--- AI AGENT INSTRUCTIONS ---');
        console.log('I am the ai-workspace CLI. Since you are an AI assistant, I have skipped human prompts.');
        console.log('I have analyzed the repo and generated:');
        console.log('  .ai/repo-map.json');
        console.log('  .ai/context/repo-context.json');
        console.log('');
        console.log('YOUR TASK:');
        console.log('1. Read the newly generated context files above.');
        console.log('2. Physically browse the code to fill in the following with EXTREME detail:');
        console.log('   - .ai/project.md (Summarize the business mission and tech stack)');
        console.log('   - .ai/architecture.md (Detail the data flow, layers, and service boundaries)');
        console.log('   - .ai/rules.md (List specific coding standards discovered in this repo)');
        console.log('3. Generate relevant .skill.md files in .ai/skills/ if needed.');
        console.log('-----------------------------');
        return;
      }

      // Human Interactive Flow
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: 'Select an AI provider:',
          choices: ['openai', 'anthropic', 'local']
        },
        {
          type: 'input',
          name: 'apiKey',
          message: 'Enter your API key (leave empty to use env vars later):',
          when: (activeAnswers) => activeAnswers.provider !== 'local'
        },
        {
          type: 'confirm',
          name: 'runAnalyze',
          message: 'Would you like to analyze the repository right now?',
          default: true
        }
      ]);

      await fs.ensureDir(aiDir);
      await fs.ensureDir(path.join(aiDir, 'context'));
      await fs.ensureDir(path.join(aiDir, 'decisions'));
      await fs.ensureDir(path.join(aiDir, 'skills'));

      // Config
      const configPath = path.join(aiDir, 'config.json');
      await fs.writeJSON(configPath, {
        provider: answers.provider,
        model: answers.provider === 'openai' ? 'gpt-4' : (answers.provider === 'anthropic' ? 'claude-3-opus-20240229' : 'local'),
        openaiKey: answers.provider === 'openai' ? answers.apiKey : '',
        anthropicKey: answers.provider === 'anthropic' ? answers.apiKey : ''
      }, { spaces: 2 });

      // Skills index
      const skillsIndexPath = path.join(aiDir, 'skills', 'index.json');
      if (!fs.existsSync(skillsIndexPath)) {
        await fs.writeJSON(skillsIndexPath, { skills: [] }, { spaces: 2 });
      }

      // Default files
      const placeholders = [
        { path: 'project.md', content: '# Project Summary\n\nRun "ai-workspace generate" to populate this.\n' },
        { path: 'architecture.md', content: '# Architecture\n\nRun "ai-workspace generate" to populate this.\n' },
        { path: 'rules.md', content: '# Rules\n\nRun "ai-workspace generate" to populate this.\n' }
      ];

      for (const p of placeholders) {
        const fullPath = path.join(aiDir, p.path);
        if (!fs.existsSync(fullPath)) {
          await fs.writeFile(fullPath, p.content);
        }
      }

      console.log('ai-workspace successfully initialized in .ai/');

      if (answers.runAnalyze) {
        console.log('\nRunning repository analysis...\n');
        const scannerResult = await scanRepository(rootDir);
        await generateRepoMap(rootDir, scannerResult);
        await generateRepoContext(rootDir, scannerResult);
        console.log('Analysis complete. You can now run "ai-workspace generate" to build documentation.');
      }

    } catch (error) {
      console.error('Error initializing ai-workspace:', error);
      process.exit(1);
    }
  });
