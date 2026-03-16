---
name: CLI Architecture & Extension
type: core-architecture
importance: high
files:
  - "src/cli/**/*"
  - "src/commands/**/*"
---

# CLI Architecture & Extension Skill

## Description
Guidelines for maintaining and extending the `ai-workspace` CLI system.

## Rules
- **Command Registration**: Always define commands in `src/commands/` as separate modules and register them in `src/cli/index.ts`.
- **Inquirer Usage**: Use `inquirer@8` only. Higher versions cause ESM/CommonJS conflicts.
- **Agent Awareness**: Every interactive command should first check `isAgentEnvironment()` to allow for automated AI handoff.
- **Sync Integrity**: Any command modifying the filesystem under `.ai/` must trigger a state hash update in `state.json`.

## AI Guidelines
- When adding a new command, ensure it follows the `commander` pattern used in `init.ts` and `config.ts`.
- Prioritize providing a premium human experience (Inquirer selection) while keeping a "silent" mode for agents.
