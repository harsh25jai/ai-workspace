import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';
import { generateFromContext } from './templateGenerator';
import { generateRules } from './ruleGenerator';
import { generateWorkflows } from './workflowGenerator';

export async function generateFromTemplates(rootDir: string, contextData: ScannerResult): Promise<void> {
  const aiDir = path.join(rootDir, '.ai');
  const { projectMd, architectureMd, rulesMd } = generateFromContext(contextData);

  await fs.writeFile(path.join(aiDir, 'project.md'), projectMd);
  await fs.writeFile(path.join(aiDir, 'architecture.md'), architectureMd);
  await fs.writeFile(path.join(aiDir, 'rules.md'), rulesMd);

  await generateRules(rootDir, contextData);
  await generateWorkflows(rootDir, contextData);

  console.log('Generated documentation from repository context (template mode).');
  console.log('  .ai/project.md');
  console.log('  .ai/architecture.md');
  console.log('  .ai/rules.md');
  console.log('Use "ai-workspace generate --ai" for LLM-enhanced documentation.');
}
