import { AIProvider } from './provider';

export class OpenAIProvider implements AIProvider {
  async generate(prompt: string): Promise<string> {
    console.log('[OpenAIProvider] Simulating OpenAI generation...');
    // In production, this would make a real OpenAI API call
    return `Simulated OpenAI Output for prompt length: ${prompt.length}`;
  }
}
