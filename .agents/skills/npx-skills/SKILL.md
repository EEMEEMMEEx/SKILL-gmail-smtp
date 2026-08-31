---
name: npx-skills
description: >-
  Install, scaffold, configure, verify, and troubleshoot AI Agent Skills via npx,
  degit, and CLI package runners into workspace (.agents/skills/) or global config
  (~/.gemini/config/skills/).
---

# NPX Agent Skill Installation & Management Runbook

Use this runbook to install, scaffold, update, verify, and troubleshoot reusable Agent Skills using `npx` and CLI tools. Follow progressive disclosure and preserve clean project structures.

---

## 1. Prerequisites

Ensure the following runtimes and tools are available before installing skills:

- **Node.js**: v18.0.0+ (v20+ LTS recommended)
- **npm / npx**: v8.0.0+ (included with Node.js)
- **Git**: Installed and accessible in system `PATH`
- **Customization Roots**:
  - **Workspace Scope (Project-specific):** `<workspace-root>/.agents/skills/<skill-name>/`
  - **Global Scope (Machine-wide):**
    - Windows: `%USERPROFILE%\.gemini\config\skills\<skill-name>\`
    - macOS/Linux: `~/.gemini/config/skills/<skill-name>/`

---

## 2. Core Installation Commands (`npx`)

Always execute `npx` with `-y` (or `--yes`) in automation and agent environments to prevent interactive installation prompts from blocking execution.

### A. Install from GitHub / Remote Repositories (Recommended: `degit`)

`degit` downloads the repository files directly without cloning the full Git history:

```bash
# 1. Install into current Workspace (.agents/skills/)
npx -y degit <owner>/<skill-repo> .agents/skills/<skill-name>

# 2. Install into Global Config (Windows PowerShell)
npx -y degit <owner>/<skill-repo> "$env:USERPROFILE\.gemini\config\skills\<skill-name>"

# 3. Install into Global Config (macOS / Linux / Bash)
npx -y degit <owner>/<skill-repo> ~/.gemini/config/skills/<skill-name>
```

### B. Scaffold a New Custom Skill

Create a standardized skill directory structure:

```bash
# Scaffold into Workspace
npx -y create-agent-skill .agents/skills/<skill-name>

# Or manually scaffold with one-liner (PowerShell / Bash):
mkdir -p .agents/skills/<skill-name>/references .agents/skills/<skill-name>/scripts
```

---

## 3. Skill Installation Workflow

Follow this 4-stage operational sequence:

```text
[ 1. Discovery ] ──► [ 2. Target Scope ] ──► [ 3. Non-Interactive Install ] ──► [ 4. Verification ]
 Locate Skill Repo    Workspace / Global       npx -y degit <repo> <path>          Validate SKILL.md
```

### Step 1: Determine Target Scope
- Use **Workspace Scope** (`.agents/skills/`) when the skill is specific to the current project and should be shared with the team via version control.
- Use **Global Scope** (`~/.gemini/config/skills/`) when the skill provides cross-project utility (e.g. general debuggers, language standards, deploy tools).

### Step 2: Prepare Destination Directory
Ensure the parent directory exists:
```bash
# Workspace
mkdir -p .agents/skills

# Global (Windows PowerShell)
if (!(Test-Path "$env:USERPROFILE\.gemini\config\skills")) { New-Item -ItemType Directory -Path "$env:USERPROFILE\.gemini\config\skills" -Force }
```

### Step 3: Run Non-Interactive Installation
```bash
# Example: Install gmail-smtp skill
npx -y degit bearnannan/SKILL-gmail-smtp .agents/skills/gmail-smtp
```

### Step 4: Run Post-Installation Verification
Confirm that `SKILL.md` is positioned directly in the root of the skill folder.

---

## 4. Standard Skill Directory Structure

Every installed skill must adhere to the standard directory layout:

```text
skills/<skill_name>/
├── SKILL.md          # Required: Main instruction file with YAML frontmatter
├── references/       # Optional: Bulky API manuals, schemas, protocol docs
├── scripts/          # Optional: Executable helper scripts (Node, Python, Bash)
├── examples/         # Optional: Reference code snippets and sample configs
└── resources/        # Optional: Static assets, icons, templates
```

### Required `SKILL.md` Frontmatter Specification

```markdown
---
name: <lowercase-hyphenated-name>
description: >-
  Actionable summary explaining WHAT the skill does and WHEN the agent must trigger it.
---

# Skill Title

Clear, procedural instructions for the agent...
```

---

## 5. Usage & Triggering Examples

Once installed, skills are automatically discovered via **Progressive Disclosure**:

- **Model Decision (Automatic Trigger):** The agent scans skill descriptions and activates the skill when user requests match the skill's domain.
- **Explicit Mention:** The user can force-load a skill by mentioning `@<skill-name>` in the prompt:
  ```text
  @npx-skills How do I install a new skill for Docker deployment?
  ```
- **CLI Subagent Invocation:** When delegating tasks to subagents, specify the skill in the task prompt.

---

## 6. Verification Steps

Validate skill health immediately after installation:

1. **Check File Existence:**
   - Verify `SKILL.md` exists at `.agents/skills/<skill-name>/SKILL.md`.
2. **Validate YAML Frontmatter:**
   - Confirm lines 1-7 contain valid YAML with `name:` and `description:`.
   - Ensure `name` matches the directory basename and contains only lowercase alphanumeric characters and hyphens (`[a-z0-9-]`).
3. **Verify Executable Helper Permissions (macOS/Linux):**
   ```bash
   chmod +x .agents/skills/<skill-name>/scripts/* 2>/dev/null || true
   ```
4. **Inspect Progressive Discovery:**
   - Restart or refresh the agent session to confirm the skill appears in the active skill catalog.

---

## 7. Troubleshooting Common Installation Issues

| Issue / Symptom | Root Cause | Solution & Action |
|---|---|---|
| **CLI Hang / Interactive Prompt** | `npx` prompts `Need to install the following packages... (y)` | Always pass the `-y` or `--yes` flag: `npx -y <command>` |
| **Skill Not Discovered / Not Active** | `SKILL.md` is nested inside an extra subfolder (e.g. `<skill>/src/SKILL.md`) | Move `SKILL.md` directly to `.agents/skills/<skill-name>/SKILL.md` |
| **Invalid Frontmatter Error** | Missing closing `---` or invalid YAML indentation | Validate YAML syntax; ensure `name:` and `description:` are properly formatted |
| **Target Directory Exists (`destination exists`)** | `degit` prevents overwriting dirty directories by default | Add `--force` flag: `npx -y degit <repo> <path> --force` |
| **Permission Denied (`EACCES`)** | File system permission restrictions on global config | Check directory ownership; do NOT use `sudo npx`; fix directory write permissions |
| **Windows Path Separation Error** | Backslashes in CLI commands misinterpreted by shells | Wrap paths in quotes or use standard forward slashes `/` in path arguments |
| **Stale Package Cache** | `npx` cached an outdated version of the installer tool | Clear cache or specify version tag: `npx -y degit@latest <repo> <path>` |
