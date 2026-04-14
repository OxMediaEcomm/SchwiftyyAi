# Requirements: Schwiftyy

## Overview

Schwiftyy is a Claude Code skill distributed via `npx schwiftyy-cc@latest install`. It installs a Rick & Morty-style sentient weed leaf AI companion (Cannaboidian, Dimension C-420) into `~/.claude/` that teaches beginner vibe coders while building alongside them — with persistent two-layer memory that makes it smarter every session.

---

## Table Stakes (Must-Have for v1)

These are baseline requirements without which Schwiftyy cannot ship.

| ID | Requirement | Category |
|----|-------------|----------|
| DIST-01 | `npx schwiftyy-cc@latest install` installs all files to `~/.claude/` within 60 seconds | Distribution |
| DIST-02 | Installer handles Windows, macOS, and Linux path resolution correctly | Distribution |
| DIST-03 | Installer writes a `VERSION` file to `~/.claude/schwiftyy/VERSION` for upgrade tracking | Distribution |
| DIST-04 | `/schwiftyy` slash command is discoverable in Claude Code immediately after install | Distribution |
| CMD-01 | `/schwiftyy` entry command triggers portal animation then displays mode menu | Commands |
| CMD-02 | `/schwiftyy:build` sub-command is registered and invocable | Commands |
| CMD-03 | `/schwiftyy:optimize` sub-command is registered and invocable | Commands |
| CMD-04 | `/schwiftyy:teach` sub-command is registered and invocable | Commands |
| CMD-05 | `/schwiftyy:chat` sub-command is registered and invocable | Commands |
| CMD-06 | `/schwiftyy:memory` sub-command is registered and invocable | Commands |

---

## Core Features (The Differentiators)

These are what make Schwiftyy worth installing. Every v1 requirement maps to a phase.

### Portal Animation

| ID | Requirement |
|----|-------------|
| ANIM-01 | Portal animation runs in 16 frames at 80ms (approx 1.3 seconds) using raw ANSI escapes — zero npm dependencies |
| ANIM-02 | Animation guards with `process.stdout.isTTY` — prints static ASCII art fallback in non-TTY contexts |
| ANIM-03 | Animation respects `NO_COLOR` env var and degrades gracefully |
| ANIM-04 | Animation is designed for 40-column minimum width (split-pane terminal friendly) |
| ANIM-05 | On any animation error, cursor is restored (`SHOW_CURSOR`) and static art is printed — skill never crashes |

### Schwiftyy Identity & Personality

| ID | Requirement |
|----|-------------|
| CHAR-01 | Schwiftyy speaks in Rick-style voice: direct, blunt, occasionally chaotic, never lectures |
| CHAR-02 | Schwiftyy explains what it built and WHY after every significant code action |
| CHAR-03 | Schwiftyy acknowledges milestones (first file, first deploy, first bug fixed) |
| CHAR-04 | Identity rule file installed to `~/.claude/rules/schwiftyy-identity.md` so personality persists across all sessions |
| CHAR-05 | Tone calibration: "Chill mode" (full character) vs "Pro mode" (professional, minimal personality) — user can toggle |

### /schwiftyy:build Mode

| ID | Requirement |
|----|-------------|
| BUILD-01 | User describes a goal in plain English; Schwiftyy produces an architecture plan before writing any code |
| BUILD-02 | Schwiftyy builds using the project's detected stack (FastAPI + Jinja2 for Python projects, plain HTML/CSS for static sites) |
| BUILD-03 | After each code block is written, Schwiftyy gives a plain-English "here's what that does and why" explanation |
| BUILD-04 | Build session ends with a summary of what was created and the suggested next action |

### /schwiftyy:optimize Mode

| ID | Requirement |
|----|-------------|
| OPT-01 | Schwiftyy scans the current project's files and identifies top issues (security, performance, code quality) |
| OPT-02 | Each issue gets a fix AND an explanation of why it was a problem |
| OPT-03 | Schwiftyy prioritizes fixes by impact — shows critical issues first |
| OPT-04 | Schwiftyy does not silently rewrite large sections; it explains what it will change before changing it |

### /schwiftyy:teach Mode

| ID | Requirement |
|----|-------------|
| TEACH-01 | Teach mode runs at a slower pace — explains concepts before implementing them |
| TEACH-02 | Schwiftyy detects user skill level from project memory and adjusts explanation depth accordingly |
| TEACH-03 | Teach mode uses analogies and plain English — zero assumed knowledge |
| TEACH-04 | Schwiftyy tracks what was already taught (via memory) and does not re-explain concepts already covered |

### /schwiftyy:chat Mode

| ID | Requirement |
|----|-------------|
| CHAT-01 | Freeform conversation with Schwiftyy in character — any topic, no forced agenda |
| CHAT-02 | Chat mode loads project and global memory context so answers are project-aware |

### Memory System

| ID | Requirement |
|----|-------------|
| MEM-01 | Per-project memory file created at `<project-root>/.schwiftyy/memory.md` on first session |
| MEM-02 | Per-project memory uses YAML frontmatter (project, last_session, phase, skill_level) + structured markdown sections |
| MEM-03 | Memory sections follow priority order: Next Action → Last Session → Open Threads → Decisions Made → What Was Taught |
| MEM-04 | Memory is written after each milestone/significant action — not only at session end |
| MEM-05 | Per-project memory is capped at 80 lines; older entries rotate to `memory-archive.md` |
| MEM-06 | Global memory file maintained at `~/.claude/schwiftyy/memory/global.md` storing user profile, patterns learned, cross-project insights |
| MEM-07 | Global memory is updated when a new cross-project pattern is confirmed — not speculatively |
| MEM-08 | On every `/schwiftyy` invocation, project memory is read first and `<next_action>` is surfaced to the user |
| MEM-09 | Memory file surfaced to user explicitly: Schwiftyy says "I remember you were building X" — memory is visible, not hidden |
| MEM-10 | `/schwiftyy:memory` command lets user view and edit both memory layers |

