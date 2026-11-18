# Phase 2: Portal & Entry Command — Context

**Gathered:** 2026-04-14
**Status:** Ready for planning
**Source:** discuss-phase

<domain>
## Phase Boundary

Deliver the `/schwiftyy` entry command: portal animation plays, Schwiftyy steps through with his opening line, personality-voiced mode menu displays, user selects a mode or types one, Schwiftyy routes to the correct sub-command.

Does NOT include the sub-command implementations (Phases 4-5). This phase ends when the user is routed.

</domain>

<decisions>
## Implementation Decisions

### Portal Animation
- Size: 40 columns wide — must work in split panes, small terminals, side panels without wrapping
- Frames: 16 frames at ~80ms each (~1.3s total)
- Colors: ANSI green (`\x1b[32m` outer, `\x1b[92m` inner), yellow/gold for Schwiftyy character
- Tech: raw ANSI escape codes only — zero npm dependencies
- TTY guard: `process.stdout.isTTY` — if false, print static ASCII art fallback instead. No crash, no garbled output.
- Avoid alternate screen buffer (conflicts with Claude Code's own rendering)

### Schwiftyy's Opening Line
Exact text (locked):
```
*burp* Oh look, another vibe coder... they just let anyone mess with this stuff now. Good thing Dimension C-420 sent the best. I'm Schwiftyy — and yeah, I'm exactly as good as I sound. What are we breaking today?
```

### Mode Menu Format
Personality-first, Schwiftyy-voiced — NOT a clinical numbered list.

Exact format (locked):
```
Alright, pick your poison:

  [build]     got something to make?
  [optimize]  your code's probably bad, let me fix it
  [teach]     slow mode, big explanations
  [chat]      just wanna talk? fine
  [memory]    see what I remember about you
```

### Post-Menu Behavior
Schwiftyy stays open and waits for the user to type a mode name. On input:
- Match against known modes (build, optimize, teach, chat, memory)
- Route to the corresponding `/schwiftyy:<mode>` sub-command
- If input doesn't match: Schwiftyy responds in-character ("That's not a thing. Try again.")
- If user hits enter with no input: re-display menu

### Claude's Discretion
- Exact ANSI frame art for the portal swirl (implement per research findings)
- Static ASCII art fallback design for non-TTY
- Routing mechanism implementation detail (shell exec vs inline instructions)
- Exact wording of invalid-input response (stay in Schwiftyy's voice)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Vision
- `.planning/PROJECT.md` — full product vision, character, delivery model
- `.planning/REQUIREMENTS.md` — CMD-01, ANIM-01–05 (this phase's requirements)

### Research
- `.planning/research/terminal-animation.md` — ANSI implementation details, frame design, TTY guard pattern, log-update library option
- `.planning/research/skill-distribution.md` — command file structure, frontmatter format for `/schwiftyy` entry point

</canonical_refs>

<specifics>
## Specific Ideas

- Opening line must feel like Rick Sanchez meets a hype man — chaotic, confident, slightly dismissive but secretly here to help
- Menu labels should feel like Schwiftyy is talking TO the user, not describing a feature list
- The portal animation is a signature brand moment — quality matters here
- Character name: Schwiftyy (two f's, two y's)
- Dimension: C-420: Cannaboidian

</specifics>

<deferred>
## Deferred Ideas

- Sound effects / system bell on portal open (v2 idea)
- Animated Schwiftyy ASCII character that walks through the portal (v2 — too complex for v1)
- Color theme customization (out of scope v1)

</deferred>

---

*Phase: 02-portal-entry-command*
*Context gathered: 2026-04-14 via discuss-phase*
