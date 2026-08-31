# Test Backlog — Prioritized Missing Cases

**Status after BC1 QA sprint:** 67 tests passing (was 33).  
**Strategy:** See `planning/TEST_STRATEGY.md`

---

## Implemented (this sprint)

| Priority | Case | File |
|---|---|---|
| P0 | Full workflow integration | `integration/workflow.integration.test.ts` |
| P0 | Config does not persist API keys | `integration/config-security.test.ts` |
| P0 | generate --ai exits 1 without key | `integration/error-handling.test.ts` |
| P0 | generate idempotency (hash skip) | `integration/workflow.integration.test.ts` |
| P0 | analyze/generate/export error paths | `integration/error-handling.test.ts` |
| P1 | status command health output | `integration/status.test.ts` |
| P1 | regenerate forces rebuild | `integration/regenerate.test.ts` |
| P1 | Artifact schema + sections | `integration/artifacts.test.ts` |
| P2 | Provider API errors (OpenAI/Anthropic) | `providers-extended.test.ts` |
| P3 | Analyzer: Express, React, empty, .aiignore | `unit/analyzer.test.ts` |
| P4 | Template generator structure | `unit/templateGenerator.test.ts` |
| P6 | architectureValidator newline (REG-01) | `unit/validators.test.ts` |
| P6 | context diff utility | `unit/context-diff.test.ts` |

---

## Remaining — Post-BC1 (ordered by risk)

### High (before public beta)

| ID | Case | Type | Risk |
|---|---|---|---|
| H-01 | `config` command read/write | integration | Users misconfigure provider |
| H-02 | `generate --ai` success with mocked runner | integration | LLM path untested E2E |
| H-03 | `sync` when framework dependency changes | integration | Stale context |
| H-04 | `init --user` interactive path (mock inquirer) | integration | Human init regression |
| H-05 | `skills generate` command | integration | Skills pipeline gap |

### Medium

| ID | Case | Type | Risk |
|---|---|---|---|
| M-01 | Monorepo with nested packages | analyzer | Known limitation |
| M-02 | Python-only repository | analyzer | Shallow detection |
| M-03 | Next.js / NestJS detection | analyzer | Framework gaps |
| M-04 | `context/builder.ts` token truncation | unit | Large repo prompt overflow |
| M-05 | `repo-map.json` structure validation | integration | Init artifact quality |
| M-06 | Permission denied on `.ctxstack/` write | integration | Edge case crashes |
| M-07 | Malformed `config.json` | integration | Graceful error message |
| M-08 | Network timeout simulation for providers | unit | Retry behavior N/A today |

### Low

| ID | Case | Type | Risk |
|---|---|---|---|
| L-01 | `export --target windsurf` | integration | Secondary target |
| L-02 | `export --target all` | integration | Multi-target |
| L-03 | Legacy `.ctxstack/skills` migration on init | integration | Migration path |
| L-04 | Agent-mode init handoff output | integration | Agent UX |
| L-05 | Performance: large repo scan time | benchmark | Not blocking beta |

---

## Refactoring debt (test architecture)

- [ ] Migrate legacy root tests (`init.test.ts`, etc.) to shared `helpers/cli.ts`
- [ ] Remove committed `.ctxstack/` artifacts from `__tests__/fixtures/` (generate at test time)
- [ ] Add `__tests__/fixtures/minimal/` source-only fixtures
- [ ] Silence expected stderr in tests via `runCli` capture assertions
