# Tester Guide: ai-workspace

`ai-workspace` scans your repository and generates machine-readable documentation and skills so AI agents understand your project without ingesting all source code.

## Prerequisites

- Node.js 18+ (`node -v`)

## Installation

### Option A: npm

```bash
npm install -g ai-workspace
ai-workspace --version
```

### Option B: Bundle

Download `releases/ai-workspace.js` and run:

```bash
node ai-workspace.js --version
```

## Workflow

### Phase 1: Initialize

```bash
ai-workspace init
```

- Creates `.ai/` directory and `config.json`
- Prompts for AI provider (interactive) or uses defaults (non-interactive/CI)
- Runs repository analysis by default

### Phase 2: Analyze

```bash
ai-workspace analyze
```

Creates `.ai/context/repo-context.json`.

### Phase 3: Generate

**Template mode (no API key):**

```bash
ai-workspace generate
```

Produces `project.md`, `architecture.md`, `rules.md` from repository context.

**LLM-enhanced mode:**

```bash
# Configure API key in .env or .ai/config.json first
ai-workspace generate --ai
```

### Phase 4: Export

```bash
ai-workspace export
```

Creates `.cursorrules` from `.ai/rules.md`.

## Other Commands

| Command | Description |
|---|---|
| `ai-workspace explain <file>` | Explain a file's role and matched skills |
| `ai-workspace status` | Check workspace health |
| `ai-workspace sync` | Incremental update after code changes |
| `ai-workspace regenerate` | Force full rebuild (`--ai` for LLM mode) |
| `ai-workspace config` | Update provider settings |

## Configuration

See `.env.example` for environment variables, or edit `.ai/config.json` directly.

## Feedback

Report crashes, incorrect framework detection, or documentation issues to the project lead.
