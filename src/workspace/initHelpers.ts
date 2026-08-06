import fs from 'fs-extra';
import path from 'path';

export interface InitConfigOptions {
  provider?: string;
  runAnalyze?: boolean;
}

export async function writeDefaultConfig(
  aiDir: string,
  options: { provider: string }
): Promise<void> {
  const configPath = path.join(aiDir, 'config.json');
  const { provider } = options;

  await fs.writeJSON(configPath, {
    provider,
    model: provider === 'openai' ? 'gpt-4' : provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'local',
  }, { spaces: 2 });
}

export async function writePlaceholderDocs(aiDir: string): Promise<void> {
  const aiHint = '<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->\n';
  const placeholders = [
    { path: 'project.md', content: aiHint + '# Project Summary\n\nRun "ai-workspace generate" to populate this.\n' },
    { path: 'architecture.md', content: aiHint + '# Architecture\n\nRun "ai-workspace generate" to populate this.\n' },
    { path: 'rules.md', content: aiHint + '# Rules\n\nRun "ai-workspace generate" to populate this.\n' },
  ];

  for (const p of placeholders) {
    const fullPath = path.join(aiDir, p.path);
    if (!fs.existsSync(fullPath)) {
      await fs.writeFile(fullPath, p.content);
    }
  }
}
