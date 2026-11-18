# Changelog

All notable changes to Schwiftyy. Format loosely follows [Keep a Changelog](https://keepachangelog.com).

## [0.1.2] - 2026-11-18

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
