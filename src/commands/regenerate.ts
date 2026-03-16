import { Command } from 'commander';
import { runAgents } from '../agents/runner';
import fs from 'fs-extra';
import path from 'path';
import { generateHash, saveState } from '../workspace/state';
import { isAgentEnvironment } from '../utils/agentDetector';

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
    
    const agentMode = isAgentEnvironment();
    if (agentMode) {
      console.log('\n[Agent Detected] Switching to Handoff Mode...\n');
      console.log('--- AI AGENT INSTRUCTIONS ---');
      console.log('The user has requested a REGENERATE of the workspace.');
      console.log('I have already refreshed the static analysis contexts.');
      console.log('');
      console.log('YOUR TASK:');
      console.log('1. Read .ai/repo-map.json and .ai/context/repo-context.json.');
      console.log('2. Rewrite the following files with updated details from the codebase:');
      console.log('   - .ai/project.md');
      console.log('   - .ai/architecture.md');
      console.log('   - .ai/rules.md');
      console.log('3. Update relevant .skill.md files if the project patterns have changed.');
      console.log('-----------------------------');
    } else {
      await runAgents(cwd);
    }

    await saveState(cwd, currentHash);
    
    console.log('Regeneration complete.');
  });
