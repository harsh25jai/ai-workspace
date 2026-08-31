import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { promptConfirm, promptList } from '../utils/prompt';
import { isAgentEnvironment } from '../utils/agentDetector';
import { scanRepository } from '../analyzer/repoScanner';
import { generateRepoMap } from '../generators/repoMapGenerator';
import { generateRepoContext } from '../generators/repoContextGenerator';
import { writeDefaultConfig, writePlaceholderDocs } from '../workspace/initHelpers';
import { CTXSTACK_DIR } from '../constants';

async function runAnalysis(rootDir: string): Promise<void> {
  const scannerResult = await scanRepository(rootDir);
  await generateRepoMap(rootDir, scannerResult);
  await generateRepoContext(rootDir, scannerResult);
}

async function runHumanInit(aiDir: string, rootDir: string): Promise<void> {
  const isInteractive = process.stdin.isTTY === true;

  let provider = 'local';
  let runAnalyze = true;

  if (isInteractive) {
    provider = await promptList(
      'Select an AI provider:',
      ['openai', 'anthropic', 'local'] as const,
      'local'
    );
    runAnalyze = await promptConfirm('Would you like to analyze the repository right now?', true);
  }

  await writeDefaultConfig(aiDir, { provider });
  await writePlaceholderDocs(aiDir);

  console.log('ctxstack successfully initialized in .ctxstack/');
  if (provider !== 'local') {
    console.log('Set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment for generate --ai.');
  }

  if (runAnalyze) {
    console.log('\nRunning repository analysis...\n');
    await runAnalysis(rootDir);
    console.log('Analysis complete. You can now run "ctxstack generate" to build documentation.');
  }
}

export const initCommand = new Command('init')
  .description('Initialize ctxstack by creating the .ctxstack directory and base structure')
  .option('-u, --user', 'Force interactive user mode (bypass agent detection)')
  .action(async (options) => {
    try {
      const cwd = process.cwd();
      const rootDir = cwd;
      const legacyDir = path.join(cwd, '.ai');
      const ctxstackDir = path.join(cwd, CTXSTACK_DIR);
      if (fs.existsSync(legacyDir) && !fs.existsSync(ctxstackDir)) {
        await fs.move(legacyDir, ctxstackDir);
        console.log('Migrated legacy .ai/ directory to .ctxstack/.');
      }
      const aiDir = ctxstackDir;

      await fs.ensureDir(aiDir);
      await fs.ensureDir(path.join(aiDir, 'context'));
      await fs.ensureDir(path.join(aiDir, 'decisions'));

      const standardSkillsDir = path.join(rootDir, '.agents', 'skills');
      const legacySkillsDir = path.join(aiDir, 'skills');

      await fs.ensureDir(standardSkillsDir);
      await fs.ensureDir(path.join(rootDir, '.agents', 'rules'));
      await fs.ensureDir(path.join(rootDir, '.agents', 'workflows'));
      try {
        await fs.ensureDir(path.join(rootDir, '.cursor', 'rules'));
      } catch {
        console.warn('Could not create .cursor/rules directory (optional).');
      }

      if (fs.existsSync(legacySkillsDir) && !fs.existsSync(path.join(standardSkillsDir, 'index.json'))) {
        console.log('Migrating legacy skills from .ctxstack/skills to .agents/skills...');
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
          console.log('Migration complete. You can now delete .ctxstack/skills manually.');
        }
      }

      const skillsIndexPath = path.join(standardSkillsDir, 'index.json');
      if (!fs.existsSync(skillsIndexPath)) {
        await fs.writeJSON(skillsIndexPath, { skills: [] }, { spaces: 2 });
      }

      const agentMode = !options.user && isAgentEnvironment();
      console.log(`[Mode: ${agentMode ? 'AI Agent' : 'User'}]`);

      if (agentMode) {
        console.log('\n[Agent Detected] Running automatic analysis and handoff...\n');

        await writeDefaultConfig(aiDir, { provider: 'local' });
        await runAnalysis(rootDir);
        await writePlaceholderDocs(aiDir);

        const agentPlaceholders = [
          { path: 'project.md', content: '# Project Summary\n\n[TO BE COMPLETED BY AGENT]\n' },
          { path: 'architecture.md', content: '# Architecture\n\n[TO BE COMPLETED BY AGENT]\n' },
          { path: 'rules.md', content: '# Rules\n\n[TO BE COMPLETED BY AGENT]\n' },
        ];

        for (const file of agentPlaceholders) {
          const fullPath = path.join(aiDir, file.path);
          if (!fs.existsSync(fullPath) || (await fs.readFile(fullPath, 'utf8')).includes('Run "ctxstack generate"')) {
            await fs.writeFile(fullPath, file.content);
          }
        }

        console.log('--- AI AGENT INSTRUCTIONS ---');
        console.log('I am the ctxstack CLI. Since you are an AI assistant, I have skipped human prompts.');
        console.log('I have analyzed the repo and generated:');
        console.log('  .ctxstack/repo-map.json');
        console.log('  .ctxstack/context/repo-context.json');
        console.log('');
        console.log('YOUR TASK:');
        console.log('1. Read the newly generated context files above.');
        console.log('2. Physically browse the code to fill in the following with EXTREME detail:');
        console.log('   - .ctxstack/project.md (Summarize the business mission and tech stack)');
        console.log('   - .ctxstack/architecture.md (Detail the data flow, layers, and service boundaries)');
        console.log('   - .ctxstack/rules.md (List specific coding standards discovered in this repo)');
        console.log('3. Generate relevant SKILL.md folders in .agents/skills/ if needed.');
        console.log('4. Define custom Rules in .agents/rules/ and Workflows in .agents/workflows/.');
        console.log('5. Use .cursor/rules/ for IDE-specific guidance.');
        console.log('-----------------------------');
        return;
      }

      await runHumanInit(aiDir, rootDir);
    } catch (error) {
      console.error('Error initializing ctxstack:', error);
      process.exit(1);
    }
  });
