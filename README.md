# ai-workspace

`ai-workspace` is a local Node.js CLI that converts any project repository into an AI-ready workspace.

It analyzes your directory and generates structured markdown and JSON describing architecture, dependencies, rules, and entry points — preparing any repository for modern coding LLM agents.

## Setup & Installation

Requires Node.js 18+.

### npm (recommended)

```bash
npm install -g ai-workspace
```

### From source

```bash
git clone <repo-url>
cd ai-workspace
npm install
npm run build
npm link
```

### Bundle (no install)

```bash
node releases/ai-workspace.js --version
```

## Quick Start

```bash
ai-workspace init
ai-workspace analyze
ai-workspace generate        # template mode (no API key needed)
ai-workspace export
```

For LLM-enhanced documentation:

```bash
# Set OPENAI_API_KEY or configure .ai/config.json
ai-workspace generate --ai
```

## CLI Commands

### `ai-workspace init`
Scaffolds the `.ai/` directory, creates `config.json`, and optionally runs analysis.

- Works in terminal without an AI agent (human-first)
- Agent environments get automatic handoff instructions (enhancement, not requirement)
- Non-interactive defaults when stdin is not a TTY (CI-friendly)

### `ai-workspace analyze`
Scans the repository and writes `.ai/context/repo-context.json`.

### `ai-workspace generate`
Generates documentation from repository context.

- **Default (template mode):** Deterministic docs from `repo-context.json` — no API key required
- **`--ai` flag:** LLM-enhanced docs via OpenAI, Anthropic, or configured provider

### `ai-workspace explain <file>`
Explains a source file's role, imports, and matched skills.

```bash
ai-workspace explain src/cli/index.ts
```

### `ai-workspace status`
Checks workspace health and freshness.

### `ai-workspace sync`
Incrementally updates workspace context after structural changes.

### `ai-workspace regenerate`
Force rebuild, skipping hash checks. Supports `--ai` flag.

### `ai-workspace config`
Interactively update LLM provider settings in `.ai/config.json`.

### `ai-workspace export`
Export `.ai/rules.md` to `.cursorrules` (and other targets with `--target`).

### `ai-workspace skills generate`
Auto-discover and generate skill files in `.agents/skills/`.

## Configuration

Copy `.env.example` to `.env` or edit `.ai/config.json`:

```json
{
  "provider": "openai",
  "model": "gpt-4",
  "openaiKey": "",
  "anthropicKey": ""
}
```

Environment variables take precedence: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_MODEL`, `ANTHROPIC_MODEL`.

## Development

```bash
npm install
npm run build
npm test
npm run bundle    # produces releases/ai-workspace.js
```

## License

MIT
