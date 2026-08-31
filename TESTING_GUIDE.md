# Tester Guide: ctxstack (BC1)

## Prerequisites

- Node.js 18+ (`node -v`)

## Installation

### Option A: npm

```bash
npm install -g ctxstack
ctxstack --version   # expect 0.1.0-beta.1
```

### Option B: Bundle

```bash
node releases/ctxstack.js --version
```

## Workflow

```bash
ctxstack init
ctxstack analyze      # if init did not analyze (non-interactive mode)
ctxstack generate
ctxstack export
ctxstack status
```

### Init behavior

- **Interactive terminal:** prompts for provider; runs analyze by default (can decline)
- **Non-interactive (CI):** uses defaults; run `analyze` explicitly
- **AI agent detected:** automatic analyze + handoff instructions

### LLM mode (optional)

```bash
export OPENAI_API_KEY=sk-...
ctxstack generate --ai
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
2. `.ctxstack/project.md` contains real content (not stub text)
3. `.cursorrules` created after export
4. `explain src/<file>` works for a source file

## Known beta limitations

See [docs/LIMITATIONS.md](docs/LIMITATIONS.md).

## Feedback

Report issues with: repo type, commands run, `ctxstack status` output, and error messages.
