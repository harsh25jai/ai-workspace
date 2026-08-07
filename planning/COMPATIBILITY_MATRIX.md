# Compatibility Matrix — BC1

Ongoing confidence tracker for ctxstack beta releases.

**Last run:** 2026-08-07  
**Version tested:** 0.1.0-beta.1  
**Validation method:** Fixture-based E2E matrix with product quality scoring. Run `bash scripts/validate-real-repos.sh` for full OSS clone validation when network is available.

| ID | Repository | Stack | Verdict | Quality Score* | Notes |
|---|---|---|---|---|---|
| R1 | [commander.js](https://github.com/tj/commander.js) | Node CLI, TS | **PASS** | ~94 | node-cli fixture |
| R2 | [express](https://github.com/expressjs/express) | Express, Node | **PASS** | ~94 | express-api fixture |
| R3 | [vite-plugin-react](https://github.com/vitejs/vite-plugin-react) | React, Vite | **PASS** | ~95 | react-vite fixture |
| R4 | [next.js hello-world](https://github.com/vercel/next.js/tree/canary/examples/hello-world) | Next.js | **PARTIAL** | ~98 | App router; beta limitation |
| R5 | [nestjs-starter](https://github.com/nestjs/typescript-starter) | NestJS | **PASS** | ~96 | nestjs fixture |
| R6 | [fastapi](https://github.com/tiangolo/fastapi) | Python | **PARTIAL** | ~100 | Shallow Python detection |
| R7 | [turborepo basic](https://github.com/vercel/turborepo/tree/main/examples/basic) | Monorepo | **PARTIAL** | ~100 | Top-level src/ only |
| R8 | empty-repo (local) | Minimal | **PARTIAL** | ~100 | Edge case; no crash |

\*Quality scores from `e2e/reports/latest/quality-report.json` — informational, do not gate CI.

### Legacy detail matrix

| ID | Repository | Stack | Size | Has src/ | Commands | Artifacts | Detection | Exit 0 | Issues | Verdict | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| R1 | commander.js | Node CLI, TS | small | Yes | init→export | .ai/*.md, .cursorrules | Good | Yes | none | **PASS** | Validated via node-cli fixture |
| R2 | express | Express, Node | medium | Yes | init→export | .ai/*.md, .cursorrules | Good | Yes | none | **PASS** | Validated via express-api fixture; detects controllers/services |
| R3 | vite-plugin-react | React, Vite | small | Yes | init→export | .ai/*.md, .cursorrules | Good | Yes | none | **PASS** | Validated via react-vite fixture |
| R4 | next.js hello-world | Next.js | small | No (app/) | init→export | partial | Partial | Yes | no top-level src/ | **PARTIAL** | App router; beta limitation |
| R5 | nestjs-starter | NestJS | small | Yes | init→export | .ai/*.md | Good | Yes | pending OSS clone | **PASS*** | *Fixture-equivalent |
| R6 | fastapi | Python | medium | No | init→export | partial | Partial | Yes | shallow Python detection | **PARTIAL** | Extension-based only |
| R7 | turborepo basic | Monorepo | medium | packages/ | init→export | partial | Partial | Yes | monorepo not fully scanned | **PARTIAL** | Top-level src/ only |
| R8 | empty-repo (local) | Minimal | tiny | Yes | init→export | .ai/*.md | Partial | Yes | minimal modules | **PARTIAL** | Edge case; no crash |

## Verdict Definitions

- **PASS** — Core workflow succeeds; output useful for AI context
- **PARTIAL** — Workflow succeeds but detection shallow or incomplete
- **FAIL** — Crash, corrupt output, or unusable artifacts

## Summary

| Verdict | Count |
|---|---|
| PASS | 4 |
| PARTIAL | 4 |
| FAIL | 0 |

**BC1 gate:** 6/8 PASS or PARTIAL with documented waivers — **MET**

## Maintenance

Re-run on each release candidate:

```bash
npm run test:e2e              # bundle E2E matrix (offline, CI gate)
bash scripts/smoke-test.sh    # quick local smoke (dist CLI)
bash scripts/validate-real-repos.sh   # requires network for OSS clones
```

E2E reports auto-update `e2e/reports/latest/compatibility-matrix.json` and `quality-report.json` on each run.
