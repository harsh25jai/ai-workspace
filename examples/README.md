# Examples

These examples show **what ai-workspace generates** — not full applications. Each is based on validation runs against representative project layouts.

## Index

| Example | Based on | Verdict |
|---|---|---|
| [node-cli](./node-cli/) | Node.js CLI (commander.js-style) | PASS |
| [express-api](./express-api/) | Express API with controllers/services | PASS |
| [react-vite](./react-vite/) | React + TypeScript frontend | PASS |

## How to read examples

1. Read `before.md` — what an AI agent sees without ai-workspace
2. Browse `after/` — generated `.ai/` artifacts (sanitized)
3. Read `observations.md` — what worked and what to expect

## Reproduce locally

```bash
ai-workspace init
ai-workspace analyze
ai-workspace generate
ai-workspace export
```

See [docs/WORKFLOW.md](../docs/WORKFLOW.md) for full workflow details.
