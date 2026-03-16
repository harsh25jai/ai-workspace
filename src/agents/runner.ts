import fs from 'fs-extra';
import path from 'path';
import { buildLLMPromptContext } from '../context/builder';
import { ProviderFactory } from '../providers/providerFactory';
import { validateSkill } from '../validators/skillValidator';
import { validateArchitecture } from '../validators/architectureValidator';
import { validateRules } from '../validators/rulesValidator';

export async function runAgents(rootDir: string): Promise<void> {
  const aiDir = path.join(rootDir, '.ai');
  const contextPath = path.join(aiDir, 'context', 'repo-context.json');
  const configPath = path.join(aiDir, 'config.json');

  if (!fs.existsSync(contextPath)) {
    throw new Error('repo-context.json not found. Run analyze first.');
  }

  // 1. Load Config and Initialize Provider
  let config = { provider: 'local', model: 'default' };
  if (fs.existsSync(configPath)) {
    config = await fs.readJSON(configPath);
  }

  const provider = ProviderFactory.create(config.provider);
  const contextData = await fs.readJSON(contextPath);
  const promptContext = await buildLLMPromptContext(rootDir);

  console.log('--- Context Payload Prepared for LLM ---');
  console.log(promptContext);
  console.log('----------------------------------------');

  console.log(`Executing LLM prompts via ${config.provider} (${config.model || 'default'})...`);

  // 2. Generate Artifacts with Live Provider
  const artifacts = [
    { name: 'project.md', prompt: 'Generate a project overview based on this context.', validator: (c: string) => c },
    { name: 'architecture.md', prompt: 'Generate architecture documentation based on this context.', validator: (c: string) => validateArchitecture(c, contextData) },
    { name: 'rules.md', prompt: 'Generate development rules and guidelines based on this context.', validator: (c: string) => validateRules(c, contextData) }
  ];

  for (const artifact of artifacts) {
    console.log(`- Generating ${artifact.name}...`);
    const fullPrompt = `${artifact.prompt}\n\nREPOSITIORY CONTEXT:\n${promptContext}`;
    
    try {
      let content = await provider.generate(fullPrompt);
      content = artifact.validator(content);
      await fs.writeFile(path.join(aiDir, artifact.name), content);
    } catch (err: any) {
      console.error(`  Error generating ${artifact.name}: ${err.message}`);
    }
  }

  console.log('Agents completed generating core markdown artifacts.');
}
