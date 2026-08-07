# Workflow

## Typical first-time workflow

```bash
# 1. Initialize workspace
ctxstack init

# 2. Scan repository (skipped if init already analyzed in interactive mode)
ctxstack analyze

# 3. Generate documentation (template mode, no API key)
ctxstack generate

# 4. Export rules to IDE
ctxstack export

# 5. Verify health
ctxstack status
```

## Init behavior by environment

| Environment | Analyze on init? | Notes |
|---|---|---|
| Interactive terminal (TTY) | Yes (default, can decline) | Prompts for provider and analyze |
| Non-interactive (CI, pipes) | No | Run `analyze` explicitly |
| AI agent detected | Yes | Agent handoff mode with instructions |

## Incremental updates

After adding modules or frameworks:

```bash
ctxstack sync
ctxstack regenerate   # force rebuild, bypasses hash guard
```

## LLM-enhanced generation

```bash
export OPENAI_API_KEY=sk-...
ctxstack generate --ai
```

Or for Anthropic:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
ctxstack generate --ai
```

## Explain a file

```bash
ctxstack explain src/cli/index.ts
```

## Distribution options

- **npm:** `npm install -g ctxstack`
- **bundle:** `node releases/ctxstack.js <command>`
- **from source:** `npm link` after `npm run build`
