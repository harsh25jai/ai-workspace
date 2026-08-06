import { AIProvider } from './provider';

export class LocalProvider implements AIProvider {
  async generate(prompt: string): Promise<string> {
    throw new Error(
      'Local provider requires an AI backend (e.g. Ollama). ' +
      'Use "ai-workspace generate" without --ai for template-based docs, ' +
      'or configure OpenAI/Anthropic in .ai/config.json for --ai mode.'
    );
  }
}
