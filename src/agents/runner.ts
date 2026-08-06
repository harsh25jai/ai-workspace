import fs from 'fs-extra';
import path from 'path';
import { buildLLMPromptContext } from '../context/builder';
import { ProviderFactory } from '../providers/providerFactory';
import { loadProviderConfig } from '../providers/provider';
import { validateArchitecture } from '../validators/architectureValidator';
import { validateRules } from '../validators/rulesValidator';
import { generateRules } from '../generators/ruleGenerator';
import { generateWorkflows } from '../generators/workflowGenerator';
import { ScannerResult } from '../analyzer/repoScanner';

export class AgentRunError extends Error {
  constructor(
    message: string,
    public readonly failures: string[]
  ) {
    super(message);
    this.name = 'AgentRunError';
  }
}

export async function runAgents(rootDir: string): Promise<void> {
  const aiDir = path.join(rootDir, '.ai');
  const contextPath = path.join(aiDir, 'context', 'repo-context.json');

  if (!fs.existsSync(contextPath)) {
    throw new Error('repo-context.json not found. Run analyze first.');
  }

  const config = await loadProviderConfig(rootDir);
  const provider = ProviderFactory.create(config.provider, config);
  const contextData: ScannerResult = await fs.readJSON(contextPath);
  const promptContext = await buildLLMPromptContext(rootDir);

  console.log(`Executing LLM prompts via ${config.provider} (${config.model || 'default'})...`);

  const artifacts = [
    { name: 'project.md', prompt: 'Generate a project overview based on this context.', validator: (c: string): string => c },
    { name: 'architecture.md', prompt: 'Generate architecture documentation based on this context.', validator: (c: string): string => validateArchitecture(c, contextData) },
    { name: 'rules.md', prompt: 'Generate development rules and guidelines based on this context.', validator: (c: string): string => validateRules(c, contextData) },
  ];

  const failures: string[] = [];

  for (const artifact of artifacts) {
    console.log(`- Generating ${artifact.name}...`);
    const fullPrompt = `${artifact.prompt}\n\nREPOSITORY CONTEXT:\n${promptContext}`;

    try {
      let content = await provider.generate(fullPrompt);
      content = artifact.validator(content);
      const aiHint = '<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->\n';
      await fs.writeFile(path.join(aiDir, artifact.name), aiHint + content);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  Error generating ${artifact.name}: ${message}`);
      failures.push(artifact.name);
    }
  }

  console.log('Generating rules and workflows...');

  try {
    await generateRules(rootDir, contextData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  Error generating rules: ${message}`);
    failures.push('rules');
  }

  try {
    await generateWorkflows(rootDir, contextData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  Error generating workflows: ${message}`);
    failures.push('workflows');
  }

  if (failures.length > 0) {
    throw new AgentRunError(
      `Generation failed for: ${failures.join(', ')}`,
      failures
    );
  }

  console.log('Agents completed generating core markdown artifacts, rules, and workflows.');
}
