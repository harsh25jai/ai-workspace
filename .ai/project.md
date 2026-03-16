# Project Summary: ai-workspace

## Mission
`ai-workspace` is a CLI-first developer tool designed to convert any raw software repository into a structured, AI-ready environment. It bridges the gap between static codebases and LLM-powered coding assistants by generating a machine-readable context layer that doesn't expose raw source code but provides deep architectural and domain knowledge.

## Tech Stack
- **Language**: TypeScript
- **Runtime**: Node.js (v18+)
- **Core Libraries**: `commander` (CLI), `fs-extra` (Filesystem), `inquirer` (Human Interaction), `simple-git` (Version Control).
- **Architecture**: Modular, plugin-based, and provider-agnostic.

## Key Features
- **Deterministic Static Analysis**: Maps repository structure, languages, and frameworks.
- **Plugin System**: Framework-specific detection (React, Express, Node).
- **AI Provider Layer**: Abstract interface for OpenAI, Anthropic, and Local models.
- **Skill Discovery**: Automatically identifies domain-specific "skills" (rulesets).
- **Workspace Sync**: Incremental updates based on repository changes.
- **Agent Awareness**: specialized handoff mode for seamless AI integration.