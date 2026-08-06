# Before and After

## The problem

AI coding assistants (Cursor, Windsurf, Copilot) work best when they understand your project's architecture, conventions, and module boundaries. Without structure, agents must read many files — wasting context window and producing generic suggestions.

## Before ai-workspace

An agent typically sees:

- Raw file tree
- `package.json` dependencies (maybe)
- No project-specific rules or patterns

## After ai-workspace

Running `init → analyze → generate → export` produces:

| Artifact | Purpose |
|---|---|
| `.ai/project.md` | Business/tech summary for agents |
| `.ai/architecture.md` | Module layout and data flow |
| `.ai/rules.md` | Development conventions |
| `.ai/context/repo-context.json` | Machine-readable repo footprint |
| `.cursorrules` | IDE-integrated rules (Cursor/Windsurf) |
| `.agents/rules/` | Agent-specific rule files |
| `.agents/workflows/` | Repeatable agent workflows |

## Example

See [examples/express-api/](../examples/express-api/) for a before/after walkthrough on an Express API layout.

## Two generation modes

| Mode | Command | API key? | Output |
|---|---|---|---|
| Template (default) | `ai-workspace generate` | No | Deterministic docs from `repo-context.json` |
| LLM-enhanced | `ai-workspace generate --ai` | Yes (env var) | AI-written documentation |

Start with template mode. Use `--ai` when you need richer prose.
