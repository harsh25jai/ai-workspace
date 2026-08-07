# Project State

**Last updated:** Phase 1 implementation  
**Version target:** `0.1.0-beta.1`

## Product Summary

`ctxstack` is a local Node.js CLI that converts any repository into an AI-ready workspace by generating structured context in `.ai/`, skills in `.agents/skills/`, and IDE rules in `.cursor/rules/`.

## Architecture

- **Type:** CLI-only (no server, database, or frontend)
- **Language:** TypeScript (Node.js 18+)
- **Entry:** `src/cli/index.ts` → `src/commands/*`
- **Core modules:** analyzer, generators, providers, workspace, skills, validators

## What Works

- `analyze` — scans repo, writes `repo-context.json`
- `status` — health check for workspace freshness
- `export` — exports rules to `.cursorrules`
- `config` — interactive provider configuration (requires `config.json`)
- Agent-mode `init` — handoff instructions for AI assistants

## Known Gaps (Phase 1 targets)

| ID | Issue | Status |
|---|---|---|
| C1 | Human `init` disabled | **Resolved** |
| C2 | `config.json` not always created | **Resolved** |
| C3 | Providers ignore config keys | **Resolved** |
| C4 | Local provider corrupts docs | **Resolved** |
| C5 | `sync` broken | **Resolved** |
| C6 | `explain` command missing | **Resolved** |
| C7 | No CI | **Resolved** |
| C8 | Version mismatch | **Resolved** |

## Key Files

- [`src/commands/init.ts`](../src/commands/init.ts)
- [`src/commands/generate.ts`](../src/commands/generate.ts)
- [`src/agents/runner.ts`](../src/agents/runner.ts)
- [`src/providers/`](../src/providers/)
- [`src/workspace/sync.ts`](../src/workspace/sync.ts)
