# Changelog

All notable changes to Schwiftyy. Format loosely follows [Keep a Changelog](https://keepachangelog.com).

## [0.2.0] - 2026-11-18

Schwiftyy moves into his own dimension: a proper Claude Code plugin.

### Added
- **Claude Code plugin + marketplace.** Install with `/plugin install schwiftyy --marketplace OxMediaEcomm/SchwiftyyAi`; start with `/schwiftyy:portal`
- **Local models.** Docs for running full Schwiftyy on Ollama through Claude Code, plus a chat-only `ollama/Modelfile` generated from the same identity file
- **`CLAUDE_CONFIG_DIR` support** for both install methods
- **`npx schwiftyy-cc uninstall`** (keeps your memory; `--purge` removes it too)
- Project memory folder `.schwiftyy/` is added to your `.gitignore` automatically (MEM-11)
- CI on Windows, macOS and Linux; npm releases now publish only from GitHub Actions, with provenance
- `docs/`: install guides, how it works, memory, releasing

### Changed
- **Schwiftyy no longer takes over every Claude Code session.** His identity moved out of `~/.claude/rules/` and only loads when you call him. Re-installing removes the old global rule
- **`/schwiftyy` actually works now.** The old layout registered the entry command as `/schwiftyy:schwiftyy`
- Chill/Pro rules live in one place (`identity.md`) instead of two
- `optimize` and `chat` pre-approve the edit tools they need, so no permission prompt on every fix or memory write
- Installer moved from `bin/` to `installer/`; `--force` is no longer needed (Schwiftyy's own files are always updated, your memory never is)
- Internal planning docs moved to `docs/development/planning/`

### Removed
- Installer now cleans up stray files the broken 0.1.0 npm build put in your config folder (only files it can identify by their `D:/Schwiftyy Ai` paths)

## [0.1.2] - 2026-11-18 (never published)

The npm package now matches this repo.

### Fixed
- **The published package was built from a local working folder, not this repo.** It shipped hardcoded `D:/` paths (portal and memory broke on other machines), personal rules and commands that installed into your global `~/.claude`, and Puppeteer + the MCP SDK as dependencies. 0.1.2 is built from this repo: zero dependencies, `~/.claude` paths only.
- `package.json` repository, homepage and bugs URLs now point at this repo

### Added
- README, banner, LICENSE, CONTRIBUTING, issue + PR templates
- Something in the installer. You'll figure it out.
- Schwiftyy learned a few new phrases. He won't tell you which.

> 0.1.1 was published and pulled the same day. It never existed as far as you're concerned.

## [0.1.0] - 2026-04-17

The portal opens for the first time.

### Added
- Zero-dependency installer: `npx schwiftyy-cc@latest install` (`--dry-run`, `--force`)
- `/schwiftyy` entry command with a 16-frame ANSI portal animation and a static fallback for non-TTY / `NO_COLOR`
- Five modes: `build`, `optimize`, `teach`, `chat`, `memory`
- Character identity rules with per-mode voice calibration and a Chill/Pro tone toggle
- Two-layer memory: per-project `.schwiftyy/memory.md` + global profile, milestone-gated writes, 80-line rotation to `memory-archive.md`
- First-run onboarding (3 questions, asked once)
