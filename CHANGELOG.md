# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-beta.1] - 2026-08-06

### Added
- Human-first `init` flow with non-interactive defaults for CI
- Template-based `generate` (default) — no API key required
- `generate --ai` and `regenerate --ai` for LLM-enhanced documentation
- `explain <file>` command for file-level context
- Provider config loading from `.ai/config.json` with env var fallback
- GitHub Actions CI workflow
- Integration tests for init, generate, sync, export
- Smoke test script for release validation
- `.env.example` for API key configuration
- `/planning/` contract documents for Phase 1 stabilization

### Fixed
- Local provider no longer overwrites `.ai/*.md` with stub content
- `sync` runs full analyze when context is missing
- `sync` skill generation actions now execute
- `architectureValidator` newline splitting bug
- Skills loader reads from `.agents/skills/` with legacy fallback
- Version alignment across package.json and CLI

### Changed
- Agent mode remains available as enhancement, not requirement
- LLM prompt context no longer logged to stdout in `--ai` mode
