<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->
# Architecture

## High-Level Data Flow
1. **Command Invocation:** User or agent runs `ctxstack` command
2. **CLI Router (`src/cli/index.ts`):** Arguments parsed via `commander`, routed to `src/commands/`
3. **Execution Domain:**
   - `analyze` → `src/analyzer/` traverses repo tree
   - `init` → bootstraps `.ctxstack/`, `.agents/`, `.cursor/` directories
   - `generate` → template mode (default) or `--ai` LLM mode
4. **Context Generation:** `src/generators/` produces markdown and JSON artifacts
5. **Persistence:** State in `.ctxstack/config.json`, `.ctxstack/context/repo-context.json`, `.ctxstack/context/state.json`

## Core Service Boundaries
- **`src/cli/`** — Argument ingestion and command registration
- **`src/commands/`** — Controller logic per CLI command
- **`src/analyzer/`** — Filesystem intelligence (languages, frameworks, modules)
- **`src/generators/`** — Template and LLM output formatting
- **`src/providers/`** — OpenAI, Anthropic, Local provider abstraction
- **`src/skills/`** — Skill detection, loading, activation
- **`src/workspace/`** — State hashing, sync, init helpers
- **`src/validators/`** — Anti-hallucination checks for LLM output
