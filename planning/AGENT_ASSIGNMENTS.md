# Agent Assignments

## Branches

```
main (protected)
  └── v0.1.0-beta (integration)
        ├── phase1/stability    (Agent A) → merge first
        ├── phase1/testing      (Agent B) → merge second
        ├── phase1/docs         (Agent C) → after stability
        ├── phase1/ai-pipeline  (Agent D) → after stability
        └── phase1/release      (Agent E) → last
```

## Agent Scopes

### Agent A — Beta Stability Engineer
**Exclusive files:** `src/commands/init.ts`, `generate.ts`, `explain.ts`, `src/providers/*`, `src/workspace/sync.ts`, `src/generators/templateGenerator.ts`, `src/validators/architectureValidator.ts`, `src/skills/loader.ts`, `src/cli/index.ts`

### Agent B — Quality & Testing Engineer
**Exclusive files:** `.github/workflows/*`, `__tests__/*` (except providers.test.ts owned by D)

### Agent C — Documentation & Product Engineer
**Exclusive files:** `README.md`, `TESTING_GUIDE.md`, `.env.example`, `.ctxstack/*.md` (content restore)

### Agent D — AI Pipeline Engineer
**Files:** `src/agents/runner.ts`, `src/context/builder.ts`, `__tests__/providers.test.ts`  
**Must not edit:** `src/providers/local.ts`

### Agent E — Release Engineer
**Files:** `scripts/smoke-test.sh`, `CHANGELOG.md`, `package.json` (files/bin), `releases/*`, `planning/SMOKE_TEST_RESULTS.md`, `planning/RELEASE_CHECKLIST.md`

## Shared File Protocol

| File | Owner | Others |
|---|---|---|
| `src/cli/index.ts` | Agent A | C: version line only |
| `package.json` | C (version), E (publish fields) | E merges after C |

## Merge Order

stability → testing → (docs + ai-pipeline in parallel) → release
