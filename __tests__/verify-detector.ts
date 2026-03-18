import { getDetectionInfo, isAgentEnvironment, AGENT_ENV_VARS } from '../src/utils/agentDetector';

describe('Agent Detector', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear only the environment variables we're testing
    delete process.env.TERM_PROGRAM;
    delete process.env.CURSOR;
    delete process.env.ANTIGRAVITY_AGENT;
    delete process.env.__CFBundleIdentifier;
    for (const key of AGENT_ENV_VARS) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    // Restore original env vars
    for (const key in process.env) {
      if (!(key in originalEnv)) {
        delete process.env[key];
      }
    }
    Object.assign(process.env, originalEnv);
  });

  test('default detection (unknown environment)', () => {
    const info = getDetectionInfo();
    expect(info.isAgent).toBe(false);
    expect(info.ide).toBe('other');
    expect(info.activeAgents).toHaveLength(0);
    expect(isAgentEnvironment()).toBe(false);
  });

  test('detects Cursor via TERM_PROGRAM', () => {
    process.env.TERM_PROGRAM = 'cursor';
    const info = getDetectionInfo();
    expect(info.ide).toBe('cursor');
    expect(info.isAgent).toBe(true);
    expect(isAgentEnvironment()).toBe(true);
  });

  test('detects Antigravity via __CFBundleIdentifier', () => {
    process.env.__CFBundleIdentifier = 'com.google.antigravity';
    const info = getDetectionInfo();
    expect(info.ide).toBe('antigravity');
    expect(info.isAgent).toBe(true);
    expect(isAgentEnvironment()).toBe(true);
  });

  test('detects VS Code environment but not as agent by default', () => {
    process.env.TERM_PROGRAM = 'vscode';
    const info = getDetectionInfo();
    expect(info.ide).toBe('vscode');
    expect(info.isAgent).toBe(false);
    expect(isAgentEnvironment()).toBe(false);
  });

  test('detects agent via environment variables', () => {
    process.env.CLAUDE_CODE = 'true';
    const info = getDetectionInfo();
    expect(info.isAgent).toBe(true);
    expect(info.activeAgents).toContain('CLAUDE_CODE');
    expect(isAgentEnvironment()).toBe(true);
  });

  test('treats "false", "0", "off" values as disabled', () => {
    for (const val of ['false', '0', 'off', ' FALSE ', '0 ']) {
      process.env.AI_AGENT = val;
      const info = getDetectionInfo();
      expect(info.isAgent).toBe(false);
      expect(info.activeAgents).not.toContain('AI_AGENT');
      expect(isAgentEnvironment()).toBe(false);
    }
  });

  test('detects vscode+copilot env var', () => {
    process.env.TERM_PROGRAM = 'vscode';
    process.env.GITHUB_COPILOT = 'true';
    const info = getDetectionInfo();
    expect(info.ide).toBe('vscode');
    expect(info.isAgent).toBe(true);
    expect(info.activeAgents).toContain('GITHUB_COPILOT');
    expect(isAgentEnvironment()).toBe(true);
  });
});
