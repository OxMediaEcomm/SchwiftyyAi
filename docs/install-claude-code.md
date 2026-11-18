# Install Schwiftyy in Claude Code

[← back to README](../README.md)

**You need:** [Claude Code](https://docs.claude.com/en/docs/claude-code) and any way of signing in to it: a Claude Pro/Max plan, an Anthropic API key, or [a local model through Ollama](install-ollama.md).

There are two ways to install. Pick one, not both.

| | **Plugin** (recommended) | **npm** |
|---|---|---|
| Install | One line inside Claude Code | One line in your terminal |
| Needs Node.js | No | Yes, 18+ |
| Updates | `/plugin` handles it | Re-run the install line |
| Start command | `/schwiftyy:portal` | `/schwiftyy` (or `/schwiftyy:portal`) |
| Memory lives in | `~/.schwiftyy/memory/` | `~/.schwiftyy/memory/` |

---

## Option A: Plugin (recommended)

Inside Claude Code, run:

```
/plugin install schwiftyy --marketplace OxMediaEcomm/SchwiftyyAi
```

On Claude Code older than 2.1.275, it's two steps:

```
/plugin marketplace add OxMediaEcomm/SchwiftyyAi
/plugin install schwiftyy@schwiftyy
```

Then start him:

```
/schwiftyy:portal
```

**Update:** `/plugin`, then **Marketplaces** → `schwiftyy` → **Update**. Or turn on auto-update there.
**Remove:** `/plugin uninstall schwiftyy@schwiftyy`

---

## Option B: npm

```bash
npx schwiftyy-cc@latest install
```

Then in Claude Code:

```
/schwiftyy
```

| Command | Does |
|---|---|
| `npx schwiftyy-cc@latest install` | Install, or update to the latest. Safe to re-run; your memory is never touched |
| `npx schwiftyy-cc@latest install --dry-run` | Show every file it would write. Writes nothing |
| `npx schwiftyy-cc@latest uninstall` | Remove Schwiftyy, keep your memory |
| `npx schwiftyy-cc@latest uninstall --purge` | Remove Schwiftyy *and* your memory |

### What it writes

| Path | What |
|---|---|
| `<config>/commands/schwiftyy.md` | `/schwiftyy` |
| `<config>/commands/schwiftyy/*.md` | `/schwiftyy:build`, `/schwiftyy:teach`, … |
| `<config>/schwiftyy/` | Identity, workflows, the portal, the memory hook, `VERSION` |
| `<config>/settings.json` | One `PreToolUse` hook entry so memory saves without prompts. Everything else in the file is left alone, and uninstall removes only that entry |

Your memory lives in `~/.schwiftyy/memory/`, outside the config folder. The installer never overwrites it.

`<config>` is `~/.claude`, or whatever `CLAUDE_CONFIG_DIR` is set to.

It also cleans up files that older versions installed: the old every-session identity rule, and stray files from the broken 0.1.0 npm build. It only removes files it can identify as Schwiftyy's own.

---

## Custom config folder (`CLAUDE_CONFIG_DIR`)

- **Plugin:** works automatically.
- **npm:** set the variable for the install so it lands in the right place:

  ```bash
  # macOS / Linux / Git Bash
  CLAUDE_CONFIG_DIR=~/.claude-work npx schwiftyy-cc@latest install
  ```

  ```powershell
  # PowerShell
  $env:CLAUDE_CONFIG_DIR="$HOME\.claude-work"; npx schwiftyy-cc@latest install
  ```

---

## Upgrading from 0.1.x

Versions up to 0.1.2 installed Schwiftyy's identity into `~/.claude/rules/`, which made **every** Claude Code session talk like him. Re-running the npm install (or switching to the plugin) removes it. He now only shows up when you call him.

If you move from npm to the plugin, uninstall the npm copy first so you don't get two of everything:

```bash
npx schwiftyy-cc@latest uninstall
```

Since 0.2.1, both install methods share the same memory in `~/.schwiftyy/memory/`, so switching keeps everything he knows about you. Re-running the npm installer moves memory from the old `<config>/schwiftyy/memory/` location automatically.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `/schwiftyy` doesn't show up | Restart Claude Code, or run `/reload-plugins` (plugin install) |
| Portal prints plain text, no animation | Normal when output isn't a real terminal, or `NO_COLOR` is set |
| He asks permission for every edit | Expected the first time each tool runs, unless your permission mode auto-approves |
| `Permission denied writing to …` | Your config folder isn't writable. Fix ownership or set `CLAUDE_CONFIG_DIR` |
