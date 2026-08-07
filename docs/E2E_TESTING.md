# E2E Testing Guide

Run the release validation suite locally before publishing.

## Prerequisites

- Node.js 18+
- `npm ci` completed

## Commands

```bash
# Build bundles + run full E2E matrix (9 repositories) via standalone tester
npm run test:e2e

# Dev mode (ts-node, no E2E tester bundle required)
npm run test:e2e:dev

# Run a single fixture
npm run bundle:e2e && node releases/ctxstack-e2e-tester.js fixtures --only=express-api

# Validate an external repository (artifacts must already exist)
node releases/ctxstack-e2e-tester.js validate /path/to/repo

# Run ctxstack on external repo, then validate
node releases/ctxstack-e2e-tester.js run /path/to/repo --ctxstack releases/ctxstack.js

# Keep temp workspaces for inspection
node releases/ctxstack-e2e-tester.js fixtures --keep-workspaces

# Update content baselines after generator/template changes
node releases/ctxstack-e2e-tester.js fixtures --update-baselines
```

## Standalone E2E tester bundle

The E2E framework ships as a separate executable:

```
releases/ctxstack-e2e-tester.js   # validation tool (this repo)
releases/e2e-fixtures/                # fixture matrix (shipped alongside tester)
releases/ctxstack.js              # ctxstack CLI (generates artifacts)
```

**Distribution model:** ctxstack generates artifacts; the E2E tester validates them. They are intentionally separate bundles.

Minimum download for external repo validation (artifacts already generated):

```bash
node ctxstack-e2e-tester.js validate /path/to/repo
```

For full pipeline on an external repo, also download `ctxstack.js`:

```bash
node ctxstack-e2e-tester.js run /path/to/repo --ctxstack ./ctxstack.js
```

No TypeScript, devDependencies, or ctxstack source code required at runtime.

## What E2E validates

For each repository fixture, the bundled CLI (`releases/ctxstack.js`) runs:

1. `init` — creates `.ai/`, `.agents/`, config
2. `analyze` — generates `repo-context.json`, `repo-map.json`
3. `generate` — template-based documentation
4. `status` — health check output
5. `export` — `.cursorrules` creation
6. `explain <file>` — file explanation (when fixture defines a source file)
7. `sync` — incremental update (PASS fixtures only)
8. `regenerate` — force rebuild (PASS fixtures only)

### L1 — Artifact checks (fail CI on error)

- `config.json` — no API keys persisted
- `repo-context.json` — valid JSON schema
- `project.md`, `architecture.md`, `rules.md` — required sections, no stub text
- `state.json` — hash after generate
- `.cursorrules` — export header present

### L2–L5 — Product quality checks (warn + score only)

- **Analysis correctness** — detection accuracy, entrypoints, repo-map ↔ context alignment
- **Cross-artifact consistency** — frameworks/modules/patterns reflected in generated docs
- **Agent readiness** — `.cursor/rules/*.mdc`, `.agents/workflows/`, explain output structure
- **Content baselines** — fingerprint drift detection vs `e2e/fixtures/baselines/`

Quality scores (0–100) appear in reports but **do not fail CI**. Only functional errors (L0/L1) fail the build.

## Reports

After a run, open:

```
e2e/reports/latest/SUMMARY.md              # human summary + quality dashboard
e2e/reports/latest/quality-report.json     # per-fixture dimension scores
e2e/reports/latest/compatibility-matrix.json
e2e/reports/latest/e2e-report.json         # full detail
```

## Manifest quality fields

Optional fields in `e2e/fixtures/manifest.json` for product validation:

| Field | Purpose |
|-------|---------|
| `expectedArtifacts` | Paths that must exist after generate (e.g. framework-specific `.mdc` rules) |
| `expectedDocMentions` | Map of doc path → required substrings |
| `expectedWorkflows` | Workflow files that must exist |
| `minDocLength` | Minimum character count per doc path |

## CI

On every PR and push to release branches, GitHub Actions runs two workflows:

1. **Test** (`.github/workflows/test.yml`) — Jest unit + integration on Node 18 & 20
2. **E2E Test** (`.github/workflows/e2e-test.yml`) — bundle E2E on Node 20

Download `e2e-reports` artifact from the E2E Test workflow run for full reports.

## Relationship to other tests

| Suite | CLI used | When |
|-------|----------|------|
| Jest (`npm test`) | `dist/cli/index.js` | Fast feedback during development |
| E2E (`npm run test:e2e`) | `releases/ctxstack.js` | Pre-release / CI gate |
| Smoke (`npm run smoke`) | `dist/cli/index.js` | Quick local check (3 fixtures) |

**Always trust E2E for release confidence** — it tests the actual shipped artifact.

## Adding a fixture

1. Add source files under `e2e/fixtures/<your-id>/`
2. Register in `e2e/fixtures/manifest.json` (include quality fields as needed)
3. Run `npm run test:e2e -- --only=<your-id>`
4. Run `npm run test:e2e -- --only=<your-id> --update-baselines` to capture baselines
5. Update `planning/COMPATIBILITY_MATRIX.md` if verdict changes

Architecture details: [planning/E2E_ARCHITECTURE.md](../planning/E2E_ARCHITECTURE.md)
