# Claude Code Skill Distribution Research

**Project:** Schwiftyy
**Researched:** 2026-04-14
**Source:** Direct inspection of installed GSD package (get-shit-done-cc v1.34.2) at `~/.claude/` and npm cache

---

## 1. How Claude Code Skill Installation Works

### What goes in ~/.claude/

Claude Code reads from the global config directory `~/.claude/` (Windows: `C:/Users/<user>/.claude/`). The key subdirectories:

```
~/.claude/
  commands/          # Slash commands — each .md file = one /command
    caveman.md       # → /caveman
    inbox.md         # → /inbox
    send.md          # → /send
    <skill>/         # Subdirectory → /skill:subcommand pattern (legacy)
      help.md        # → /skill:help
  agents/            # Subagent definitions — named agents Claude can spawn
    planner.md
    gsd-executor.md
    ...
  rules/             # Auto-injected context rules (always in system prompt)
    identity.md
    stack.md
    coding-style.md
    ...
  <skill-bundle>/    # Arbitrary named dir for skill assets/workflows/refs
    workflows/
    references/
    templates/
    bin/
```

### Two formats for slash commands

**Legacy format (commands/gsd/*.md):** Each `.md` file in `~/.claude/commands/` becomes a slash command. Files in subdirectories create namespaced commands.

**Skills format (Claude Code 2.1.88+):** `~/.claude/skills/<skill-name>/SKILL.md` — one folder per skill. This is the current format. The installer converts command `.md` files into skill folders.

---

## 2. npx Distribution Pattern

GSD is the canonical reference. The pattern:

```bash
npx get-shit-done-cc@latest install
```

**npm package structure (package.json):**
```json
{
  "name": "get-shit-done-cc",
  "bin": { "get-shit-done-cc": "bin/install.js" },
  "files": ["bin", "commands", "get-shit-done", "agents", "hooks", "scripts"]
}
```

**What the installer does (`bin/install.js`):**
1. Detects platform (win32, WSL, linux/mac)
2. Determines target dir: `~/.claude/` for global, `./.claude/` for local/project
3. Copies `commands/gsd/*.md` → `~/.claude/commands/gsd/` (legacy) OR converts to `~/.claude/skills/gsd-*/SKILL.md` (current)
4. Copies `agents/*.md` → `~/.claude/agents/`
5. Copies skill bundle dir (e.g. `get-shit-done/`) → `~/.claude/get-shit-done/`
6. Supports multiple runtimes via flags: `--claude`, `--opencode`, `--gemini`, `--codex`, etc.
7. Writes a manifest for upgrade/uninstall tracking

**Schwiftyy equivalent:**
```bash
npx schwiftyy-cc@latest install
```

---

## 3. Installed File Structure

After install, GSD produces:

```
~/.claude/
  commands/
    gsd/
      help.md          # → /gsd:help
      new-project.md   # → /gsd:new-project
      plan-phase.md    # → /gsd:plan-phase
      ...
  agents/
    gsd-planner.md
    gsd-executor.md
    gsd-verifier.md
    ...
  rules/               # Injected by project CLAUDE.md, not by installer
  get-shit-done/       # Skill bundle assets
    bin/
      gsd-tools.cjs    # CLI tool called by workflows via Bash
      lib/
    workflows/         # Markdown workflow files referenced by commands
    references/        # Reference docs included via @path syntax
    templates/         # Template files
    contexts/
    VERSION
```

**For Schwiftyy, this maps to:**

```
~/.claude/
  commands/
    schwiftyy/
      help.md          # → /schwiftyy:help
      build.md         # → /schwiftyy:build
      optimize.md      # → /schwiftyy:optimize
      design.md        # → /schwiftyy:design
  agents/
    schwiftyy-ultron.md
    schwiftyy-jarvis.md
  rules/               # schwiftyy writes rules here on install
    identity.md
    design.md
    stack.md
  schwiftyy/           # Skill bundle assets
    workflows/
    references/
    templates/
    bin/
    VERSION
```

---

## 4. How Slash Commands Are Registered and Invoked

**Registration:** No registration step. Claude Code automatically discovers all `.md` files in `~/.claude/commands/` on startup. Files in subdirectories become namespaced.

**Command file format:**
```markdown
---
name: gsd:help
description: Show available GSD commands and usage guide
allowed-tools:
  - Read
  - Bash
argument-hint: "[phase number or name]"
---

Your command prompt here. Use $ARGUMENTS for user-provided args.

Reference other files with @~/.claude/get-shit-done/workflows/help.md
```

**Invocation:** User types `/gsd:help` or `/gsd:help some args` in Claude Code. Claude receives the `.md` content as a system prompt with `$ARGUMENTS` substituted.

**Key frontmatter fields:**
- `name` — the slash command name (e.g. `gsd:help` → `/gsd:help`)
- `description` — shown in command palette
- `allowed-tools` — restrict which tools the command can use (Read, Bash, Write, Grep, etc.)
- `argument-hint` — placeholder shown in UI when typing the command
- `agent` — spawn a named subagent instead of running inline

---

## 5. Sub-Commands: /schwiftyy:build, /schwiftyy:optimize etc.

**Mechanism:** The colon (`:`) in `name: schwiftyy:build` creates the sub-command namespace. It's just a naming convention — there's no special routing logic.

**Two implementation options:**

### Option A: Flat files in commands/schwiftyy/ (recommended)
```
commands/schwiftyy/
  help.md          # name: schwiftyy:help
  build.md         # name: schwiftyy:build
  optimize.md      # name: schwiftyy:optimize
  design.md        # name: schwiftyy:design
```
Each file has `name: schwiftyy:<subcommand>` in its frontmatter. Claude Code derives the slash command name from the frontmatter `name` field, not the filename.

### Option B: Skills format (Claude Code 2.1.88+)
```
~/.claude/skills/
  schwiftyy-build/
    SKILL.md         # name: schwiftyy-build (invoked as /schwiftyy-build)
  schwiftyy-optimize/
    SKILL.md
```
Note: Skills use hyphens, not colons. `/schwiftyy-build` not `/schwiftyy:build`. Stick with Option A for colon syntax.

**Thin command pattern (what GSD does):** Each command file is minimal — it just loads a workflow file:
```markdown
---
name: schwiftyy:build
description: Build and optimize your Schwiftyy project
allowed-tools:
  - Read
  - Bash
  - Write
---
$ARGUMENTS

<execution_context>
@~/.claude/schwiftyy/workflows/build.md
</execution_context>
```

The heavy logic lives in `~/.claude/schwiftyy/workflows/build.md`, not in the command file itself.

---

## 6. Technical Constraints and Limitations

### File system constraints
- Commands must be `.md` files — no `.yaml`, `.json`, or other formats
- No programmatic registration — purely file-based discovery
- Path references use `@~/.claude/...` syntax for file inclusion (read into context)
- `$ARGUMENTS` is the only variable substitution available in command files

### Context constraints
- Each command invocation is a new Claude conversation — no persistent state between `/schwiftyy:build` calls
- State must be written to disk (e.g. `.planning/state.md`) and re-read each session
- Large workflows must use `@file` includes to stay within context limits — don't embed everything in the command file

### Tool constraints
- `allowed-tools` in frontmatter restricts what tools the command can use
- If omitted, all tools are available
- Subagents (spawned via `Task` tool) can have different tool restrictions via their `agents/*.md` frontmatter

### Distribution constraints
- npx install is manual — users must run it; no auto-update
- The installer must handle: global vs local, platform detection, upgrade (diff old vs new files), uninstall
- Version tracking: write a `VERSION` file to `~/.claude/schwiftyy/VERSION`; installer checks it to decide upgrade

### Rules injection
- Files in `~/.claude/rules/` are auto-injected into every Claude Code session system prompt
- Schwiftyy can write `~/.claude/rules/identity.md`, `rules/design.md`, `rules/stack.md` on install to set persistent context
- Project-level `CLAUDE.md` can reference these via `@~/.claude/rules/identity.md`

### Multi-runtime support
- Same command files can be adapted for OpenCode, Gemini CLI, Codex, Copilot with path/frontmatter transforms
- GSD installer handles all transforms — Schwiftyy can copy this pattern for the runtimes it wants to support

---

## Schwiftyy npm Package Structure Recommendation

```
schwiftyy-cc/                    # npm package root
  package.json                   # bin: { "schwiftyy-cc": "bin/install.js" }
  bin/
    install.js                   # Installer: copies files to ~/.claude/
    schwiftyy-tools.cjs          # CLI helper (optional, like gsd-tools.cjs)
  commands/
    schwiftyy/
      help.md                    # /schwiftyy:help
      build.md                   # /schwiftyy:build
      optimize.md                # /schwiftyy:optimize
      design.md                  # /schwiftyy:design
      review.md                  # /schwiftyy:review
  agents/
    schwiftyy-ultron.md          # Design AI subagent
    schwiftyy-jarvis.md          # Technical AI subagent
  rules/
    identity.md                  # Jarvis/Ultron identity
    design.md                    # Design defaults
    stack.md                     # Stack rules
  schwiftyy/                     # Skill bundle assets
    workflows/                   # Heavy logic files
      build.md
      optimize.md
      design.md
    references/                  # Reference docs
    templates/                   # Starter templates
    VERSION
```

**Install command:**
```bash
npx schwiftyy-cc@latest install
```

**Installer copies to:**
- `commands/schwiftyy/` → `~/.claude/commands/schwiftyy/`
- `agents/` → `~/.claude/agents/`
- `rules/` → `~/.claude/rules/` (merge, don't overwrite)
- `schwiftyy/` → `~/.claude/schwiftyy/`

---

## Confidence

| Area | Level | Source |
|------|-------|--------|
| Command file format | HIGH | Direct inspection of installed GSD v1.34.2 |
| Skills format (2.1.88+) | HIGH | Installer source code comment + function |
| Sub-command colon syntax | HIGH | GSD command frontmatter (name: gsd:help) |
| npx distribution pattern | HIGH | package.json + install.js source |
| ~/.claude/ directory structure | HIGH | Live filesystem inspection |
| allowed-tools, argument-hint fields | HIGH | Command file frontmatter + installer source |
| Rules auto-injection | MEDIUM | Observed rules/ dir + GSD CLAUDE.md patterns |
