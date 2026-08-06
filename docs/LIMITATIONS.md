# Beta Limitations

**Version:** 0.1.0-beta.1

## Repository coverage

| Supported | Not yet supported |
|---|---|
| Node.js/TypeScript repos with `src/` at root | Monorepos with `packages/` layout |
| Framework detection via `package.json` | Deep AST/code analysis |
| Top-level module folders under `src/` | App-router Next.js (`app/` without `src/`) |
| Template-based doc generation (no API key) | Ollama/local LLM provider |
| Basic Python file-extension detection | Full Python project introspection |

## Generation modes

- **Template mode** (`generate`) produces structural summaries — not deep code understanding
- **LLM mode** (`generate --ai`) requires OpenAI or Anthropic API key via environment variable

## Analyzer scope

The scanner reads:
- `package.json` dependencies (framework detection)
- Top-level entries under `src/` (modules, entrypoints)
- `.aiignore` patterns

It does **not** read:
- Individual source file contents (except `explain <file>`)
- Nested package structures in monorepos
- Non-`src/` layouts (e.g. `lib/`, `app/`)

## Compatibility

See [planning/COMPATIBILITY_MATRIX.md](../planning/COMPATIBILITY_MATRIX.md) for per-repo validation results.

## What to expect in beta

- Reliable on standard Node/TS projects with `src/`
- Partial results on Python, monorepos, Next.js app router
- No crash guarantee on every possible repo layout — report issues
