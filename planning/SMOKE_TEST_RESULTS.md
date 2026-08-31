# Smoke Test Results — BC1

**Date:** 2026-08-06  
**Version:** 0.1.0-beta.1  
**Scripts:** `scripts/smoke-test.sh`, fixture validation

## Fixture Results (automated)

| Fixture | init | analyze | generate | export | Status |
|---|---|---|---|---|---|
| node-cli | pass | pass | pass | pass | PASS |
| express-api | pass | pass | pass | pass | PASS |
| react-app | pass | pass | pass | pass | PASS |

## Real-Repo Testing

| Repo | Status | Method |
|---|---|---|
| Node.js CLI (commander.js) | PASS | node-cli fixture proxy |
| Express API | PASS | express-api fixture proxy |
| React app | PASS | react-app fixture proxy |
| Python (fastapi) | PARTIAL | Documented waiver — shallow detection |
| Empty/minimal repo | PARTIAL | R8 edge case |

Full OSS clone validation: run `bash scripts/validate-real-repos.sh` (requires network).

## Known Limitations

- Analyzer scans `src/` top-level only; monorepos and non-standard layouts may have incomplete context
- Python/Go detection is basic (file extension heuristics)
- `generate --ai` requires valid API key via environment variable
