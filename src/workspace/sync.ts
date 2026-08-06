import fs from 'fs-extra';
import path from 'path';
import { scanRepository } from '../analyzer/repoScanner';
import { generateRepoContext } from '../generators/repoContextGenerator';
import { generateRepoMap } from '../generators/repoMapGenerator';
import { diffContexts } from '../context/diff';
import { generateActionsFromDiff } from './changeDetector';
import { generateSkillsPipeline } from '../skills/generator';
import { generateHash, saveState } from './state';

async function runFullAnalyze(rootDir: string): Promise<void> {
  const scannerResult = await scanRepository(rootDir);
  await generateRepoMap(rootDir, scannerResult);
  await generateRepoContext(rootDir, scannerResult);
}

export async function syncWorkspace(rootDir: string): Promise<void> {
  const aiDir = path.join(rootDir, '.ai');
  const contextPath = path.join(aiDir, 'context', 'repo-context.json');

  if (!fs.existsSync(aiDir)) {
    throw new Error('AI workspace not initialized. Run "ai-workspace init" first.');
  }

  if (!fs.existsSync(contextPath)) {
    console.log('Previous context not found. Running full analyze...');
    await runFullAnalyze(rootDir);
    console.log('Analysis complete. Run "ai-workspace generate" to build documentation.');
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
      await generateSkillsPipeline(rootDir);
    } else if (action.type === 'removeSkill') {
      console.log(`- Removing skill: ${action.module}`);
      const legacySkillFile = path.join(aiDir, 'skills', `${action.module}.skill.md`);
      const agentsSkillDir = path.join(rootDir, '.agents', 'skills', action.module.toLowerCase().replace(/\s+/g, '-'));
      if (fs.existsSync(legacySkillFile)) {
        await fs.remove(legacySkillFile);
      }
      if (fs.existsSync(agentsSkillDir)) {
        await fs.remove(agentsSkillDir);
      }
    }
  }

  await generateRepoContext(rootDir, newScannerResult);

  const updatedContextContent = await fs.readFile(contextPath, 'utf8');
  const newHash = generateHash(updatedContextContent);
  await saveState(rootDir, newHash);

  console.log('\nWorkspace synchronized ✔');
}
