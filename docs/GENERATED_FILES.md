# Generated Files Reference

## `.ctxstack/` directory

| File | Description |
|---|---|
| `config.json` | Provider and model settings (no API keys) |
| `project.md` | Project summary and tech stack |
| `architecture.md` | Module layout, patterns, data flow |
| `rules.md` | Development rules and conventions |
| `repo-map.json` | Languages, entrypoints, structure map |
| `context/repo-context.json` | Machine-readable analysis output (see schema below) |
| `context/state.json` | Hash fingerprint for staleness detection |

### `context/repo-context.json` schema (v1)

| Field | Type | Description |
|---|---|---|
| `version` | `1` | Schema version |
| `languages` | `string[]` | Detected languages (e.g. `typescript`) |
| `frameworks` | `string[]` | **Primary** frameworks (`nestjs`, `express`, `react`) — not HTTP adapters |
| `entrypoints` | `string[]` | App bootstrap files (e.g. `src/main.ts`) |
| `modules` | `string[]` | Top-level `src/` directories and inferred module folders |
| `patterns` | `string[]` | Structural patterns (`controller-service`, `workspace-monorepo`, `adapter-composition`) |
| `layout` | object | `type`: `single-package` \| `monorepo`; `workspaces`, `sourceRoots` |
| `packages` | array | Workspace members: `{ name, path, role? }` |
| `httpAdapters` | `string[]` | Secondary HTTP stacks (`express`, `fastify`) when nested under a framework |
| `bootstrap` | object | `main`, `startScripts`, `hints` for agents |
| `analysisDepth` | `full` \| `partial` | `partial` when no root app entrypoint (common in framework monorepos) |

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
