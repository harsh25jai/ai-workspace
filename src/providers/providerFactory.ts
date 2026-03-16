import { AIProvider } from './provider';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { LocalProvider } from './local';

export class ProviderFactory {
  static create(providerName: string): AIProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'anthropic':
        return new AnthropicProvider();
      case 'local':
        return new LocalProvider();
      default:
        console.warn(`Unknown provider "${providerName}". Falling back to LocalProvider.`);
        return new LocalProvider();
    }
  }
}
