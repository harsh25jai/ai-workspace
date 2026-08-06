# ai-workspace

`ai-workspace` is a local Node.js CLI that prepares repositories for AI coding assistants by generating structured context in `.ai/`.

**Beta note:** Currently optimized for Node.js/TypeScript projects with a top-level `src/` directory. See [docs/LIMITATIONS.md](docs/LIMITATIONS.md) for full beta scope.

## What it does

Turns this:

```
package.json
src/controllers/
src/services/
```

Into AI-ready context: project summary, architecture docs, rules, and IDE exports — in one command sequence.

See [docs/BEFORE_AND_AFTER.md](docs/BEFORE_AND_AFTER.md) and [examples/](examples/) for concrete output.

## Quick Start

```bash
npm install -g ai-workspace   # or: node releases/ai-workspace.js

ai-workspace init
ai-workspace analyze          # if init skipped analyze (non-interactive)
ai-workspace generate         # template mode, no API key
ai-workspace export
```

## Installation

Requires Node.js 18+.

| Method | Command |
|---|---|
| npm | `npm install -g ai-workspace` |
| Bundle | `node releases/ai-workspace.js --version` |
| Source | `npm install && npm run build && npm link` |

## Commands

| Command | Description |
|---|---|
| `init` | Bootstrap `.ai/` workspace |
| `analyze` | Scan repo → `repo-context.json` |
| `generate` | Template docs (default) |
| `generate --ai` | LLM-enhanced docs (requires API key) |
| `explain <file>` | File-level context for agents |
| `export` | Export rules to `.cursorrules` |
| `status` | Workspace health check |
| `sync` | Incremental update |
| `regenerate` | Force rebuild (bypasses hash guard) |

## Configuration

API keys via environment variables only (never stored in config):

```bash
export OPENAI_API_KEY=sk-...
ai-workspace generate --ai
```

See [docs/CONFIGURATION.md](docs/CONFIGURATION.md).

## Documentation

- [Workflow](docs/WORKFLOW.md)
- [Before & After](docs/BEFORE_AND_AFTER.md)
- [Generated files](docs/GENERATED_FILES.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Beta limitations](docs/LIMITATIONS.md)
- [Examples](examples/) — includes [screenshots](examples/screenshots/)

## Development

```bash
npm install
npm test
npm run bundle
```

## License

MIT
