---
phase: 02-portal-entry-command
plan: "01"
subsystem: animation
tags: [ansi, terminal, animation, portal, schwiftyy]
key-files:
  created:
    - commands/schwiftyy/schwiftyy-animation.js
  modified: []
decisions:
  - "Used regex-based colorization on raw string frames rather than building pre-colored strings, keeping frame definitions readable and 40-col width easy to verify"
  - "printOpeningLine() extracted as standalone function so it runs in both TTY and non-TTY paths after their respective output"
  - "STATIC_ART defined as joined string (not array) for simple console.log usage"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-14"
  tasks: 1
  files: 1
---

# Phase 02 Plan 01: Portal Animation Summary

**One-liner:** 16-frame green ANSI portal swirl with isTTY/NO_COLOR guard and static ASCII fallback, zero npm dependencies.

## What Was Built

`commands/schwiftyy/schwiftyy-animation.js` — standalone Node.js CJS script that plays the Schwiftyy brand portal animation before every invocation.

## Frame Sequence Design

- Frames 1-4: BRIGHT_GREEN `|` crack grows vertically, centered in 40 cols
- Frames 5-8: Oval portal widens using `/`, `\`, `|` border (GREEN) with `~`, `≈`, `@`, `o` swirl interior (BRIGHT_GREEN)
- Frames 9-12: Portal fully open, YELLOW `(~)` Schwiftyy silhouette visible inside
- Frames 13-15: Schwiftyy steps out of portal, portal begins closing
- Frame 16: Portal fully closed, Schwiftyy stands in front in YELLOW

Each frame: 7 lines, all <= 40 visible characters.

## ANSI Constants Used

| Constant | Code | Use |
|---|---|---|
| GREEN | `\x1b[32m` | Portal border/outer ring |
| BRIGHT_GREEN | `\x1b[92m` | Portal interior swirl chars |
| YELLOW | `\x1b[33m` | Schwiftyy `(~)` silhouette + opening line |
| RESET | `\x1b[0m` | After every colored segment |
| HIDE_CURSOR | `\x1b[?25l` | Before animation starts |
| SHOW_CURSOR | `\x1b[?25h` | After animation ends (always restored) |
| CLEAR_LINE | `\x1b[2K\r` | Per-line redraw |
| CURSOR_UP(n) | `\x1b[nA` | Move up n lines to redraw frame |

## Verification Results

- `NO_COLOR=1 node schwiftyy-animation.js` — prints static ASCII art + word-wrapped opening line, no ANSI codes
- `node schwiftyy-animation.js | cat` — same fallback (isTTY false in pipe)
- TTY mode: 16 frames animate at 80ms each, opening line prints in YELLOW after
- Zero `require()` calls to npm packages
- All frame lines and static art <= 40 chars (verified by inspection)

## Deviations from Plan

None — plan executed exactly as written.
