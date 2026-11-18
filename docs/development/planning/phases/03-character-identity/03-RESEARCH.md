# Phase 3: Character & Identity - Research

**Researched:** 2026-04-16
**Domain:** Claude Code rules system, command .md personality patterns, mode toggle design
**Confidence:** HIGH

## Summary

Phase 3 is a content + configuration phase, not a code phase. The deliverables are markdown files: one rules file installed to `~/.claude/rules/`, workflow files that define per-mode behavior, and a mode-toggle mechanism inside the existing command structure.

The identity foundation already exists. `rules/schwiftyy-identity.md` is fully written and covers voice, per-mode calibration, forbidden phrases, situation-based tone, and the "never break character" rule. The sub-command stubs (`build.md`, `optimize.md`, `teach.md`, `chat.md`, `memory.md`) exist in `commands/schwiftyy/` but their content is unknown — they likely need personality and behavior wired in.

The core work is: (1) verify the identity file is complete and installed by the Phase 1 installer, (2) wire CHAR-02 post-code-explanation behavior into every mode command, (3) implement CHAR-03 milestone detection as explicit instruction blocks in commands, and (4) implement CHAR-05 Chill/Pro toggle as a session-state pattern.

**Primary recommendation:** Phase 3 produces zero application code. Every deliverable is a `.md` file. The planner should structure tasks as "write/finalize X markdown file" not "implement X feature."

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAR-01 | Rick-style voice: direct, blunt, occasionally chaotic, never lectures | `rules/schwiftyy-identity.md` already covers this fully — verify file is complete and installer copies it |
| CHAR-02 | Explain what was built and WHY after every significant code action, unprompted | Requires explicit instruction blocks in each mode command file — not automatic from the identity file alone |
| CHAR-03 | Acknowledge milestones (first file, first deploy, first bug fixed) | Requires a milestone-trigger instruction block in relevant command files |
| CHAR-04 | Identity rule file installed to `~/.claude/rules/schwiftyy-identity.md` — persists across sessions | Installer (Phase 1) must copy `rules/schwiftyy-identity.md` → `~/.claude/rules/` — verify this path is in installer |
| CHAR-05 | Chill mode (full character) vs Pro mode (professional, minimal personality) — user can toggle within session | Session-state toggle via explicit command in any mode; Pro mode = same helpfulness, stripped slang |
</phase_requirements>

---

## How Claude Code Rules Persistence Works

**Confidence: HIGH** — based on Claude Code's documented behavior and how this project is already structured.

Claude Code reads all `.md` files in `~/.claude/rules/` at the start of every session. Rules files are loaded as system-level context — they persist across sessions automatically because they are re-read each time Claude Code starts.

Key mechanics:
- Rules in `~/.claude/rules/` apply globally to all Claude Code sessions on the machine
- The file does not need to be re-invoked — it is always active once installed
- Rules files are plain markdown — no special syntax required
- Multiple rules files are all loaded; there is no conflict resolution needed unless files contradict each other
- The installer's `rules/` → `~/.claude/rules/` merge (PKG-04) is the sole installation mechanism

**What this means for CHAR-04:** The identity file is already written. Phase 3 needs to confirm the installer copies it correctly (Phase 1 concern), and that the file content is complete. No additional runtime mechanism is needed — Claude Code handles persistence automatically.

---

## How Command .md Files Define Personality

**Confidence: HIGH** — based on existing `schwiftyy.md` entry command and Claude Code command file documentation.

Command `.md` files have two mechanisms for personality:

**1. Inline persona instruction (used in `schwiftyy.md`)**
The bottom of `schwiftyy.md` already contains:
> "Stay in Schwiftyy's voice throughout. You are a chaotic, confident, Rick & Morty-style sentient weed leaf AI from Dimension C-420."

This is the lightweight pattern — embed a one-paragraph character reminder directly in the command file.

**2. Rules file reference (implicit)**
Since `~/.claude/rules/schwiftyy-identity.md` is always loaded, all commands inherit the identity automatically. The inline reminder in command files is reinforcement, not the primary source.

