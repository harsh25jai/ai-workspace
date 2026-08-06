# Release Checklist — Beta 0.1.0-beta.1

Mark each item PASS or FAIL before publishing.

## Core Flow

- [x] PASS `ai-workspace init` works without agent environment
- [x] PASS `.ai/config.json` created on init
- [x] PASS `ai-workspace analyze` produces `repo-context.json`
- [x] PASS `ai-workspace generate` produces real template content (not stubs)
- [x] PASS `ai-workspace generate --ai` requires API key (clear error if missing)
- [x] PASS `ai-workspace export` creates `.cursorrules`
- [x] PASS `ai-workspace explain <file>` works
- [x] PASS `ai-workspace sync` handles missing context

## Quality

- [x] PASS `npm test` passes (30 tests)
- [x] PASS `npm run build` passes
- [x] PASS CI workflow defined (`.github/workflows/test.yml`)
- [x] PASS No "Simulated Local Output" in generated docs

## Distribution

- [x] PASS Version `0.1.0-beta.1` consistent (package.json, CLI --version)
- [x] PASS `package.json` includes `files` field for npm publish
- [x] PASS `npm run bundle` produces `releases/ai-workspace.js`
- [x] PASS Smoke test passes on 3 fixture repos

## Documentation

- [x] PASS README matches implemented commands
- [x] PASS TESTING_GUIDE matches npm + bundle flows
- [x] PASS `.env.example` present
- [x] PASS CHANGELOG.md updated

## Security

- [x] PASS API keys not logged to stdout during `generate --ai`
- [x] PASS No secrets in committed files

**Status: READY FOR BETA RELEASE**
