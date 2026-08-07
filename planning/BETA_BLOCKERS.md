# Beta Blockers

All blockers must pass before beta release. See `RELEASE_CHECKLIST.md` for go/no-go.

| ID | Issue | Owner | Acceptance Criteria | Validation |
|---|---|---|---|---|
| C1 | Human `init` disabled | Agent A | `ctxstack init` completes without agent env; creates `.ctxstack/` structure | `AI_AGENT=false ctxstack init` exits 0 |
| C2 | No `config.json` on init | Agent A | `config.json` always created with safe defaults | `test -f .ctxstack/config.json` after init |
| C3 | Providers ignore config keys | Agent A | OpenAI/Anthropic read `config.json` keys with env fallback | Unit test with config-only keys |
| C4 | Local provider corrupts docs | Agent A | Stub never overwrites `.ctxstack/*.md`; template mode is default | `generate` output ≠ "Simulated Local Output" |
| C5 | `sync` broken | Agent A | Missing context triggers analyze; skill actions execute | `sync` with no context runs analyze |
| C6 | `explain` missing | Agent A | `explain <file>` implemented | `ctxstack explain src/cli/index.ts` exits 0 |
| C7 | No CI | Agent B | `npm test && npm run build` on every PR | GitHub Actions green |
| C8 | Version mismatch | Agent C | Single version across package.json, CLI, changelog | `--version` matches package.json |
