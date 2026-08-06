<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->
# Development Rules

## General Principles
- **Modularity:** Every new feature must be its own module under `src/`
- **Typing:** Use strict TypeScript. Avoid `any` unless necessary for external mocks
- **Statelessness:** Favor deterministic functions over stateful classes (except Provider implementations)

## CLI Standards
- All new commands in `src/commands/`, registered in `src/cli/index.ts`
- Use `inquirer@8` for interactive human flows (CommonJS compatibility)
- Prefer `fetch` over external HTTP libraries for provider communication
- Non-interactive defaults when stdin is not a TTY (CI support)

## AI Workspace Standards
- Never include raw source code in `repo-context.json`
- Update `state.json` fingerprints after every successful `generate` or `sync`
- Use YAML frontmatter for all `.skill.md` files
- Template `generate` is default; `--ai` requires configured provider

## Phase 1 Freeze
- No new AI features until `planning/RELEASE_CHECKLIST.md` passes
- No architecture rewrites unless required for C1–C8 blockers
