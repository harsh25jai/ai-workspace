import fs from 'fs-extra';
import path from 'path';

export interface ProviderConfig {
  provider: string;
  model?: string;
  openaiKey?: string;
  anthropicKey?: string;
}

export interface AIProvider {
  generate(prompt: string): Promise<string>;
}

export async function loadProviderConfig(rootDir: string): Promise<ProviderConfig> {
  const configPath = path.join(rootDir, '.ai', 'config.json');
  const defaults: ProviderConfig = {
    provider: 'local',
    model: 'local',
    openaiKey: '',
    anthropicKey: '',
  };
  if (fs.existsSync(configPath)) {
    return { ...defaults, ...(await fs.readJSON(configPath)) };
  }
  return defaults;
}
