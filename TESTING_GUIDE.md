# Tester Guide: ai-workspace (BC1)

## Prerequisites

- Node.js 18+ (`node -v`)

## Installation

### Option A: npm

```bash
npm install -g ai-workspace
ai-workspace --version   # expect 0.1.0-beta.1
```

### Option B: Bundle

```bash
node releases/ai-workspace.js --version
```

## Workflow

```bash
ai-workspace init
ai-workspace analyze      # if init did not analyze (non-interactive mode)
ai-workspace generate
ai-workspace export
ai-workspace status
```

### Init behavior

- **Interactive terminal:** prompts for provider; runs analyze by default (can decline)
- **Non-interactive (CI):** uses defaults; run `analyze` explicitly
- **AI agent detected:** automatic analyze + handoff instructions

### LLM mode (optional)

```bash
export OPENAI_API_KEY=sk-...
ai-workspace generate --ai
```

## Automated test suite

```bash
npm test          # Jest unit + integration (67 tests)
npm run test:e2e  # Bundle E2E release validation (9 fixtures)
npm run test:all  # Both suites
npm run smoke     # scripts/smoke-test.sh
```

See `planning/TEST_STRATEGY.md`, `planning/E2E_ARCHITECTURE.md`, and `docs/E2E_TESTING.md`.

## What to validate

1. All commands exit 0 on a repo with `src/` directory
2. `.ai/project.md` contains real content (not stub text)
3. `.cursorrules` created after export
4. `explain src/<file>` works for a source file

## Known beta limitations

See [docs/LIMITATIONS.md](docs/LIMITATIONS.md).

## Feedback

Report issues with: repo type, commands run, `ai-workspace status` output, and error messages.
