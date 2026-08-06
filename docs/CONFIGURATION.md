# Configuration

## API keys (environment variables only)

API keys are **never stored** in `.ai/config.json`. Use environment variables:

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
```

Optional model overrides:

```bash
export OPENAI_MODEL=gpt-4
export ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

Copy [`.env.example`](../.env.example) to `.env` for local development.

## Provider config file

`.ai/config.json` stores non-sensitive settings only:

```json
{
  "provider": "openai",
  "model": "gpt-4"
}
```

Update interactively:

```bash
ai-workspace config
```

## Provider selection

| Provider | `generate --ai` | Notes |
|---|---|---|
| `openai` | Requires `OPENAI_API_KEY` | Default model: gpt-4 |
| `anthropic` | Requires `ANTHROPIC_API_KEY` | Default model: claude-3-5-sonnet-20241022 |
| `local` | Not supported for `--ai` | Use template `generate` instead |

## Security

- Add `.ai/config.json` to `.gitignore` if you customize it
- Never commit `.env` files
- Keys are read from environment at runtime only
