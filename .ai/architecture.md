# Architecture Documentation

## System Overview
The `ai-workspace` architecture is designed for modularity and extensibility, following a clear pipeline from raw file scanning to structured document generation.

## Core Modules
- **`cli/`**: Entry point using `commander`. Handles command routing and global configuration.
- **`analyzer/`**: Contains the `repoScanner`. Responsible for traversing the filesystem (respecting `.aiignore`) and identifying core metadata.
- **`plugins/`**: Framework-specific logic (e.g., `reactPlugin`, `nodePlugin`) used by the scanner to infer deeper patterns.
- **`providers/`**: Abstract communication layer for LLMs. Implements vendor-specific logic for live API calls via `fetch`.
- **`generators/`**: Logic for constructing various output artifacts like `repo-map.json`, `repo-context.json`, and `.skill.md` files.
- **`validators/`**: Content guardrails that sanitize LLM outputs to prevent hallucinations and enforce architectural truth.
- **`workspace/`**: State management (fingerprinting) and synchronization logic for incremental updates.

## Data Flow
1. **Init**: Scaffolds `.ai/` and configures AI providers.
2. **Analyze**: `Scanner` -> `Plugins` -> `repo-context.json`.
3. **Generate**: `repo-context.json` -> `Context Builder` -> `LLM Provider` -> `Validators` -> `.ai/*.md`.
4. **Sync**: `DiffEngine` -> `ChangeDetector` -> `Incremental Generator`.