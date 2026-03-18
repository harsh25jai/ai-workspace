import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const AGENT_ENV_VARS = [
  'ANTIGRAVITY_AGENT',
  'CURSOR',
  'CLAUDE_CODE',
  'WINDSURF',
  'CASCADE',
  'REPL_ID',
  'CLINE_AGENT',
  'AI_AGENT',
  'COPILOT',
  'GITHUB_COPILOT'
];

export interface DetectionResult {
  isAgent: boolean;
  ide?: 'antigravity' | 'cursor' | 'vscode' | 'other';
  isCopilotActive: boolean;
  activeAgents: string[];
}

export function getDetectionInfo(): DetectionResult {
  const result: DetectionResult = {
    isAgent: false,
    isCopilotActive: false,
    activeAgents: [],
  };

  const env = process.env;

  // 1. Detect IDE
  if (env.ANTIGRAVITY_AGENT || env.__CFBundleIdentifier === 'com.google.antigravity') {
    result.ide = 'antigravity';
    result.isAgent = true;
  } else if (env.TERM_PROGRAM === 'cursor' || env.CURSOR === 'true') {
    result.ide = 'cursor';
    result.isAgent = true;
  } else if (env.TERM_PROGRAM === 'vscode') {
    result.ide = 'vscode';
  } else {
    result.ide = 'other';
  }

  for (const envVar of AGENT_ENV_VARS) {
    const value = env[envVar];
    if (value) {
      const normalized = value.toLowerCase().trim();
      if (normalized !== 'false' && normalized !== '0' && normalized !== 'off') {
        result.isAgent = true;
        result.activeAgents.push(envVar);
      }
    }
  }

  // 3. Detect GitHub Copilot Status
  result.isCopilotActive = checkCopilotStatus();

  return result;
}

function checkCopilotStatus(): boolean {
  let copilotProcessActive = false;
  try {
    // Check for running copilot-agent process (common for the extension)
    const output = execSync('ps aux | grep -i "copilot-agent" | grep -v grep', { stdio: 'pipe' }).toString();
    if (output.length > 0) {
      copilotProcessActive = true;
    }
  } catch (e) {
    // If ps fails or no match, continue
  }

  // Fallback: Check for extension presence in common paths
  const homeDir = os.homedir();
  const extensionPaths = [
    path.join(homeDir, '.vscode', 'extensions'),
    path.join(homeDir, '.cursor', 'extensions'),
    path.join(homeDir, '.vscode-server', 'extensions'), // For remote dev
  ];

  let copilotInstalled = false;
  for (const extPath of extensionPaths) {
    if (fs.existsSync(extPath)) {
      try {
        const files = fs.readdirSync(extPath);
        if (files.some(f => f.toLowerCase().includes('github.copilot'))) {
          copilotInstalled = true;
          break;
        }
      } catch (e) {
        // Ignore read errors
      }
    }
  }

  // Only return true if copilotInstalled plus a corroborating indicator
  // (the existing process check OR being in a known VS Code/Cursor environment)
  const isIdeTerminal = ['vscode', 'cursor'].includes(process.env.TERM_PROGRAM || '');
  return copilotProcessActive || (copilotInstalled && isIdeTerminal);
}

export function isAgentEnvironment(): boolean {
  if (process.env.TERM_PROGRAM === 'cursor' || process.env.__CFBundleIdentifier === 'com.google.antigravity') {
    return true;
  }

  for (const v of AGENT_ENV_VARS) {
    const value = process.env[v];
    if (value) {
      const normalized = value.toLowerCase().trim();
      if (normalized !== 'false' && normalized !== '0' && normalized !== 'off') {
        return true;
      }
    }
  }

  return false;
}
