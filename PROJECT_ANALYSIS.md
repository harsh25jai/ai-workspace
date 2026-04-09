# Project Analysis: `ai-workspace`

## Overview
`ai-workspace` is a Node.js-based Command Line Interface (CLI) tool designed to bridge the gap between source code repositories and Artificial Intelligence (AI) assistants. It scans a project to generate a structured, machine-readable "AI-native context layer." This helps AI agents understand the repository's architecture, dependencies, patterns, and rules without needing to ingest all source code files individually.

All generated context is securely stored within a local `.ai/` directory inside the user's project root.

## Architecture & Tech Stack
*   **Language**: TypeScript (Node.js environment v18+)
*   **CLI Framework**: `commander` (for handling arguments and commands)
*   **Interactivity**: `inquirer` (version 8, specifically to avoid ESM/CommonJS conflicts)
*   **Build System**: `tsc` (TypeScript Compiler) combined with `@vercel/ncc` to bundle into a single distributable file for releases.
*   **Testing**: `jest` and `ts-jest`.

## Project Structure
The source code under the `src/` directory is logically modularized:
*   **`src/cli/`**: Entry point registering the Commander commands.
*   **`src/commands/`**: Handlers for individual CLI workflows (`init`, `analyze`, `generate`, etc.).
*   **`src/analyzer/`**: Core engine that recursively parses the directory tree, ignoring patterns like `node_modules` and `.git`, to map out languages, roots, and structures.
*   **`src/generators/`**: Builds human-readable and AI-consumable markdown documentation.
*   **`src/providers/`**: Integrates externally with LLM providers (e.g., OpenAI, Anthropic) or local mocks.
*   **`src/skills/`**: Extracts or interacts with "skills" representing operational rulesets.
*   **`src/context/` & `src/workspace/`**: Handling state management, hashing, and configuration logic within the generated `.ai/` folder.

## Core Workflows
Users interact with the CLI through several key commands:
1.  **`ai-workspace init`**: Initializes the `.ai/` environment, creates `.ai/repo-map.json`, and sets up provider configurations (API keys) and placeholder context files.
2.  **`ai-workspace analyze`**: Scans the codebase to extract dependency graphs, file architecture, and produces `.ai/context/repo-context.json`.
3.  **`ai-workspace generate`**: Utilizes the analysis data to compose readable documents: `project.md`, `architecture.md`, and `rules.md`.
4.  **`ai-workspace status`**: Verifies if the `.ai/` documentation is in-sync with the current state of the codebase.
5.  **`ai-workspace sync`**: Incrementally updates the workspace context after file additions or changes.
6.  **`ai-workspace regenerate`**: Forces a fresh build of all AI documentation.
7.  **`ai-workspace config`**: Interactively updates LLM providers or API configurations.

## Further Working Guidelines
If making extensions to this application, developers should adhere to the established "Skills" and architecture patterns.
*   **Command Registration Rule**: Commands must be housed in separate modules within `src/commands/` and registered through `src/cli/index.ts`.
*   **Extensibility**: Ensure premium terminal experience with `inquirer` for humans, but respect automatic handoff for "agents" where interactive prompts are bypassed based on `isAgentEnvironment()` checks.
*   **Integrity**: Modifying anything within `.ai/` necessitates an updated state hash mechanism commonly managed by `state.json`.
