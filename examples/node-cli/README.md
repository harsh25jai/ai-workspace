# Example: Node.js CLI

**Source:** [tj/commander.js](https://github.com/tj/commander.js) (representative layout)  
**Stack:** TypeScript, Node.js CLI  
**Validation:** PASS (R1)

## Commands run

```bash
ai-workspace init
ai-workspace analyze
ai-workspace generate
ai-workspace export
```

## Before vs After

See [before.md](./before.md) and [after/](./after/).

## Why this helps AI-assisted development

- AI agents get a structured summary of modules under `src/` without reading every file
- `repo-context.json` provides machine-readable stack detection
- `.cursorrules` gives IDE-level guidance automatically

## Observations

See [observations.md](./observations.md).
