import { AIProvider } from './provider';

export class AnthropicProvider implements AIProvider {
  async generate(prompt: string): Promise<string> {
    console.log('[AnthropicProvider] Simulating Anthropic generation...');
    // In production, this would make a real Anthropic API call
    return `Simulated Anthropic Output for prompt length: ${prompt.length}`;
  }
}
