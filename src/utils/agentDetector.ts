import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

  // 2. Detect AI Agents via Env Vars
  const agentEnvVars = [
    'CLAUDE_CODE',
    'WINDSURF',
    'CASCADE',
    'REPL_ID',
    'CLINE_AGENT',
    'AI_AGENT',
    'COPILOT',
    'GITHUB_COPILOT'
  ];

  for (const envVar of agentEnvVars) {
    if (env[envVar]) {
      result.isAgent = true;
      result.activeAgents.push(envVar);
    }
  }

  // 3. Detect GitHub Copilot Status
  result.isCopilotActive = checkCopilotStatus();

  return result;
}

function checkCopilotStatus(): boolean {
  try {
    // Check for running copilot-agent process (common for the extension)
    const output = execSync('ps aux | grep -i "copilot-agent" | grep -v grep', { stdio: 'pipe' }).toString();
    if (output.length > 0) return true;
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

  for (const extPath of extensionPaths) {
    if (fs.existsSync(extPath)) {
      try {
        const files = fs.readdirSync(extPath);
        if (files.some(f => f.toLowerCase().includes('github.copilot'))) {
          // This only detects installation, but combined with the process check, it's more robust
          // If we are in an IDE terminal, and the extension is installed, it's likely active
          return true;
        }
      } catch (e) {
        // Ignore read errors
      }
    }
  }

  return false;
}

export function isAgentEnvironment(): boolean {
  // Fast path for common checks
  const fastCheckVars = [
    'ANTIGRAVITY_AGENT',
    'CURSOR',
    'CLAUDE_CODE',
    'WINDSURF',
    'CASCADE',
    'REPL_ID',
    'CLINE_AGENT',
    'GITHUB_COPILOT'
  ];

  if (process.env.TERM_PROGRAM === 'cursor' || process.env.__CFBundleIdentifier === 'com.google.antigravity') {
    return true;
  }

  for (const v of fastCheckVars) {
    if (process.env[v]) return true;
  }

  return false;
}
