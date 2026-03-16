import { AIProvider } from './provider';

export class LocalProvider implements AIProvider {
  async generate(prompt: string): Promise<string> {
    console.log('[LocalProvider] Simulating Local (e.g. Ollama) generation...');
    return `Simulated Local Output for prompt length: ${prompt.length}`;
  }
}
