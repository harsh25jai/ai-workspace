import { AIProvider, ProviderConfig } from './provider';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(config?: ProviderConfig) {
    this.apiKey = process.env.OPENAI_API_KEY || config?.openaiKey || '';
    this.model = process.env.OPENAI_MODEL || config?.model || 'gpt-4';
  }

  async generate(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key missing. Set OPENAI_API_KEY environment variable.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content || '';
  }
}
