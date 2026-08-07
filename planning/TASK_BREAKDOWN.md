# Task Breakdown

## Sprint 1 — Make it safe (Days 1–2)

| ID | Task | Agent | Depends | Files |
|---|---|---|---|---|
| T-003 | Safe local provider | A | T-002 | `src/providers/local.ts`, `src/agents/runner.ts` |
| T-004 | Config key wiring | A | T-002 | `src/providers/*.ts` |
| T-005 | Restore human init + config.json | A | T-002 | `src/commands/init.ts` |
| T-006 | Template generator | A | T-005 | `src/generators/templateGenerator.ts`, `src/commands/generate.ts` |
| T-007 | CI workflow | B | T-002 | `.github/workflows/test.yml` |
| T-009 | Restore `.ai/` docs | C | T-002 | `.ai/project.md`, `.ai/architecture.md`, `.ai/rules.md` |
| T-010 | Align version | C | T-002 | `package.json`, `src/cli/index.ts`, `CHANGELOG.md` |

## Sprint 2 — Make it usable (Days 3–5)

| ID | Task | Agent | Depends | Files |
|---|---|---|---|---|
| T-011 | `--ai` flag on generate | A | T-006 | `src/commands/generate.ts`, `src/cli/index.ts` |
| T-012 | Fix sync | A | T-006 | `src/workspace/sync.ts` |
| T-013 | Implement explain | A | T-006 | `src/commands/explain.ts`, `src/skills/loader.ts` |
| T-014 | Fix architectureValidator | A | T-002 | `src/validators/architectureValidator.ts` |
| T-015 | Integration tests | B | T-006, T-011 | `__tests__/*.test.ts` |
| T-017 | Reconcile docs | C | T-006 | `README.md`, `TESTING_GUIDE.md` |
| T-018 | `.env.example` | C | T-004 | `.env.example` |
| T-019 | Stabilize AI pipeline | D | T-004, T-011 | `src/agents/runner.ts`, `src/context/builder.ts` |
| T-020 | Provider contract tests | D | T-019 | `__tests__/providers.test.ts` |

## Sprint 3 — Beta packaging (Days 6–7)

| ID | Task | Agent | Depends | Files |
|---|---|---|---|---|
| T-021 | Smoke test script | E | T-015, T-019 | `scripts/smoke-test.sh`, `__tests__/fixtures/` |
| T-022 | Real-repo smoke test | E | T-021 | `planning/SMOKE_TEST_RESULTS.md` |
| T-023 | npm publish prep | E | T-010 | `package.json` |
| T-024 | Bundle release | E | T-023 | `releases/ctxstack.js` |
| T-025 | CHANGELOG + release | E | T-022, T-024 | `CHANGELOG.md` |
