import { ScannerResult } from '../analyzer/repoScanner';

const AI_HINT = '<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->\n';

export interface TemplateOutput {
  projectMd: string;
  architectureMd: string;
  rulesMd: string;
}

export function generateFromContext(context: ScannerResult): TemplateOutput {
  const languages = context.languages.length > 0 ? context.languages.join(', ') : 'Unknown';
  const frameworks = context.frameworks.length > 0 ? context.frameworks.join(', ') : 'None detected';
  const modules = context.modules.length > 0
    ? context.modules.map(m => `- \`${m}/\``).join('\n')
    : '- (no modules detected under src/)';
  const patterns = context.patterns.length > 0 ? context.patterns.join(', ') : 'Standard';
  const entrypoints = context.entrypoints.length > 0
    ? context.entrypoints.map(e => `- \`${e}\``).join('\n')
    : '- (none detected)';

  const projectMd = `${AI_HINT}# Project Summary

## Overview
This repository has been analyzed by ai-workspace.

## Tech Stack
- **Languages:** ${languages}
- **Frameworks:** ${frameworks}
- **Patterns:** ${patterns}

## Entry Points
${entrypoints}

Run \`ai-workspace generate --ai\` for LLM-enhanced documentation.
`;

  const architectureMd = `${AI_HINT}# Architecture

## High-Level Structure
\`\`\`
src/
${context.modules.map(m => `  ${m}/`).join('\n') || '  (empty)'}
\`\`\`

## Detected Patterns
${patterns}

## Modules
${modules}

## Frameworks
${frameworks}

## Data Flow
1. Application entry via detected entrypoints
2. Module boundaries under \`src/\`
3. AI context stored in \`.ai/context/repo-context.json\`
`;

  const rulesMd = `${AI_HINT}# Development Rules

## Architecture
- Patterns: ${patterns}
- Modules: ${context.modules.join(', ') || 'none'}

## Language Guidelines
${context.languages.includes('typescript') ? '- Use strict TypeScript\n- Prefer explicit return types for public APIs' : '- Follow project language conventions'}

## AI Workspace
- Run \`ai-workspace analyze\` after significant structural changes
- Run \`ai-workspace generate\` to refresh documentation from templates
- Run \`ai-workspace generate --ai\` for LLM-enhanced docs (requires API key)
- Run \`ai-workspace sync\` for incremental updates
`;

  return { projectMd, architectureMd, rulesMd };
}
