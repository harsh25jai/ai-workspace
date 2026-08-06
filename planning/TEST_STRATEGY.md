# Test Strategy — ai-workspace BC1

**Version:** 0.1.0-beta.1  
**Owner:** QA / Engineering  
**Goal:** High-confidence beta releases without chasing line coverage.

---

## 1. Product Understanding

### Core functionality

| Area | Module | Business critical? |
|---|---|---|
| CLI routing | `src/cli/index.ts` | Yes |
| Workspace bootstrap | `src/commands/init.ts` | **P0** |
| Repository scan | `src/analyzer/repoScanner.ts` | **P0** |
| Context persistence | `src/generators/repoContextGenerator.ts` | **P0** |
| Template generation | `src/generators/templateGenerator.ts` | **P0** |
| LLM pipeline | `src/agents/runner.ts` | **P1** |
| Incremental sync | `src/workspace/sync.ts` | **P1** |
| IDE export | `src/commands/export.ts` | **P0** |
| Health check | `src/commands/status.ts` | **P1** |
| File explain | `src/commands/explain.ts` | **P2** |
| Agent detection | `src/utils/agentDetector.ts` | **P2** |

### Critical user journeys

1. **First run:** `init → analyze → generate → export`
2. **Refresh:** `sync` or `regenerate` after code changes
3. **LLM upgrade:** `generate --ai` with env API key
4. **Health:** `status` before committing `.ai/` changes

### Command flow

```
CLI → commands/* → analyzer | generators | workspace | agents/runner
                  → .ai/ + .agents/ + .cursorrules
```

---

## 2. Existing Test Audit

| File | Validates | Relevant? | Gaps |
|---|---|---|---|
| `verify-detector.ts` | Agent env detection (20 cases) | Yes | None for P2 scope |
| `init.test.ts` | `.ai/` + `config.json` created | Yes | No key-security assertion; uses shell exec |
| `generate.test.ts` | Template output not stub | Yes | No idempotency, no artifact schema |
| `sync.test.ts` | Module add + missing context | Yes | No framework change path |
| `export.test.ts` | `.cursorrules` created | Yes | No content parity with rules.md |
| `explain.test.ts` | Basic explain output | Yes | Runs in repo root only |
| `providers.test.ts` | Provider contract basics | Yes | No API error paths |
| `runner-security.test.ts` | AgentRunError + path escape | Yes | Single failure scenario |

**Weaknesses:**
- Duplicated `runCli` in 5 files (shell-based, brittle)
- No full workflow integration test
- No `status`, `regenerate`, `analyze` isolation tests
- No analyzer unit tests
- No regression tests tied to git fixes
- Fixture `.ai/` artifacts committed under `__tests__/fixtures/` (noise)

---

## 3. Risk-Based Test Plan

### P0 — Critical regression (must pass for release)

| ID | Test | File |
|---|---|---|
| P0-01 | Full workflow integration | `workflow.integration.test.ts` |
| P0-02 | init creates config without API keys | `config-security.test.ts` |
| P0-03 | generate --ai fails without key (exit 1) | `error-handling.test.ts` |
| P0-04 | generate skips when hash unchanged | `regenerate.test.ts` |
| P0-05 | analyze requires .ai/ | `error-handling.test.ts` |
| P0-06 | export requires rules.md | `error-handling.test.ts` |
| P0-07 | explain path traversal blocked | `runner-security.test.ts` |
| P0-08 | No stub text in template output | `generate.test.ts` |

### P1 — Integration

| ID | Test | File |
|---|---|---|
| P1-01 | status reflects healthy workspace | `status.test.ts` |
| P1-02 | regenerate forces rebuild | `regenerate.test.ts` |
| P1-03 | Artifact structure validation | `artifacts.test.ts` |
| P1-04 | sync idempotency when unchanged | `sync.test.ts` (extend) |

### P2 — Providers (mocked)

| ID | Test | File |
|---|---|---|
| P2-01 | OpenAI API error response | `providers-extended.test.ts` |
| P2-02 | Anthropic API error response | `providers-extended.test.ts` |
| P2-03 | OpenAI success path | `providers.test.ts` |

### P3 — Analyzer unit

| ID | Test | File |
|---|---|---|
| P3-01 | Express detection | `analyzer.test.ts` |
| P3-02 | React detection | `analyzer.test.ts` |
| P3-03 | Empty src/ repo | `analyzer.test.ts` |
| P3-04 | Entrypoint detection | `analyzer.test.ts` |

### P4 — File generation unit

| ID | Test | File |
|---|---|---|
| P4-01 | Template sections present | `templateGenerator.test.ts` |
| P4-02 | Ground-truth marker | `templateGenerator.test.ts` |

### P5 — Error handling

| ID | Test | File |
|---|---|---|
| P5-01 | Missing .ai on analyze | `error-handling.test.ts` |
| P5-02 | Missing context on generate | `error-handling.test.ts` |

### P6 — Regression (from git history)

| ID | Bug | Test |
|---|---|---|
| REG-01 | architectureValidator `\\n` bug | `validators.test.ts` |
| REG-02 | Local provider stub corruption (C4) | `generate.test.ts` |
| REG-03 | API keys in config (BC1-02) | `config-security.test.ts` |
| REG-04 | --ai partial success exit 0 (BC1-03) | `error-handling.test.ts` |
| REG-05 | sync early return (C5) | `sync.test.ts` |

---

## 4. Test Architecture

```
__tests__/
├── helpers/
│   ├── cli.ts          # execFileSync runner, captures exit codes
│   └── project.ts      # temp repo factory
├── unit/               # fast, no CLI
│   ├── analyzer.test.ts
│   ├── templateGenerator.test.ts
│   ├── validators.test.ts
│   └── context-diff.test.ts
├── integration/        # CLI subprocess tests
│   ├── workflow.integration.test.ts
│   ├── status.test.ts
│   ├── regenerate.test.ts
│   ├── config-security.test.ts
│   ├── error-handling.test.ts
│   └── artifacts.test.ts
└── (existing root tests migrated over time)
```

**Principles:**
- Use `execFileSync` not shell string (security + Windows compat)
- Temp dirs under `__tests__/.tmp-*` (gitignored)
- Mock `fetch` for all provider tests
- Structured assertions over snapshots
- Tests independent and parallel-safe

---

## 5. Coverage Assessment (critical gaps)

| Uncovered area | Risk | Recommended test |
|---|---|---|
| `regenerate` command | Medium | integration |
| `status` command | Low | integration |
| `config` command | Low | post-BC1 |
| `skills generate` | Low | post-beta |
| LLM success E2E | Medium | mocked provider in runner |
| Monorepo layouts | Known limitation | analyzer waiver doc only |
| Permission errors | Low | post-beta |

---

## 6. Beta Confidence Checklist

After full suite passes:

| Check | Covered? |
|---|---|
| Core workflows work | Yes — workflow.integration |
| No critical regression | Yes — REG-* tests |
| Generated outputs valid | Yes — artifacts + templateGenerator |
| Configuration works | Yes — config-security |
| Export works | Yes — export + workflow |
| Repository analysis works | Yes — analyzer unit + analyze |
| AI providers integrated | Partial — mocked only (acceptable for beta) |
| Release safe for closed beta | **Yes** |

**Not covered (acceptable for BC1):** live API calls, monorepo, Python depth, performance.

---

## 7. Maintenance

- Re-run full suite on every PR (CI)
- Add regression test for every P0 bug fix
- Re-run `scripts/smoke-test.sh` before release
- Expand analyzer tests when scanner scope grows
