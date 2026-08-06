<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->
# Project Summary

## Business Mission
`ai-workspace` is a local Node.js CLI tool that solves the "context window limitation" problem when giving LLM agents access to large source code repositories.

Its primary objective is to standardize an AI-ready context directory (`.ai/`) within any repository. By analyzing folder structure, languages, and module dependencies locally, it aggregates the footprint into machine-readable JSON and Markdown documents.

## Tech Stack
- **Runtime:** Node.js (v18+)
- **Language:** TypeScript
- **CLI:** `commander`, `inquirer@8`
- **File System:** `fs-extra`
- **Build:** `tsc` + `@vercel/ncc` for bundled releases
- **Testing:** Jest + ts-jest

## Commands
- `init` — Bootstrap `.ai/` workspace
- `analyze` — Scan repo, produce `repo-context.json`
- `generate` — Template-based docs (default)
- `generate --ai` — LLM-enhanced docs
- `explain <file>` — File-level context for agents
- `sync` — Incremental workspace updates
- `export` — Export rules to `.cursorrules`
