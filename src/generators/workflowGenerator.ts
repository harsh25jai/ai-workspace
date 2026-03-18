import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';

export async function generateWorkflows(rootDir: string, context: ScannerResult): Promise<void> {
  const workflowsDir = path.join(rootDir, '.agents', 'workflows');
  await fs.ensureDir(workflowsDir);

  // 1. Update README Workflow
  const updateReadmeWorkflow = `---
description: Update project README based on AI documentation
---
# Workflow: Update README
This workflow syncs the top-level README.md with the latest AI-generated project overview.

1. Read the summary from .ai/project.md and .ai/architecture.md.
2. Update the "Project Overview" and "Architecture" sections of README.md.
3. Ensure the tech stack mentioned in README reflects: ${context.languages.join(', ')}, ${context.frameworks.join(', ')}.
4. Add a note about ai-workspace usage in the "Development" section.
`;
  await fs.writeFile(path.join(workflowsDir, 'update-readme.md'), updateReadmeWorkflow);

  // 2. Regenerate All Workflow
  const regenerateWorkflow = `---
description: Full workspace analysis and regeneration
---
# Workflow: Regenerate Workspace
Run this workflow after significant code changes to ensure all documentation and rules are up to date.

1. Run "ai-workspace analyze" to refresh repository context.
2. Run "ai-workspace generate" to rebuild documentation, rules, and workflows.
3. Verify .ai/ and .agents/ contents.
4. Call /update-readme to sync the main README.
`;
  await fs.writeFile(path.join(workflowsDir, 'regenerate-all.md'), regenerateWorkflow);

  // 3. Framework-specific workflows
  if (context.frameworks.includes('react')) {
    const reactComponentWorkflow = `---
description: Create a new React component with best practices
---
# Workflow: Create React Component
Follows the project's component-based UI pattern.

1. Create a new directory under src/components/ for the component.
2. Follow the rules defined in .cursor/rules/react-best-practices.mdc.
3. Generate a basic functional component template.
4. Add a basic test file for the component.
`;
    await fs.writeFile(path.join(workflowsDir, 'create-react-component.md'), reactComponentWorkflow);
  }
}
