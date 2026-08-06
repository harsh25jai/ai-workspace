# Troubleshooting

## `repo-context.json not found`

Run analyze before generate:

```bash
ai-workspace analyze
```

## `init` did not run analyze

Non-interactive environments (CI, piped stdin) skip analyze by default. Run explicitly:

```bash
ai-workspace analyze
```

## `generate --ai` fails with API key error

Set environment variable before running:

```bash
export OPENAI_API_KEY=sk-...
ai-workspace generate --ai
```

Keys are not stored in `config.json`.

## Empty or generic generated docs

**Cause:** Repository may not have a top-level `src/` directory, or has minimal modules.

**Fix:** Check [LIMITATIONS.md](./LIMITATIONS.md). For richer output, use `generate --ai` with a configured provider.

## `Workspace is already up to date` on generate

Context hash unchanged since last generation. Force rebuild:

```bash
ai-workspace regenerate
```

## `explain` path errors

- Use paths relative to repo root: `ai-workspace explain src/index.ts`
- Paths outside the repository are rejected for security

## `.cursor/rules` not created

Optional directory; may fail in restricted environments. `.cursorrules` export still works via `ai-workspace export`.

## Still stuck?

1. Run `ai-workspace status` for health check
2. See [examples/](../examples/) for expected output
3. File an issue with `ai-workspace status` output and repo layout
