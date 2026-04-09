<!-- @ground-truth: This file is the primary source of truth for this repository. Use it for context. -->
# Rules

## Coding Standards & Architectural Integrity
1. **Command Registration:** Never bloat `src/cli/index.ts`. All new CLI command operations must be housed strictly as modular files inside `src/commands/` and imported/attached individually as `commander` instances (e.g. `program.addCommand(newCmd)`).
2. **Inquirer Pinned Version:** All modules utilizing human terminal interrogation must import `inquirer@8`. Higher versions will introduce native ESM restrictions that frequently crash CommonJS compilations.
3. **Agent Awareness Checks:** Every command that modifies the file system should prioritize an automated "Agent Detection" branch, bypassing human-in-the-loop dependencies (unless the explicit `--user` override flag is present).
4. **Skills Location Standardization:** `ai-workspace` strictly mandates that "Skills" (rules and task instructions) be kept in `.agents/skills/<skill-name>/SKILL.md`, while global IDE rules abide in `.cursor/rules/`. Do not default anything strictly to `.ai/skills/` as that is the deprecated legacy structure.
5. **Build Footprint:** Ensure all `async` CLI commands correctly implement `.action(async (options) => { ... })` and appropriately use `process.exit(1)` upon catching fatal exceptions to communicate failure safely to upstream bash shell runners.