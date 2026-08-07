import { execFileSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { AgentRunError, runAgents } from '../src/agents/runner';

describe('runAgents failure handling', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('throws AgentRunError when provider fails', async () => {
    const tmpDir = fs.mkdtempSync(path.join(__dirname, '.tmp-runner-'));
    const aiDir = path.join(tmpDir, '.ctxstack');
    await fs.ensureDir(path.join(aiDir, 'context'));
    await fs.writeJSON(path.join(aiDir, 'config.json'), { provider: 'openai', model: 'gpt-4' });
    await fs.writeJSON(path.join(aiDir, 'context', 'repo-context.json'), {
      languages: ['typescript'],
      frameworks: [],
      entrypoints: [],
      modules: ['src'],
      patterns: [],
    });

    delete process.env.OPENAI_API_KEY;

    await expect(runAgents(tmpDir)).rejects.toBeInstanceOf(AgentRunError);
    fs.removeSync(tmpDir);
  });
});

describe('explain path security', () => {
  const CLI = path.join(__dirname, '..', 'dist', 'cli', 'index.js');

  it('rejects paths that escape repository root', () => {
    expect(() => {
      execFileSync(process.execPath, [CLI, 'explain', '../../../etc/passwd'], {
        cwd: __dirname,
        encoding: 'utf8',
        env: { ...process.env, AI_AGENT: 'false', CURSOR: 'false', TERM_PROGRAM: 'dumb' },
      });
    }).toThrow();
  });
});