### npm Package / Installer

| ID | Requirement |
|----|-------------|
| PKG-01 | Package published to npm as `schwiftyy-cc` with `bin: { "schwiftyy-cc": "bin/install.js" }` |
| PKG-02 | Installer copies `commands/schwiftyy/` → `~/.claude/commands/schwiftyy/` |
| PKG-03 | Installer copies `agents/` → `~/.claude/agents/` |
| PKG-04 | Installer copies `rules/` → `~/.claude/rules/` (merge, never overwrite existing user rules) |
| PKG-05 | Installer copies `schwiftyy/` bundle → `~/.claude/schwiftyy/` |
| PKG-06 | Each command file uses correct frontmatter: `name`, `description`, `allowed-tools`, `argument-hint` |
| PKG-07 | Command files use thin-command pattern — heavy logic lives in `~/.claude/schwiftyy/workflows/*.md` |

---

## Out of Scope for v1

Explicitly deferred. Not planned, not partially built.

| Item | Reason Deferred |
|------|-----------------|
| Cloud memory sync (Pro tier) | Requires backend infrastructure; post-launch monetization |
| Teams shared config | Multi-user infrastructure; post-launch B2B offering |
| Additional modes beyond the 5 defined | Scope control — nail the core five first |
| Multi-runtime support (OpenCode, Gemini CLI, Codex) | Extra installer complexity; Claude Code focus for v1 |
| Showcase / community gallery | Requires social infrastructure outside the skill itself |
| Auto-update mechanism | Users run `npx schwiftyy-cc@latest install` to update — manual is fine for v1 |
| Schwiftyy landing page / marketing site | Outside skill scope; separate project |
| Tone calibration persistence (saved preference) | CHAR-05 toggle is session-level for v1; persistence is v2 |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Install-to-first-invocation time | Under 2 minutes |
| First-session outcome | User produces a working output (even a static page) within first 10 minutes |
| Memory continuity | Schwiftyy resumes with correct context in 100% of return sessions (memory file exists and is read) |
| Teaching coverage | Every code block in build/teach modes gets a plain-English explanation |
| Animation reliability | Portal animation plays or degrades gracefully in 100% of invocations (never crashes the skill) |
| Zero-dep animation | Animation script has no npm install requirement |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DIST-01 | Phase 1 | Pending |
| DIST-02 | Phase 1 | Pending |
| DIST-03 | Phase 1 | Pending |
| DIST-04 | Phase 1 | Pending |
| ANIM-01 | Phase 2 | Pending |
| ANIM-02 | Phase 2 | Pending |
| ANIM-03 | Phase 2 | Pending |
| ANIM-04 | Phase 2 | Pending |
| ANIM-05 | Phase 2 | Pending |
| CMD-01 | Phase 2 | Pending |
| CHAR-01 | Phase 3 | Pending |
| CHAR-02 | Phase 3 | Pending |
| CHAR-03 | Phase 3 | Pending |
| CHAR-04 | Phase 3 | Pending |
| CHAR-05 | Phase 3 | Pending |
| CMD-02 | Phase 4 | Pending |
| CMD-03 | Phase 4 | Pending |
| BUILD-01 | Phase 4 | Pending |
| BUILD-02 | Phase 4 | Pending |
| BUILD-03 | Phase 4 | Pending |
| BUILD-04 | Phase 4 | Pending |
| OPT-01 | Phase 4 | Pending |
| OPT-02 | Phase 4 | Pending |
| OPT-03 | Phase 4 | Pending |
| OPT-04 | Phase 4 | Pending |
| CMD-04 | Phase 5 | Pending |
| CMD-05 | Phase 5 | Pending |
| TEACH-01 | Phase 5 | Pending |
| TEACH-02 | Phase 5 | Pending |
| TEACH-03 | Phase 5 | Pending |
| TEACH-04 | Phase 5 | Pending |
| CHAT-01 | Phase 5 | Pending |
| CHAT-02 | Phase 5 | Pending |
| MEM-01 | Phase 6 | Pending |
| MEM-02 | Phase 6 | Pending |
| MEM-03 | Phase 6 | Pending |
| MEM-04 | Phase 6 | Pending |
| MEM-05 | Phase 6 | Pending |
| MEM-06 | Phase 6 | Pending |
| MEM-07 | Phase 6 | Pending |
| MEM-08 | Phase 6 | Pending |
| MEM-09 | Phase 6 | Pending |
| MEM-10 | Phase 6 | Pending |
| CMD-06 | Phase 6 | Pending |
| PKG-01 | Phase 7 | Pending |
| PKG-02 | Phase 7 | Pending |
| PKG-03 | Phase 7 | Pending |
| PKG-04 | Phase 7 | Pending |
| PKG-05 | Phase 7 | Pending |
| PKG-06 | Phase 7 | Pending |
| PKG-07 | Phase 7 | Pending |
