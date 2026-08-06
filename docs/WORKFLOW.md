# Workflow

## Typical first-time workflow

```bash
# 1. Initialize workspace
ai-workspace init

# 2. Scan repository (skipped if init already analyzed in interactive mode)
ai-workspace analyze

# 3. Generate documentation (template mode, no API key)
ai-workspace generate

# 4. Export rules to IDE
ai-workspace export

# 5. Verify health
ai-workspace status
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
ai-workspace sync
ai-workspace regenerate   # force rebuild, bypasses hash guard
```

## LLM-enhanced generation

```bash
export OPENAI_API_KEY=sk-...
ai-workspace generate --ai
```

Or for Anthropic:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
ai-workspace generate --ai
```

## Explain a file

```bash
ai-workspace explain src/cli/index.ts
```

## Distribution options

- **npm:** `npm install -g ai-workspace`
- **bundle:** `node releases/ai-workspace.js <command>`
- **from source:** `npm link` after `npm run build`
