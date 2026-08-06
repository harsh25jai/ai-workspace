import { OpenAIProvider } from '../src/providers/openai';
import { AnthropicProvider } from '../src/providers/anthropic';

describe('Provider error handling', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  it('OpenAI throws on non-ok API response', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
      json: async () => ({ error: { message: 'Invalid API key' } }),
    });

    const provider = new OpenAIProvider();
    await expect(provider.generate('test')).rejects.toThrow('OpenAI API error: Invalid API key');
  });

  it('OpenAI returns empty string for malformed success response', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const provider = new OpenAIProvider();
    const result = await provider.generate('test');
    expect(result).toBe('');
  });

  it('Anthropic throws on rate limit response', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Too Many Requests',
      json: async () => ({ error: { message: 'Rate limit exceeded' } }),
    });

    const provider = new AnthropicProvider();
    await expect(provider.generate('test')).rejects.toThrow('Anthropic API error: Rate limit exceeded');
  });

  it('Anthropic success path returns content', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ content: [{ text: 'Generated docs' }] }),
    });

    const provider = new AnthropicProvider();
    const result = await provider.generate('test prompt');
    expect(result).toBe('Generated docs');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-api-key': 'test-key' }),
      })
    );
  });
});
