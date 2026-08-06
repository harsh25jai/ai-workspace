import { AIProvider, ProviderConfig } from './provider';

export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(config?: ProviderConfig) {
    this.apiKey = process.env.ANTHROPIC_API_KEY || config?.anthropicKey || '';
    this.model = process.env.ANTHROPIC_MODEL || config?.model || 'claude-3-opus-20240229';
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key missing. Set ANTHROPIC_API_KEY env var or anthropicKey in .ai/config.json.');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json() as { content?: Array<{ text?: string }> };
    return data.content?.[0]?.text || '';
  }
}
