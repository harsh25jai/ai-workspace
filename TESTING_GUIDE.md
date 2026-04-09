# 🚀 Tester Guide: ai-workspace

Welcome! You've been selected to test **ai-workspace**, a CLI tool that helps bridge the gap between your codebase and AI assistants by generating a structured, AI-native context layer.

## 📦 What is this?
`ai-workspace` scans your repository and generates machine-readable documentation and "skills" (rulesets). This allows AI agents to understand your project's architecture, patterns, and mission deeply *without* needing to ingest your entire source code.

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js installed (v18 or higher is recommended).
  ```bash
  node -v
  ```

### 2. Download the Tool
Your project lead has shared a file called `ai-workspace.js` (or `index.js`). Move this file to the root of the repository you want to analyze.

---

## 🏃 Commands Workflow

Run all commands using `node` followed by the filename:

### Phase 1: Initialize
Setup the `.ai` workspace directory and choose your AI provider.
```bash
node ai-workspace.js init
```
*   **Prompt**: You will be asked to select a provider (OpenAI, Anthropic, or Local).
*   **API Keys**: You can enter your keys during this step or add them to the generated `.ai/config.json` later.
*   **Initialization**: Creates `.ai/repo-map.json`.

### Phase 2: Analyze
Scan your code and generate the core context files.
```bash
node ai-workspace.js analyze
```
*   This creates `.ai/context/repo-context.json`.

### Phase 3: Generate
Build the human-readable (and AI-consumable) markdown documentation.
```bash
node ai-workspace.js generate
```
*   This generates `project.md`, `architecture.md`, and `rules.md` inside the `.ai/` folder.

---

## 🔍 Other Useful Commands

| Command | Description |
| :--- | :--- |
| `node ai-workspace.js status` | Check if your documentation is up to date or if analysis is missing. |
| `node ai-workspace.js config` | Interactively change your LLM provider or update API keys. |
| `node ai-workspace.js sync` | Incrementally update the workspace after you've added new files or frameworks. |
| `node ai-workspace.js regenerate` | Force a full rebuild of all documentation. |

---

## ⚙️ Configuration
You can find your settings in `.ai/config.json`. 
*   If you use **OpenAI/Anthropic**, ensure your key is present.
*   If you use **Local**, the CLI will simulate the AI responses (great for testing the structure without spending credits).

## 💬 Feedback
Please report any crashes, weird "hallucinated" framework detections, or instruction errors back to the project lead. Happy testing!
