# Changelog

All notable changes to Schwiftyy. Format loosely follows [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

### Added
- README, banner, LICENSE, CONTRIBUTING, issue + PR templates
- Something in the installer. You'll figure it out.
- Schwiftyy learned a few new phrases. He won't tell you which.

### Fixed
- `package.json` repository, homepage and bugs URLs now point at this repo

## [0.1.0] - 2026-04-17

The portal opens for the first time.

### Added
- Zero-dependency installer: `npx schwiftyy-cc@latest install` (`--dry-run`, `--force`)
- `/schwiftyy` entry command with a 16-frame ANSI portal animation and a static fallback for non-TTY / `NO_COLOR`
- Five modes: `build`, `optimize`, `teach`, `chat`, `memory`
- Character identity rules with per-mode voice calibration and a Chill/Pro tone toggle
- Two-layer memory: per-project `.schwiftyy/memory.md` + global profile, milestone-gated writes, 80-line rotation to `memory-archive.md`
- First-run onboarding (3 questions, asked once)
