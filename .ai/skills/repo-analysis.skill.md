---
name: Repository Analysis & Sync
type: core-logic
importance: high
files:
  - "src/analyzer/**/*"
  - "src/workspace/**/*"
  - "src/context/**/*"
---

# Repository Analysis & Sync Skill

## Description
Rules for structural repository scanning, diffing, and incremental updates.

## Rules
- **Ignore Rules**: Always respect `.aiignore` and basic glob patterns.
- **Incrementalism**: The `sync` command should only trigger actions for added or removed modules/frameworks.
- **Validation**: All AI-generated content must pass through `validators/` to strip hallucinated dependencies.
- **Repo Hash**: SHA256 fingerprints are the source of truth for workspace freshness.

## AI Guidelines
- When analyzing code, focus on the `src/` directory and package manifests.
- Do not provide raw source code to the LLM; strictly use the structured `repo-context.json` payload.
