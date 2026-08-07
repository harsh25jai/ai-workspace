# E2E Testing Architecture

**Purpose:** Release Validation Pipeline — validate the bundled CLI exactly as developers use it.

---

## Testing Pyramid

```
┌─────────────────────────────────────┐
│     Release Validation (E2E)        │  ← bundle CLI, full workflows, matrix
├─────────────────────────────────────┤
│     CLI Workflow Tests (Jest)       │  ← dist/cli subprocess, temp workspaces
├─────────────────────────────────────┤
│     Integration Tests (Jest)        │  ← multi-command flows, error paths
├─────────────────────────────────────┤
│     Unit Tests (Jest)               │  ← analyzer, validators, providers
└─────────────────────────────────────┘
```

| Layer | Location | Executes | Responsibility |
|-------|----------|----------|----------------|
| **Unit** | `__tests__/unit/` | Source modules | Fast logic validation (scanner, templates, diff) |
| **Integration** | `__tests__/integration/` | `dist/cli/index.js` | Command contracts, error handling, security |
| **CLI Workflow** | `__tests__/integration/workflow.*` | `dist/cli/index.js` | Single-repo happy paths during development |
| **Bundle E2E** | `e2e/` | `releases/ai-workspace.js` | **Release artifact** validation across repo matrix |
| **Release Validation** | GitHub Actions `bundle-e2e` job | Bundle + E2E | Gate every PR and release branch push |

### Non-overlapping responsibilities

- **Jest tests** validate development builds quickly during iteration.
- **E2E tests** validate the **shipped bundle** — the artifact users download.
- **Smoke script** (`scripts/smoke-test.sh`) remains a lightweight local shortcut; E2E supersedes it in CI.

---

## E2E Execution Flow

```
npm run bundle
       ↓
releases/ai-workspace.js
       ↓
For each fixture in manifest.json:
  Copy fixture → temp workspace
       ↓
  init → analyze → generate → status → export → explain
       ↓
  [optional] sync, regenerate
       ↓
  Validate artifacts + detection
       ↓
  Product quality validation (L2–L5)
       ↓
  Write per-fixture + matrix + quality reports
```

---

## Layered Validation Model

E2E validates both **functional reliability** and **product quality** (agent-readiness).

| Layer | Module | Responsibility | CI impact |
|-------|--------|----------------|-----------|
| **L0 Reliability** | `e2e/lib/runner.ts` | Command exit codes, sync/regenerate side-effects | FAIL on error |
| **L1 Structure** | `e2e/lib/validators.ts` | Schema, sections, stubs, export headers | FAIL on error |
| **L2 Analysis** | `e2e/lib/validators/analysis.ts` | Detection, entrypoints, repo-map ↔ context alignment | Warning only |
| **L3 Consistency** | `e2e/lib/validators/consistency.ts` | Context reflected in generated docs | Warning only |
| **L4 Agent Readiness** | `e2e/lib/validators/readiness.ts`, `explain.ts` | Cursor rules, workflows, explain output | Warning only |
| **L5 Quality Score** | `e2e/lib/scoring.ts`, `validators/index.ts` | Weighted 0–100 composite score | Report only |

Quality warnings **do not fail CI**. Only L0/L1 errors cause `exit 1`.

### Quality dimension weights

| Dimension | Weight |
|-----------|--------|
| reliability | 25% |
| structure | 20% |
| analysis | 20% |
| consistency | 20% |
| agentReadiness | 15% |

---

## Repository Fixture Matrix

Fixtures live in `e2e/fixtures/` (source-only, no committed `.ai/` artifacts).

| ID | Type | Expected Verdict | Workflows |
|----|------|------------------|-----------|
| node-cli | Node.js CLI | PASS | full, sync, regenerate |
| express-api | Express API | PASS | full, sync, regenerate |
| react-vite | React + Vite | PASS | full, sync, regenerate |
| nextjs | Next.js (app/) | PARTIAL | full |
| nestjs | NestJS | PASS | full, sync, regenerate |
| python | Python | PARTIAL | full |
| minimal | Empty src/ | PARTIAL | full |
| monorepo | npm workspaces | PARTIAL | full |
| unsupported | Go only | PARTIAL | full |

Manifest: `e2e/fixtures/manifest.json`

### Adding a new fixture

