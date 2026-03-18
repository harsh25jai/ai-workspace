import fs from 'fs-extra';
import path from 'path';
import { ScannerResult } from '../analyzer/repoScanner';

export async function generateRules(rootDir: string, context: ScannerResult): Promise<void> {
  const cursorRulesDir = path.join(rootDir, '.cursor', 'rules');
  const agentRulesDir = path.join(rootDir, '.agents', 'rules');

  await fs.ensureDir(cursorRulesDir);
  await fs.ensureDir(agentRulesDir);

  // 1. Generate Cursor Rules (.mdc)
  if (context.languages.includes('typescript')) {
    const tsRule = `---
description: TypeScript Coding Standards
globs: **/*.ts, **/*.tsx
---
# TypeScript Coding Standards
- Use strict typing.
- Prefer interfaces over types for public APIs.
- Use ES6+ features (arrow functions, spread, etc.).
- Ensure all functions have return types.
`;
    await fs.writeFile(path.join(cursorRulesDir, 'typescript-standards.mdc'), tsRule);
  }

  if (context.frameworks.includes('react')) {
    const reactRule = `---
description: React Best Practices
globs: **/*.tsx, **/*.jsx
---
# React Best Practices
- Use functional components and hooks.
- Prefer Tailwind CSS for styling if project has it.
- Use proper prop-types or TS interfaces for components.
- Keep components small and specialized.
`;
    await fs.writeFile(path.join(cursorRulesDir, 'react-best-practices.mdc'), reactRule);
  }

  if (context.frameworks.includes('express')) {
    const expressRule = `---
description: Express.js API Standards
globs: src/controllers/**/*.ts, src/routes/**/*.ts
---
# Express.js API Standards
- Use async/await for all route handlers.
- centralize error handling middleware.
- Validate request bodies using Zod or Joi.
- Keep routes clean; move logic to services.
`;
    await fs.writeFile(path.join(cursorRulesDir, 'express-api-standards.mdc'), expressRule);
  }

  // 2. Generate Antigravity Rules (.md)
  const agentRules = `# Repository Rules
This repository follows specific patterns and standards detected by ai-workspace.

## Architecture
- Patterns: ${context.patterns.join(', ') || 'Standard Node.js'}
- Modules: ${context.modules.join(', ')}

## General Guidelines
- All code changes should be reflected in .ai/ documentation.
- Use "ai-workspace generate" after significant code changes.
- Follow the patterns defined in .cursor/rules/ for IDE-specific guidance.
`;
  await fs.writeFile(path.join(agentRulesDir, 'repo-rules.md'), agentRules);

  // 3. Fallback/Legacy .cursorrules
  const legacyCursorRules = `# Cursor Rules
${context.languages.includes('typescript') ? '- Follow TypeScript strict mode.' : '- Use modern JavaScript.'}
${context.frameworks.includes('react') ? '- Use React functional components.' : ''}
- Refer to .cursor/rules/ for granular guidelines.
`;
  await fs.writeFile(path.join(rootDir, '.cursorrules'), legacyCursorRules);
}