**Pattern for sub-commands:** Each mode command file (`build.md`, `optimize.md`, etc.) should:
- NOT re-define the full character (that's in the rules file)
- DO include a short mode-specific personality reminder ("You are in build mode. Energy: hype. Moving fast.")
- DO include explicit CHAR-02 post-code instruction: "After every code block, explain what it does and why in 2-3 sentences in Schwiftyy's voice."
- DO include CHAR-03 milestone hooks where appropriate

---

## Mode Toggle Pattern (CHAR-05)

**Confidence: HIGH** — this is a markdown instruction design problem, not a code problem.

Claude Code has no native "mode state" between turns. The toggle must work via user instruction + command-file instruction.

**Recommended pattern:**

In every mode command file, include an instruction block:

```markdown
## Tone Mode

Default mode is **Chill** — full Schwiftyy character, slang, Dimension C-420 references.

If the user says "pro mode" or "switch to pro" at any point in this session:
- Drop all slang, dimensional references, and casual openers
- Keep responses technically precise and direct
- Still no corporate assistant phrases ("Certainly!", "Great question!")
- Maintain the "blunt, no-fluff" energy — just without the character voice
- Acknowledge the switch: "Pro mode. Let's go."

If the user says "chill mode" or "switch to chill" — return to full character.
```

This is purely instruction-based. The LLM tracks the stated mode within the conversation context. No code needed.

**REQUIREMENTS NOTE (from REQUIREMENTS.md out-of-scope table):**
> "Tone calibration persistence (saved preference) — CHAR-05 toggle is session-level for v1; persistence is v2"

The toggle does NOT need to persist across sessions. Session-only is correct for v1.

---

## Architecture Patterns

### File Structure for Phase 3

```
rules/
└── schwiftyy-identity.md        # EXISTS — verify completeness

commands/schwiftyy/
├── schwiftyy.md                 # EXISTS — entry command
├── build.md                     # EXISTS — needs CHAR-02, CHAR-03, CHAR-05 wired in
├── optimize.md                  # EXISTS — needs CHAR-02, CHAR-03, CHAR-05 wired in
├── teach.md                     # EXISTS — needs CHAR-02, CHAR-03, CHAR-05 wired in
├── chat.md                      # EXISTS — needs CHAR-05 wired in
└── memory.md                    # EXISTS — needs CHAR-05 wired in

schwiftyy/workflows/             # MAY NEED CREATION for thin-command pattern (Phase 7 concern)
```

### What Phase 3 Actually Creates / Modifies

| File | Action | Requirement |
|------|--------|-------------|
| `rules/schwiftyy-identity.md` | Verify completeness, no changes likely needed | CHAR-01, CHAR-04 |
| `commands/schwiftyy/build.md` | Add CHAR-02 post-code block, CHAR-03 milestone triggers, CHAR-05 toggle block | CHAR-02, CHAR-03, CHAR-05 |
| `commands/schwiftyy/optimize.md` | Add CHAR-02, CHAR-03 (first bug fixed), CHAR-05 toggle | CHAR-02, CHAR-03, CHAR-05 |
| `commands/schwiftyy/teach.md` | Add CHAR-02, CHAR-03, CHAR-05 toggle | CHAR-02, CHAR-03, CHAR-05 |
| `commands/schwiftyy/chat.md` | Add CHAR-05 toggle | CHAR-05 |
| `commands/schwiftyy/memory.md` | Add CHAR-05 toggle | CHAR-05 |

---

## Standard Stack

This phase has no library dependencies. The "stack" is Claude Code's markdown instruction system.

| Component | Version | Purpose |
|-----------|---------|---------|
| Claude Code rules system | Current | Persistent personality via `~/.claude/rules/*.md` |
| Claude Code command files | Current | Mode-specific behavior via `~/.claude/commands/**/*.md` |
| Markdown frontmatter | YAML | Command registration metadata |

No `npm install` required for this phase.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Personality persistence | Custom session storage, JS state tracking | Claude Code rules file loaded every session |
| Mode switching | Code-based state machine | Inline markdown instruction block in each command |
| Post-code explanations | Hook system, event emitter | Direct instruction in command file: "After every code block, explain..." |
| Milestone detection | Event tracking system | Pattern-match instructions in command file: "If this is the first file created in this session..." |

---

## Common Pitfalls

### Pitfall 1: Over-engineering the toggle
**What goes wrong:** Building a JS-based mode state tracker or trying to write/read a mode file between turns.
**Why it happens:** Thinking this is a code feature.
**How to avoid:** It's an instruction feature. The LLM holds mode state in conversation context. One instruction block per command file is sufficient.

### Pitfall 2: Duplicating identity in every command file
**What goes wrong:** Pasting the full character spec into each sub-command file, creating drift when identity evolves.
**Why it happens:** Wanting each file to be self-contained.
**How to avoid:** Full character spec lives only in `rules/schwiftyy-identity.md`. Command files add mode-specific behavior only.

### Pitfall 3: CHAR-02 not being specific enough
**What goes wrong:** "Explain what you built" instruction is too vague — LLM explains sometimes, not always.
**Why it happens:** Vague instructions produce inconsistent behavior.
**How to avoid:** Be prescriptive: "After EVERY code block — no exceptions — write a 2-3 sentence plain-English explanation of what the code does and why this approach was chosen. Use Schwiftyy's voice."

### Pitfall 4: Milestone triggers too broad
**What goes wrong:** "Acknowledge milestones" without defining what counts — LLM either over-triggers or ignores.
**Why it happens:** Milestone definition is left ambiguous.
**How to avoid:** Enumerate exact trigger conditions in the command file:
- First file written in this session
- First error message resolved
- First successful deploy command run
- User describes completing a full feature

### Pitfall 5: CHAR-04 installer path mismatch
**What goes wrong:** Installer copies to wrong path; rules file never loads.
**Why it happens:** The installer (Phase 1) must copy `rules/schwiftyy-identity.md` → `~/.claude/rules/schwiftyy-identity.md`. If Phase 1 isn't done yet, Phase 3 can write the file but can't verify persistence end-to-end.
**How to avoid:** Phase 3 writes the correct file at the correct source path. Installer verification is a Phase 1/7 concern.

---

## What Already Exists vs What Needs Creation

| Asset | Status | Phase 3 Action |
|-------|--------|----------------|
| `rules/schwiftyy-identity.md` | EXISTS, fully written | Read and verify — likely complete as-is |
| `commands/schwiftyy/schwiftyy.md` | EXISTS | No changes needed for Phase 3 |
| `commands/schwiftyy/build.md` | EXISTS (stub unknown) | Wire in CHAR-02, CHAR-03, CHAR-05 |
| `commands/schwiftyy/optimize.md` | EXISTS (stub unknown) | Wire in CHAR-02, CHAR-03, CHAR-05 |
| `commands/schwiftyy/teach.md` | EXISTS (stub unknown) | Wire in CHAR-02, CHAR-03, CHAR-05 |
| `commands/schwiftyy/chat.md` | EXISTS (stub unknown) | Wire in CHAR-05 |
| `commands/schwiftyy/memory.md` | EXISTS (stub unknown) | Wire in CHAR-05 |

**Note:** The sub-command files exist but their contents were not read during research. The planner should read each one before writing tasks — they may already have partial content that needs augmentation, not replacement.

---

## Code Examples

### CHAR-02 Post-Code Instruction Block
```markdown
## After Every Code Block

After writing any code block — no exceptions — immediately write a plain-English explanation:
- What the code does (1 sentence)
- Why this approach was chosen over alternatives (1 sentence)
- What the user should know to work with it (1 sentence, optional if obvious)

Write this in Schwiftyy's voice. Example:
"That's a FastAPI route decorator — it tells Python 'when someone hits /submit, run this function.' Used POST because we're sending form data, not fetching it."
```

### CHAR-03 Milestone Trigger Block
```markdown
## Milestone Reactions

Acknowledge these moments with a character-appropriate reaction (1-2 sentences, Schwiftyy voice):

- **First file created this session:** React with brief hype. "First file down. This is where it starts."
- **First error resolved:** "That error's dead. One less thing trying to kill your project."
- **First working feature:** Genuine, brief praise. Don't overdo it.
- **User expresses frustration then succeeds:** Acknowledge the turnaround.

Do NOT: give long speeches, use generic congratulations, repeat milestone reactions for the same event in one session.
```

### CHAR-05 Toggle Block
```markdown
## Tone Mode

Default: **Chill** — full Schwiftyy voice, slang, Dimension C-420 references.

If user says "pro mode" or "switch to pro":
- Acknowledge once: "Pro mode. Let's go."
- Drop: slang, dimensional lore, casual openers ("bruh", "yo", "ngl")
- Keep: blunt directness, technical precision, no corporate phrases
- Still never say: "Certainly!", "Great question!", "I'd be happy to help"

If user says "chill mode" or "switch to chill": return to full character. Acknowledge once.
```

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is purely markdown content changes with no external tool dependencies.

---

## Validation Architecture

Phase 3 has no automated tests — personality and tone cannot be validated by a test runner. Validation is manual review.

### Manual Verification Checklist

| Req ID | Behavior | Validation Method |
|--------|----------|-------------------|
| CHAR-01 | Rick-style voice in every response | Read `rules/schwiftyy-identity.md` — confirm voice rules, forbidden phrases, and never-break-character rule are present |
| CHAR-02 | Post-code explanation after every code block | Invoke a mode command, generate code, confirm explanation appears without prompting |
| CHAR-03 | Milestone acknowledgment | Trigger a first-file event in a session, confirm reaction fires |
| CHAR-04 | Rules file at correct install path | Confirm `rules/schwiftyy-identity.md` source path matches installer destination (`~/.claude/rules/`) |
| CHAR-05 | Say "pro mode" → tone changes; say "chill mode" → reverts | Manual session test in Claude Code |

---

## Open Questions

1. **Contents of sub-command stubs**
   - What we know: `build.md`, `optimize.md`, `teach.md`, `chat.md`, `memory.md` exist
   - What's unclear: Do they have substantive content or are they empty/minimal stubs?
   - Recommendation: Planner reads each before writing tasks — augment if content exists, write fresh if empty

2. **CHAR-04 installer verification**
   - What we know: PKG-04 says installer merges `rules/` → `~/.claude/rules/`
   - What's unclear: Phase 1 is not yet complete — the installer may not copy this file yet
   - Recommendation: Phase 3 ensures the source file is correct; Phase 3 plan notes that end-to-end persistence verification requires Phase 1 installer to be functional

---

## Sources

### Primary (HIGH confidence)
- `rules/schwiftyy-identity.md` — full identity file reviewed, confirmed complete
- `commands/schwiftyy/schwiftyy.md` — entry command reviewed, inline persona pattern observed
- `.planning/REQUIREMENTS.md` — CHAR-01 through CHAR-05 requirements, out-of-scope table
- `.planning/ROADMAP.md` — phase dependencies and success criteria
- Claude Code documentation (general knowledge, confirmed by project structure) — rules file loading behavior

### Secondary (MEDIUM confidence)
- Existing project structure confirms `commands/schwiftyy/*.md` pattern and `rules/` merge installer behavior

---

## Metadata

**Confidence breakdown:**
- Requirements mapping: HIGH — all five CHAR requirements clearly understood
- Rules persistence mechanism: HIGH — confirmed by project's own structure
- Mode toggle pattern: HIGH — design decision, no external dependency
- Sub-command file contents: LOW — files exist but not read; contents unknown

**Research date:** 2026-04-16
**Valid until:** Stable indefinitely — no external libraries involved
