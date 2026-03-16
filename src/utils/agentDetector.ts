export function isAgentEnvironment(): boolean {
  const agentEnvVars = [
    'ANTIGRAVITY_AGENT',
    'CURSOR',
    'CLINE_AGENT',
    'AI_AGENT',
    'COPILOT',
    'GITHUB_COPILOT'
  ];

  for (const envVar of agentEnvVars) {
    if (process.env[envVar]) {
      return true;
    }
  }

  return false;
}
