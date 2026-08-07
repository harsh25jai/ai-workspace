---
description: Full workspace analysis and regeneration
---
# Workflow: Regenerate Workspace
Run this workflow after significant code changes to ensure all documentation and rules are up to date.

1. Run "ctxstack analyze" to refresh repository context.
2. Run "ctxstack regenerate" to force rebuild documentation, rules, and workflows.
3. Verify .ai/ and .agents/ contents.
4. Call /update-readme to sync the main README.
