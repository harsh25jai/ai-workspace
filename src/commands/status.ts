import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { getState, generateHash } from '../workspace/state';
import { isAgentEnvironment } from '../utils/agentDetector';

export const statusCommand = new Command('status')
  .description('Display the health and status of the current AI workspace')
  .action(async () => {
    const cwd = process.cwd();
    const aiDir = path.join(cwd, '.ai');
    
    console.log('--- Workspace Status ---');
    console.log(`Agent Detected: ${isAgentEnvironment() ? 'Yes' : 'No'}`);

    // 1. Check Analysis
    const contextPath = path.join(aiDir, 'context', 'repo-context.json');
    if (fs.existsSync(contextPath)) {
      console.log('Repository analyzed ✔');
      
      // 2. Outdated Check
      const state = await getState(cwd);
      if (state) {
         const currentContent = await fs.readFile(contextPath, 'utf8');
         const currentHash = generateHash(currentContent);
         if (currentHash === state.repoHash) {
             console.log('Architecture docs current ✔');
         } else {
             console.log('Architecture docs outdated ⚠ (Context has drifted since last generation)');
         }
      } else {
         console.log('Architecture docs outdated ⚠ (No state file found)');
      }
    } else {
      console.log('Repository analyzed ✘ (Missing repo-context.json)');
    }

    // 3. Check Skills
    const standardSkillsPath = path.join(cwd, '.agents', 'skills', 'index.json');
    const legacySkillsPath = path.join(aiDir, 'skills', 'index.json');
    
    if (fs.existsSync(standardSkillsPath)) {
      console.log('Skills generated ✔ (Standard: .agents/skills)');
    } else if (fs.existsSync(legacySkillsPath)) {
      console.log('Skills generated ⚠ (Legacy: .ai/skills - consider migrating to .agents/skills)');
    } else {
      console.log('Skills generated ✘');
    }

    // 4. Docs Generated
    const docs = ['project.md', 'architecture.md', 'rules.md'];
    let allDocs = true;
    for (const doc of docs) {
      if (!fs.existsSync(path.join(aiDir, doc))) {
        allDocs = false;
        break;
      }
    }
    
    if (allDocs) {
        console.log('Docs generated ✔');
    } else {
        console.log('Docs generated ✘ (Missing core markdown files)');
    }
    
    console.log('------------------------');
  });
