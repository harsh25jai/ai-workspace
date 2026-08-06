import { Command } from 'commander';
import { runAgents } from '../agents/runner';
import { generateFromTemplates } from '../generators/templateRunner';
import fs from 'fs-extra';
import path from 'path';
import { getState, generateHash, saveState } from '../workspace/state';
import { ScannerResult } from '../analyzer/repoScanner';

export const generateCommand = new Command('generate')
  .description('Generate documentation from repository context (template mode by default)')
  .option('--ai', 'Use LLM providers for enhanced documentation generation')
  .action(async (options: { ai?: boolean }) => {
    const cwd = process.cwd();
    const contextPath = path.join(cwd, '.ai', 'context', 'repo-context.json');

    if (!fs.existsSync(contextPath)) {
      console.error('Error: repo-context.json not found. Run analyze first.');
      process.exit(1);
    }

    const contextContent = await fs.readFile(contextPath, 'utf8');
    const currentHash = generateHash(contextContent);
    const state = await getState(cwd);

    if (state && state.repoHash === currentHash && !options.ai) {
      console.log('Workspace is already up to date matching current repo context (hash unchanged). Skipping generation.');
      console.log('Use "ai-workspace regenerate" to force rebuild.');
      return;
    }

    if (options.ai) {
      await runAgents(cwd);
    } else {
      const contextData: ScannerResult = await fs.readJSON(contextPath);
      await generateFromTemplates(cwd, contextData);
    }

    await saveState(cwd, currentHash);
  });
