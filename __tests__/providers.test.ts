import { OpenAIProvider } from '../src/providers/openai';
import { AnthropicProvider } from '../src/providers/anthropic';
import { LocalProvider } from '../src/providers/local';
import { ProviderFactory } from '../src/providers/providerFactory';

describe('Provider contract', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('OpenAI uses legacy config key when env var is absent', async () => {
    const provider = new OpenAIProvider({ provider: 'openai', openaiKey: 'test-key', model: 'gpt-4' });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'ok' } }] }),
    });

    const result = await provider.generate('test prompt');
    expect(result).toBe('ok');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
      })
    );
  });

  it('OpenAI throws clear error when no key is configured', async () => {
    const provider = new OpenAIProvider({ provider: 'openai' });
    await expect(provider.generate('test')).rejects.toThrow('OpenAI API key missing');
  });

  it('Anthropic throws clear error when no key is configured', async () => {
    const provider = new AnthropicProvider({ provider: 'anthropic' });
    await expect(provider.generate('test')).rejects.toThrow('Anthropic API key missing');
  });

  it('Local provider throws with guidance message', async () => {
    const provider = new LocalProvider();
    await expect(provider.generate('test')).rejects.toThrow('Local provider requires an AI backend');
  });

  it('ProviderFactory passes config to providers', () => {
    const provider = ProviderFactory.create('openai', { provider: 'openai', openaiKey: 'key' });
    expect(provider).toBeInstanceOf(OpenAIProvider);
  });
});
