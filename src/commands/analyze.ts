import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { scanRepository } from '../analyzer/repoScanner';
import { generateRepoContext } from '../generators/repoContextGenerator';

export const analyzeCommand = new Command('analyze')
  .description('Scan the repository and build structured context (v2)')
  .action(async () => {
    const cwd = process.cwd();
    const aiDir = path.join(cwd, '.ai');

    if (!fs.existsSync(aiDir)) {
      console.error('Error: .ai directory not found. Please run "ai-workspace init" first.');
      process.exit(1);
    }

    console.log('Analyzing repository (v2)...');
    
    // 1. Scan repository
    const scannerResult = await scanRepository(cwd);
    
    // 2. Generate new repo-context.json
    await generateRepoContext(cwd, scannerResult);
    
    console.log('Analysis complete! Generated .ai/context/repo-context.json');
  });
