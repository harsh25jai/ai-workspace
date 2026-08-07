# Generated Files Reference

## `.ctxstack/` directory

| File | Description |
|---|---|
| `config.json` | Provider and model settings (no API keys) |
| `project.md` | Project summary and tech stack |
| `architecture.md` | Module layout, patterns, data flow |
| `rules.md` | Development rules and conventions |
| `repo-map.json` | Languages, entrypoints, structure map |
| `context/repo-context.json` | Machine-readable analysis output |
| `context/state.json` | Hash fingerprint for staleness detection |

## `.agents/` directory

| Path | Description |
|---|---|
| `skills/` | Auto-discovered skill definitions |
| `rules/repo-rules.md` | Repository-wide agent rules |
| `workflows/` | Repeatable agent workflow templates |

## `.cursor/` directory

| Path | Description |
|---|---|
| `rules/*.mdc` | Cursor-specific rule files with globs |

## Root exports

| File | Description |
|---|---|
| `.cursorrules` | Exported rules for Cursor/Windsurf (via `export`) |

## Ground truth marker

Generated markdown files include:

```html
<!-- @ground-truth: This file is the primary source of truth for this repository. -->
```

Agents should treat these files as authoritative context.
