<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->
# Architecture

## High-Level Data Flow
1. **Command Invocation:** The user (or an automated agent) fires an `ai-workspace` shell command.
2. **CLI Router (`src/cli/index.ts`):** The arguments are parsed using `commander` and routed directly to a standalone module within `src/commands/`.
3. **Execution Domain:**
   - For `analyze`, the request hits `src/analyzer/` which traverses the tree.
   - For `init`, directory structures like `.ai/`, `.agents/skills/`, and config files are safely bootstrapped.
4. **Context Generation:** Following a successful analysis, the engine outputs into `src/generators/`, parsing JSON graphs into rich markdown files (`project.md`, `architecture.md`, `rules.md`).
5. **Persistence:** State updates and provider keys are persistently flushed to `.ai/config.json` and `.ai/context/repo-context.json`.

## Core Service Boundaries
- **`src/cli/`**: Lightweight argument ingestion and command registration.
- **`src/commands/`**: Controller logic binding CLI parameters to internal engine utilities (e.g., `init.ts`, `analyze.ts`, `generate.ts`).
- **`src/analyzer/`**: File system intelligence. It securely ignores massive dependencies (`node_modules`) while discovering "languages", "frameworks" and hierarchical module layouts.
- **`src/generators/`**: Data formatting. Converts raw semantic mappings into structured `.ai/` markdown resources.
- **`src/providers/`**: The abstraction layers for dynamic endpoints such as `openai`, `anthropic`, or simulated `local` test mocking environments.
- **`src/skills/`**: The schema system for reading and executing local custom skill sets (maintained within the `.agents/skills/` standard directories).