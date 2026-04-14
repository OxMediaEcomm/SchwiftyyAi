# Project: Schwiftyy

## One-Liner
Schwiftyy is a downloadable Claude Code skill — a Rick & Morty-style sentient weed leaf AI companion — that instantly levels up beginner vibe coders with built-in design, frontend, and backend superpowers.

## Character
- **Name:** Schwiftyy
- **Visual:** Rick & Morty-style sentient weed leaf — Dimension C-420: Cannaboidian
- **Personality:** Chaotic, blunt, confident, occasionally unhinged. Makes learning non-intimidating.
- **Voice:** Rick-style — gives real answers, explains why, never lectures

## Delivery Model
- **Distribution:** GitHub repo + `npx schwiftyy@latest install`
- **Install target:** `~/.claude/` (Claude Code skill)
- **Updates:** Pushed as GitHub releases, users run npx to update
- **Entry point:** `/schwiftyy` slash command in Claude Code

## Core UX Flow
1. User runs `/schwiftyy`
2. Portal animation plays (ASCII/ANSI green swirling portal in terminal)
3. Schwiftyy drops in and displays the mode menu
4. User picks a mode/sub-command

## Modes (Sub-commands)
- `/schwiftyy:optimize` — scans existing project files, identifies issues, fixes + explains
- `/schwiftyy:build` — user describes goal, Schwiftyy architects + builds + teaches simultaneously
- `/schwiftyy:teach` — slower mode, more explanation, focused on learning
- `/schwiftyy:chat` — freeform conversation with Schwiftyy
- `/schwiftyy:memory` — view/manage session and project memory
- (additional modes to be defined during planning)

## Memory System (Two Layers)
### Project Memory (per-project)
- Lives in `<project-root>/.schwiftyy/memory.md`
- Stores: last session summary, what was built, where they left off, open threads
- Auto-updated after every session
- Read on next invoke to resume exactly where they left off

### Global Memory (cross-project)
- Lives in `~/.claude/schwiftyy/memory/global.md`
- Stores: patterns Schwiftyy learned, user's skill level progression, cross-project insights
- Schwiftyy gets smarter globally from every project it touches
- Feeds back into all future sessions

## Target Users
- **Primary:** Never coded before, just heard about vibe coding
- **Secondary:** Started vibe coding but keeps getting garbage output
- **NOT:** Experienced developers (they already have their own workflows)

## Monetization
- **Free:** Core Schwiftyy skill, portal animation, personality, basic modes
- **Pro:** Advanced agents, more dimensions/modes, cloud memory sync across machines
- **Teams:** Shared Schwiftyy config + memory across a team's Claude installs

## Tech Stack
- **Runtime:** Node.js (npx distribution)
- **Install target:** Claude Code `~/.claude/` skills directory
- **Memory format:** Markdown files (human-readable, writable by Claude)
- **Animation:** ASCII/ANSI terminal art
- **Agents:** GSD-style agent files bundled with the skill

## Success Criteria
- A vibe coder with zero experience installs Schwiftyy and produces quality output within their first session
- Memory persists across sessions — Schwiftyy picks up exactly where they left off
- Schwiftyy's global memory improves its guidance over time
- Install + first invocation takes under 2 minutes
