---
name: LLM Provider Integration
type: domain-logic
importance: critical
files:
  - "src/providers/**/*"
  - "src/agents/runner.ts"
---

# LLM Provider Integration Skill

## Description
Standards for interacting with LLM APIs and managing model-specific logic.

## Rules
- **Fetch Patterns**: Use the native `fetch` API for all network requests.
- **Model Mapping**: Use the `ProviderFactory` to instantiate model classes.
- **Prompt Construction**: Always include the full `repo-context.json` footprint when building generation prompts.
- **Key Safety**: Never log API keys. Always prefer `dotenv` for secret management.

## AI Guidelines
- When implementing a new provider, inherit from the `AIProvider` interface.
- Ensure the `generate()` method handles non-200 responses gracefully with descriptive error messages parsed from the JSON body.
