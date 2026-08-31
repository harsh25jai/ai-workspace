# Troubleshooting

## `repo-context.json not found`

Run analyze before generate:

```bash
ctxstack analyze
```

## `init` did not run analyze

Non-interactive environments (CI, piped stdin) skip analyze by default. Run explicitly:

```bash
ctxstack analyze
```

## `generate --ai` fails with API key error

Set environment variable before running:

```bash
export OPENAI_API_KEY=sk-...
ctxstack generate --ai
```

Keys are not stored in `config.json`.

## Empty or generic generated docs

**Cause:** Repository may not have a top-level `src/` directory, or has minimal modules.

**Fix:** Check [LIMITATIONS.md](./LIMITATIONS.md). For richer output, use `generate --ai` with a configured provider.

## `Workspace is already up to date` on generate

Context hash unchanged since last generation. Force rebuild:

```bash
ctxstack regenerate
```

## `explain` path errors

- Use paths relative to repo root: `ctxstack explain src/index.ts`
- Paths outside the repository are rejected for security

## `.cursor/rules` not created

Optional directory; may fail in restricted environments. `.cursorrules` export still works via `ctxstack export`.

## Still stuck?

1. Run `ctxstack status` for health check
2. See [examples/](../examples/) for expected output
3. File an issue with `ctxstack status` output and repo layout
