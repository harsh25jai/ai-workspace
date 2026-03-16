import fs from 'fs-extra';
import path from 'path';

export async function buildLLMPromptContext(rootDir: string): Promise<string> {
  const contextPath = path.join(rootDir, '.ai', 'context', 'repo-context.json');
  
  if (!fs.existsSync(contextPath)) {
    throw new Error('repo-context.json not found. Run analyze first.');
  }

  const contextData = await fs.readJSON(contextPath);

  return `Project Languages:
${contextData.languages.join(', ')}

Frameworks:
${contextData.frameworks.join(', ')}

Project Structure:
src/
${contextData.modules.map((m: string) => `  ${m}/`).join('\n')}

Entrypoints:
${contextData.entrypoints.join('\n')}
`;
}
