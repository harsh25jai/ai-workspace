import { Command } from 'commander';
import { runAgents } from '../agents/runner';
import { generateFromTemplates } from '../generators/templateRunner';
import fs from 'fs-extra';
import path from 'path';
import { generateHash, saveState } from '../workspace/state';
import { isAgentEnvironment } from '../utils/agentDetector';
import { ScannerResult } from '../analyzer/repoScanner';
import { CTXSTACK_DIR } from '../constants';

export const regenerateCommand = new Command('regenerate')
  .description('Force rebuild the workspace skipping hash checks')
  .option('--ai', 'Use LLM providers for enhanced documentation generation')
  .action(async (options: { ai?: boolean }): Promise<void> => {
    const cwd = process.cwd();
    const contextPath = path.join(cwd, CTXSTACK_DIR, 'context', 'repo-context.json');

    if (!fs.existsSync(contextPath)) {
      console.error('Error: repo-context.json not found. Run analyze first.');
      process.exit(1);
    }

    console.log('Force regenerating workspace...');

    const contextContent = await fs.readFile(contextPath, 'utf8');
    const currentHash = generateHash(contextContent);

    const agentMode = isAgentEnvironment();
    if (agentMode) {
      console.log('\n[Agent Detected] Switching to Handoff Mode...\n');
      console.log('--- AI AGENT INSTRUCTIONS ---');
      console.log('The user has requested a REGENERATE of the workspace.');
      console.log('I have already refreshed the static analysis contexts.');
      console.log('');
      console.log('YOUR TASK:');
      console.log('1. Read .ctxstack/repo-map.json and .ctxstack/context/repo-context.json.');
      console.log('2. Rewrite the following files with updated details from the codebase:');
      console.log('   - .ctxstack/project.md');
      console.log('   - .ctxstack/architecture.md');
      console.log('   - .ctxstack/rules.md');
      console.log('3. Update relevant .skill.md files if the project patterns have changed.');
      console.log('-----------------------------');
      await saveState(cwd, currentHash);
      console.log('Regeneration complete.');
      return;
    }

    try {
      if (options.ai) {
        await runAgents(cwd);
      } else {
        const contextData: ScannerResult = await fs.readJSON(contextPath);
        await generateFromTemplates(cwd, contextData);
      }
      await saveState(cwd, currentHash);
      console.log('Regeneration complete.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Error during regeneration: ${message}`);
      process.exit(1);
    }
  });
