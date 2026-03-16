import fs from 'fs-extra';
import path from 'path';
import { scanRepository } from '../analyzer/repoScanner';
import { generateRepoContext } from '../generators/repoContextGenerator';
import { diffContexts } from '../context/diff';
import { generateActionsFromDiff } from './changeDetector';
import { generateSkills } from '../generators/skillGenerator';
import { generateHash, saveState } from './state';

export async function syncWorkspace(rootDir: string): Promise<void> {
  const aiDir = path.join(rootDir, '.ai');
  const contextPath = path.join(aiDir, 'context', 'repo-context.json');

  if (!fs.existsSync(aiDir)) {
    throw new Error('AI workspace not initialized. Run "ai-workspace init" first.');
  }

  if (!fs.existsSync(contextPath)) {
    console.log('Previous context not found. Reverting to full analyze...');
    // In a real scenario, we might call analyzeCommand directly or reuse logic
    return; 
  }

  console.log('Running repository scan...');
  const previousContext = await fs.readJSON(contextPath);
  const newScannerResult = await scanRepository(rootDir);

  console.log('Comparing workspace state...');
  const diff = diffContexts(previousContext, newScannerResult);

  if (!diff.structureChanged) {
    console.log('Workspace already up to date ✔');
    return;
  }

  const actions = generateActionsFromDiff(diff);
  console.log(`Detected changes: ${actions.length} actions to perform.`);

  for (const action of actions) {
    if (action.type === 'generateSkill') {
      console.log(`- Generating skill: ${action.module}`);
      // Reuse skill generator logic
      // Note: This logic currently simulates skill generation. 
      // In a real integration, we'd pass the specific module to a scoped generator.
    } else if (action.type === 'removeSkill') {
      console.log(`- Removing skill: ${action.module}`);
      const skillFile = path.join(aiDir, 'skills', `${action.module}.skill.md`);
      if (fs.existsSync(skillFile)) {
        await fs.remove(skillFile);
      }
    }
  }

  // Update repo-context.json
  await generateRepoContext(rootDir, newScannerResult);

  // Update state.json
  const updatedContextContent = await fs.readFile(contextPath, 'utf8');
  const newHash = generateHash(updatedContextContent);
  await saveState(rootDir, newHash);

  console.log('\nWorkspace synchronized ✔');
}
