export function isAgentEnvironment(): boolean {
  const agentEnvVars = [
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

  // Also check for Antigravity specific bundle identifier as a fallback
  if (process.env.__CFBundleIdentifier === 'com.google.antigravity' || process.env.TERM_PROGRAM === 'cursor') {
    return true;
  }

  for (const envVar of agentEnvVars) {
    if (process.env[envVar]) {
      return true;
    }
  }

  return false;
}
