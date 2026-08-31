# Beta Limitations

**Version:** 0.1.0-beta.1

## Repository coverage

| Supported | Not yet supported |
|---|---|
| Node.js/TypeScript repos with `src/` at root | Deep AST/code analysis |
| Framework detection via `package.json` (primary vs HTTP adapters) | Full Python project introspection |
| Top-level and nested entrypoints under `src/` (depth 3) | App-router Next.js (`app/` without `src/`) |
| npm workspace monorepos (`packages/*`) — package list + partial depth | Per-package deep analysis |
| Template-based doc generation (no API key) | Ollama/local LLM provider |
| Basic Python file-extension detection | |

## Generation modes

- **Template mode** (`generate`) produces structural summaries — not deep code understanding
- **LLM mode** (`generate --ai`) requires OpenAI or Anthropic API key via environment variable

## Analyzer scope

The scanner reads:
- `package.json` dependencies and workspace definitions
- Top-level and nested entries under `src/` (modules, entrypoints, depth 3)
- Workspace `packages/*/package.json` for monorepos
- `.aiignore` patterns

It does **not** read:
- Individual source file contents (except `explain <file>`)
- Deep logic inside each workspace package
- Non-`src/` layouts (e.g. `lib/`, `app/`)

### `analysisDepth` in `repo-context.json`

- **`full`** — root app entrypoint found (e.g. `src/main.ts`)
- **`partial`** — monorepo or layout without a single bootstrap file; check `packages` and `bootstrap.hints`

## Compatibility

See [planning/COMPATIBILITY_MATRIX.md](../planning/COMPATIBILITY_MATRIX.md) for per-repo validation results.

## What to expect in beta

- Reliable on standard Node/TS projects with `src/`
- Partial results on Python, monorepos, Next.js app router
- No crash guarantee on every possible repo layout — report issues
