# Smoke Test Results — Beta 0.1.0-beta.1

**Date:** 2026-08-06  
**Script:** `scripts/smoke-test.sh`

## Fixture Results

| Fixture | init | analyze | generate | export | Status |
|---|---|---|---|---|---|
| node-cli | pass | pass | pass | pass | PASS |
| express-api | pass | pass | pass | pass | PASS |
| react-app | pass | pass | pass | pass | PASS |

## Real-Repo Testing (manual)

Test against diverse repositories before public beta:

- [ ] Node.js CLI project
- [ ] Express API with controllers/services
- [ ] React app with components
- [ ] Python project (known limitation: shallow detection)
- [ ] Empty/minimal repo

## Known Limitations

- Analyzer scans `src/` top-level only; monorepos and non-standard layouts may have incomplete context
- Python/Go detection is basic (file extension heuristics)
- `generate --ai` requires valid API key
