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

      await fs.ensureDir(aiDir);
      await fs.ensureDir(path.join(aiDir, 'context'));
      await fs.ensureDir(path.join(aiDir, 'decisions'));

      const standardSkillsDir = path.join(rootDir, '.agents', 'skills');
      const legacySkillsDir = path.join(aiDir, 'skills');

      await fs.ensureDir(standardSkillsDir);
      await fs.ensureDir(path.join(rootDir, '.agents', 'rules'));
      await fs.ensureDir(path.join(rootDir, '.agents', 'workflows'));
      await fs.ensureDir(path.join(rootDir, '.cursor', 'rules'));

      // Migration Logic
      if (fs.existsSync(legacySkillsDir) && !fs.existsSync(path.join(standardSkillsDir, 'index.json'))) {
        console.log('Migrating legacy skills from .ai/skills to .agents/skills...');
        const legacyIndex = path.join(legacySkillsDir, 'index.json');
        if (fs.existsSync(legacyIndex)) {
          const indexData = await fs.readJSON(legacyIndex);
          for (const skill of indexData.skills || []) {
            const legacyFile = path.join(legacySkillsDir, skill.path);
            if (fs.existsSync(legacyFile)) {
              const skillName = skill.name.toLowerCase().replace(/\s+/g, '-');
              const newFolder = path.join(standardSkillsDir, skillName);
              await fs.ensureDir(newFolder);
              await fs.copy(legacyFile, path.join(newFolder, 'SKILL.md'));
            }
          }
          await fs.copy(legacyIndex, path.join(standardSkillsDir, 'index.json'));
          console.log('Migration complete. You can now delete .ai/skills manually.');
        }
      }

      // Ensure index.json exists in standard location
      const skillsIndexPath = path.join(standardSkillsDir, 'index.json');
      if (!fs.existsSync(skillsIndexPath)) {
        await fs.writeJSON(skillsIndexPath, { skills: [] }, { spaces: 2 });
      }

      const agentMode = !options.user && isAgentEnvironment();
      console.log(`[Mode: ${agentMode ? 'AI Agent' : 'User'}]`);

      // First check for Agent
      if (agentMode) {
        console.log('\n[Agent Detected] Running automatic analysis and handoff...\n');

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
        console.log('3. Generate relevant SKILL.md folders in .agents/skills/ if needed.');
        console.log('4. Define custom Rules in .agents/rules/ and Workflows in .agents/workflows/.');
        console.log('5. Use .cursor/rules/ for IDE-specific guidance.');
        console.log('-----------------------------');
        return;
      }

      // Human Interactive Flow
      console.log('Could not detect AI Assistant\n\n');
      console.log('To seamlessly initialize your workspace, please copy and paste the following prompt into your AI assistant:\n');
      console.log('\x1b[36m%s\x1b[0m', '  "Please run the following command to initialize our AI workspace:');
      console.log('\x1b[36m%s\x1b[0m', '  node ai-workspace init"\n');

      /*
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

      // Config
      const configPath = path.join(aiDir, 'config.json');
      await fs.writeJSON(configPath, {
        provider: answers.provider,
        model: answers.provider === 'openai' ? 'gpt-4' : (answers.provider === 'anthropic' ? 'claude-3-opus-20240229' : 'local'),
        openaiKey: answers.provider === 'openai' ? answers.apiKey : '',
        anthropicKey: answers.provider === 'anthropic' ? answers.apiKey : ''
      }, { spaces: 2 });

      // Default files
      const aiHint = '<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->\n';
      const placeholders = [
        { path: 'project.md', content: aiHint + '# Project Summary\n\nRun "ai-workspace generate" to populate this.\n' },
        { path: 'architecture.md', content: aiHint + '# Architecture\n\nRun "ai-workspace generate" to populate this.\n' },
        { path: 'rules.md', content: aiHint + '# Rules\n\nRun "ai-workspace generate" to populate this.\n' }
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
      */

    } catch (error) {
      console.error('Error initializing ai-workspace:', error);
      process.exit(1);
    }
  });
