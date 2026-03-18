import { getDetectionInfo, isAgentEnvironment, AGENT_ENV_VARS } from '../src/utils/agentDetector';
import { execSync } from 'child_process';
import * as fs from 'fs';

jest.mock('child_process');
jest.mock('fs');

describe('Agent Detector', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear only the environment variables we're testing
    delete process.env.TERM_PROGRAM;
    delete process.env.CURSOR;
    delete process.env.ANTIGRAVITY_AGENT;
    delete process.env.__CFBundleIdentifier;
    delete process.env.APPDATA;
    for (const key of AGENT_ENV_VARS) {
      delete process.env[key];
    }
    
    // Default mocks to avoid errors
    (execSync as jest.Mock).mockReturnValue(Buffer.from(''));
    (fs.existsSync as jest.Mock).mockReturnValue(false);
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

  test('detects Cursor via CURSOR env var with normalization', () => {
    process.env.CURSOR = ' YES ';
    const info = getDetectionInfo();
    expect(info.ide).toBe('cursor');
    expect(info.isAgent).toBe(true);
    expect(isAgentEnvironment()).toBe(true);
  });

  test.each([
    ['false'],
    ['0'],
    ['off'],
    [' FALSE '],
    ['0 '],
  ])('treats AI_AGENT="%s" as disabled', (val) => {
    process.env.AI_AGENT = val;
    const info = getDetectionInfo();
    expect(info.isAgent).toBe(false);
    expect(info.activeAgents).not.toContain('AI_AGENT');
    expect(isAgentEnvironment()).toBe(false);
  });

  test('detects isCopilotActive when process is running', () => {
    (execSync as jest.Mock).mockReturnValue(Buffer.from('copilot-agent process running...'));
    const info = getDetectionInfo();
    expect(info.isCopilotActive).toBe(true);
  });

  test('detects isCopilotActive when extension exists in IDE terminal', () => {
    process.env.TERM_PROGRAM = 'vscode';
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue(['github.copilot-1.2.3']);
    
    const info = getDetectionInfo();
    expect(info.isCopilotActive).toBe(true);
  });

  test('isCopilotActive is false when extension exists but NOT in IDE terminal', () => {
    process.env.TERM_PROGRAM = 'other';
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue(['github.copilot-1.2.3']);
    
    const info = getDetectionInfo();
    expect(info.isCopilotActive).toBe(false);
  });

  test('detects VS Code environment but not as agent by default', () => {
    process.env.TERM_PROGRAM = 'vscode';
    const info = getDetectionInfo();
    expect(info.ide).toBe('vscode');
    expect(info.isAgent).toBe(false);
    expect(isAgentEnvironment()).toBe(false);
  });
});
