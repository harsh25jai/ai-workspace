# Release Checklist — BC1 (Beta Candidate)

**Version:** 0.1.0-beta.1  
**Target:** Closed beta (5–20 developers)  
**Last updated:** 2026-08-06

## Core Flow

- [x] PASS `ctxstack init` works without agent environment
- [x] PASS `.ctxstack/config.json` created (no API keys stored)
- [x] PASS `ctxstack analyze` produces `repo-context.json`
- [x] PASS `ctxstack generate` produces template content
- [x] PASS `ctxstack generate --ai` fails clearly without API key
- [x] PASS `ctxstack export` creates `.cursorrules`
- [x] PASS `ctxstack explain <file>` works with path guards
- [x] PASS `ctxstack sync` handles missing context

## Trust & Security (BC1)

- [x] PASS API keys not persisted in config.json
- [x] PASS explain rejects path traversal
- [x] PASS `--ai` partial failure exits non-zero
- [x] PASS Prompt context not logged to stdout

## Quality

- [x] PASS `npm test` (33 tests)
- [x] PASS CI workflow with bundle freshness check
- [x] PASS Compatibility matrix: 6/8 PASS or PARTIAL ([COMPATIBILITY_MATRIX.md](./COMPATIBILITY_MATRIX.md))

## Documentation & Showcase

- [x] PASS README honest about beta scope
- [x] PASS docs/ (BEFORE_AND_AFTER, WORKFLOW, CONFIGURATION, TROUBLESHOOTING, LIMITATIONS)
- [x] PASS examples/ (3 showcases)
- [x] PASS SMOKE_TEST_RESULTS updated

## Distribution

- [x] PASS `npm pack` produces valid tarball
- [x] PASS Bundle at `releases/ctxstack.js`
- [ ] PENDING `npm publish` (run manually — see [PUBLISHING.md](../PUBLISHING.md))
- [ ] PENDING GitHub Release with bundle attachment
- [ ] PENDING Git tag `v0.1.0-beta.1` on release commit

## Release Decision

| Stage | Status |
|---|---|
| Internal testing | **READY** |
| Closed beta | **READY** (after npm publish + tag) |
| Public beta | **NOT READY** (needs closed-beta feedback) |

**Status: READY FOR CLOSED BETA** (pending publish steps)