1. Create `e2e/fixtures/<id>/` with minimal source files.
2. Add entry to `manifest.json` with expected detection, verdict, and optional quality fields:
   - `expectedArtifacts` — paths that must exist (e.g. `.cursor/rules/express-api-standards.mdc`)
   - `expectedDocMentions` — substrings required in specific docs
   - `expectedWorkflows` — workflow files that must exist
   - `minDocLength` — minimum character length per doc path
3. Run `npm run test:e2e -- --only=<id>` to validate locally.
4. Run `npm run test:e2e -- --only=<id> --update-baselines` after intentional generator changes.

---

## Validation Framework

### L1 — Structural (`e2e/lib/validators.ts`)

| Validator | Checks |
|-----------|--------|
| `validateConfig` | No persisted API keys, provider field |
| `validateRepoContext` | JSON schema (languages, frameworks, modules, patterns) |
| `validateRepoMap` | JSON structure |
| `validateMarkdownDoc` | Exists, non-empty, ground-truth marker, no stubs, required sections |
| `validateExport` | `.cursorrules` header and content |
| `validateState` | `state.json` hash format |
| `validateDetection` | Expected frameworks/modules/patterns (warnings for PARTIAL) |

### L2–L5 — Product quality (`e2e/lib/validators/`)

| Module | Checks |
|--------|--------|
| `analysis.ts` | TypeScript detection, entrypoints, repo-map ↔ repo-context alignment |
| `consistency.ts` | Frameworks/modules/patterns in docs; manifest `expectedDocMentions` |
| `readiness.ts` | Cursor rules with globs, workflows, agent rules, `expectedArtifacts` |
| `explain.ts` | Explain stdout structure (path, imports, skills sections) |
| `baseline.ts` | Content fingerprint drift vs `e2e/fixtures/baselines/<id>.json` |
| `index.ts` | Orchestrates all layers + scoring |

Behaviour is validated deterministically — no LLM judge, no network.

---

## Reporting

After each run, reports are written to `e2e/reports/latest/`:

| File | Contents |
|------|----------|
| `e2e-report.json` | Full structured report |
| `summary.json` | Pass/fail counts, duration |
| `compatibility-matrix.json` | Per-repo matrix with `overallQualityScore` |
| `quality-report.json` | Suite + per-fixture dimension scores |
| `SUMMARY.md` | Human-readable summary + quality dashboard |
| `<fixture-id>.json` | Per-repository detail including `quality` object |

CI uploads `e2e/reports/latest/` as artifact `e2e-reports`.

---

## GitHub Actions

| Workflow | File | Purpose |
|----------|------|---------|
| **Test** | `.github/workflows/test.yml` | Jest unit + integration (Node 18 & 20), bundle freshness |
| **E2E Test** | `.github/workflows/e2e-test.yml` | Bundle E2E release validation |

Both run on every PR and push to release branches. E2E is a separate workflow job (parallel to Test, not nested inside it).

---

## Local Execution

```bash
# Full E2E via standalone tester bundle (CI path)
npm run test:e2e

# Dev iteration via ts-node
npm run test:e2e:dev

# Build E2E tester bundle only
npm run bundle:e2e

# Single fixture
node releases/ai-workspace-e2e-tester.js fixtures --only=express-api

# External repository validation
node releases/ai-workspace-e2e-tester.js validate /path/to/repo --output ./my-reports

# Keep temp workspaces for debugging
node releases/ai-workspace-e2e-tester.js fixtures --keep-workspaces

# Update baselines after intentional generator changes
node releases/ai-workspace-e2e-tester.js fixtures --update-baselines

# Full suite: unit + E2E
npm run test:all
```

## Standalone bundle architecture

```
releases/
  ai-workspace.js                 # generates .ai/ artifacts
  ai-workspace-e2e-tester.js    # validates artifacts + quality reports
  e2e-fixtures/                   # fixture matrix (for fixtures command)
  e2e-reports/                    # default report output when bundled
```

Entry point: `e2e/cli.ts` → bundled via `npm run bundle:e2e` (`scripts/bundle-e2e-tester.js`).

Commands:

| Command | Purpose |
|---------|---------|
| `fixtures` | Run built-in fixture matrix (CI) |
| `validate <repo>` | Validate existing artifacts in any repository |
| `run <repo> --ai-workspace <path>` | Run ai-workspace bundle, then validate |

Legacy dev entry: `e2e/run.ts` (used by `test:e2e:dev`).

See also: [docs/E2E_TESTING.md](../docs/E2E_TESTING.md)
