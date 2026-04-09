<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->
# Project Summary

## Business Mission
`ai-workspace` is a robust local Node.js CLI tool built to solve the "context window limitation" problem frequently encountered when giving Large Language Model (LLM) agents access to large source code repositories. 

Its primary objective is to standardize an AI-ready context directory (`.ai/`) within any given repository. By analyzing the folder structure, languages, and core module dependencies locally, `ai-workspace` aggregates the footprint into hyper-optimized, machine-readable JSON and Markdown documents. This ensures AI assistants instantly grasp the architecture, dependencies, and internal rules of the host project without needlessly ingesting megabytes of unoptimized code.

## Tech Stack
- **Runtime Environment:** Node.js (v18+)
- **Language:** TypeScript
- **CLI Management:** `commander` (for routing and processing flags), `inquirer@8` (specifically pinned to prevent CommonJS/ESM conflicts during interactive sessions)
- **File System:** `fs-extra` for simplified directory structures and async operations.
- **Build/Bundle System:** `tsc` combined with `@vercel/ncc` to output a unified standalone JS executable in `dist/cli/index.js` and `/releases/`.
- **Testing:** `jest` combined with `ts-jest`.