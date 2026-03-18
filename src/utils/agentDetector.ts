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

/**
 * Helper to check if a specific environment variable is active (not "false", "0", "off")
 */
function isEnvVarActive(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.toLowerCase().trim();
  if (normalized === '') return false;
  return !['false', '0', 'off'].includes(normalized);
}

/**
 * Helper to scan AGENT_ENV_VARS and return active ones
 */
export function getActiveAgentEnvVars(env: NodeJS.ProcessEnv): string[] {
  return AGENT_ENV_VARS.filter(v => isEnvVarActive(env[v]));
}

export function getDetectionInfo(): DetectionResult {
  const result: DetectionResult = {
    isAgent: false,
    isCopilotActive: false,
    activeAgents: [],
  };

  const env = process.env;

  // 1. Detect IDE
  const termProgram = (env.TERM_PROGRAM || '').toLowerCase();
  if (isEnvVarActive(env.ANTIGRAVITY_AGENT) || env.__CFBundleIdentifier === 'com.google.antigravity') {
    result.ide = 'antigravity';
  } else if (termProgram === 'cursor' || isEnvVarActive(env.CURSOR)) {
    result.ide = 'cursor';
  } else if (termProgram === 'vscode') {
    result.ide = 'vscode';
  } else {
    result.ide = 'other';
  }

  // 2. Detect AI Agents via Env Vars using the helper
  result.activeAgents = getActiveAgentEnvVars(env);
  result.isAgent = isAgentEnvFromEnv(env);

  // 3. Detect GitHub Copilot Status
  result.isCopilotActive = checkCopilotStatus();
  
  // result.isAgent should also be true if Copilot is active
  if (result.isCopilotActive) {
    result.isAgent = true;
  }

  return result;
}

function checkCopilotStatus(): boolean {
  let copilotProcessActive = false;
  try {
    const isWindows = process.platform === 'win32';
    // Use tasklist on Windows, ps on others
    const cmd = isWindows
      ? 'tasklist /FI "IMAGENAME eq copilot-agent.exe" /NH'
      : 'ps aux | grep -i "copilot-agent" | grep -v grep';

    const output = execSync(cmd, { stdio: 'pipe', timeout: 5000 }).toString();
    // Case-insensitive search for copilot-agent in output
    if (output.toLowerCase().includes('copilot-agent')) {
      copilotProcessActive = true;
    }
  } catch (e) {
    // If command fails, timeouts, or no match, continue
  }

  // Fallback: Check for extension presence in common paths
  const homeDir = os.homedir();
  const extensionPaths = [
    path.join(homeDir, '.vscode', 'extensions'),
    path.join(homeDir, '.cursor', 'extensions'),
    path.join(homeDir, '.vscode-server', 'extensions'), // For remote dev
  ];

  // Include Windows AppData location if available
  if (process.env.APPDATA) {
    extensionPaths.push(path.join(process.env.APPDATA, 'Code', 'extensions'));
  }

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

  // Corroborate installation with either a running process OR being in an IDE terminal
  const termProgram = (process.env.TERM_PROGRAM || '').toLowerCase();
  const isIdeTerminal = 
    ['vscode', 'cursor', 'antigravity', 'code', 'jetbrains'].includes(termProgram) ||
    process.env.__CFBundleIdentifier === 'com.google.antigravity';
  
  return copilotProcessActive || (copilotInstalled && isIdeTerminal);
}

/**
 * Logic to detect agent environment based ONLY on environment variables and IDE indicators
 */
function isAgentEnvFromEnv(env: NodeJS.ProcessEnv): boolean {
  const termProgram = (env.TERM_PROGRAM || '').toLowerCase();
  return (
    termProgram === 'cursor' ||
    env.__CFBundleIdentifier === 'com.google.antigravity' ||
    getActiveAgentEnvVars(env).length > 0
  );
}

/**
 * Detects if the current environment is an AI agent or a recognized AI IDE 
 * based ONLY on environment variables and IDE indicators.
 * 
 * NOTE: This function (and its helper isAgentEnvFromEnv) does NOT detect 
 * GitHub Copilot processes or extensions. For comprehensive agent detection 
 * that includes Copilot, use getDetectionInfo().isAgent.
 * 
 * Callers that require Copilot detection should be updated to use 
 * getDetectionInfo().isAgent instead of this function.
 */
export function isAgentEnvironment(): boolean {
  return isAgentEnvFromEnv(process.env);
}
