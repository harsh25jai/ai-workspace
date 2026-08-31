import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';
import { generateFromContext } from './templateGenerator';
import { generateRules } from './ruleGenerator';
import { generateWorkflows } from './workflowGenerator';
import { CTXSTACK_DIR } from '../constants';

export async function generateFromTemplates(rootDir: string, contextData: ScannerResult): Promise<void> {
  const aiDir = path.join(rootDir, CTXSTACK_DIR);
  const { projectMd, architectureMd, rulesMd } = generateFromContext(contextData);

  await fs.writeFile(path.join(aiDir, 'project.md'), projectMd);
  await fs.writeFile(path.join(aiDir, 'architecture.md'), architectureMd);
  await fs.writeFile(path.join(aiDir, 'rules.md'), rulesMd);

  await generateRules(rootDir, contextData);
  await generateWorkflows(rootDir, contextData);

  console.log('Generated documentation from repository context (template mode).');
  console.log('  .ctxstack/project.md');
  console.log('  .ctxstack/architecture.md');
  console.log('  .ctxstack/rules.md');
  console.log('Use "ctxstack generate --ai" for LLM-enhanced documentation.');
}
