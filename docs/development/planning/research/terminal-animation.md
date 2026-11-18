# Terminal Animation Research: Schwiftyy Portal Animation

**Project:** Schwiftyy — Rick & Morty-style CLI skill
**Researched:** 2026-04-14
**Overall confidence:** HIGH (core ANSI/Node.js patterns are well-established)

---

## 1. How Claude Code Skills Output to the Terminal

### Skill File Format

Claude Code custom slash commands (skills) live in `.claude/commands/*.md`. They are **prompt files** — they instruct Claude what to do. Claude then executes bash/node via the Bash tool.

The canonical pattern for a skill that animates:

```markdown
# schwiftyy.md
Run the Schwiftyy portal animation. Execute:
`node ~/.claude/commands/schwiftyy-animation.js`

Then greet the user as Schwiftyy.
```

The **animation logic lives in a companion `.js` file**, not inline in the markdown. The markdown just tells Claude to run it.

### How Claude Outputs ANSI

Claude's Bash tool inherits the terminal's stdout. If the calling terminal supports ANSI, `process.stdout.write("\x1b[32mGreen text\x1b[0m\n")` works. Claude does NOT strip ANSI codes from Bash tool output — it passes them through.

**Confirmed pattern:** Any `console.log` or `process.stdout.write` with ANSI escapes will render in the user's terminal as colored/styled text.

---

## 2. Node.js Libraries for Terminal Animation

### Tier 1 — Recommended

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `chalk` | 5.x (ESM) / 4.x (CJS) | ANSI color/style | Zero-dep, widely used, handles NO_COLOR gracefully |
| `cli-spinners` | 2.x | Spinner frame data (JSON) | Pure data, no side effects, 60+ spinners |
| `ora` | 8.x (ESM) | Spinner + text in one | Wraps cli-spinners, handles TTY detection automatically |

### Tier 2 — For Frame-Based Animation

| Library | Purpose | Notes |
|---------|---------|-------|
| `terminal-kit` | Full terminal control, cursor positioning, box-drawing | Overkill but powerful; supports portal-style rendering |
| `ansi-escapes` | Raw ANSI helpers (cursor up, clear line, etc.) | Lightweight; needed for frame-by-frame animation loops |
| `log-update` | Re-render same terminal lines repeatedly | Best for "animation" feel — replaces output in-place |

### Tier 3 — Avoid for This Use Case

- `blessed` / `neo-blessed` — Full TUI framework; too heavy for a startup animation
- `ink` — React-for-terminals; requires React, overkill
- `inquirer` — Interactive prompts only, not animation

### Recommended Minimal Stack

```bash
npm install chalk log-update cli-spinners
```

No bundler needed. Run directly with `node`.

---

## 3. How Other CLI Tools Do Character/Mascot Animations

### Pattern: Frame Loop with `log-update`

The most common pattern for mascot/portal animations:

```js
import logUpdate from 'log-update';
import chalk from 'chalk';

const frames = [
  // Frame 1: portal barely open
  chalk.green('    ~~~    ') + '\n' +
  chalk.green('  ~     ~  '),
  // Frame 2: portal wider
  chalk.green('  ~~~~~~~  ') + '\n' +
  chalk.green('~         ~'),
  // Frame N: fully open
];

let i = 0;
const id = setInterval(() => {
  logUpdate(frames[i++ % frames.length]);
  if (i >= frames.length * 2) {
    clearInterval(id);
    logUpdate.done(); // persist final frame
  }
}, 80);
```

### Real-World Examples

- **Yeoman** (`yo`) — ASCII art generator with chalk coloring on init
- **create-react-app** (legacy) — Spinner with colored status lines
- **Wrangler CLI** (Cloudflare) — Uses ora spinner + colored ASCII banners
- **Railway CLI** — Animated deployment spinner with ANSI progress

### The "Step-Through" Pattern

For Schwiftyy stepping through the portal, the technique is **frame sequencing**:

1. Frames 1-8: Portal grows (concentric oval shapes in green)
2. Frames 9-12: Schwiftyy character appears inside portal
3. Frame 13-16: Schwiftyy steps forward, portal shrinks behind
4. Final frame: Schwiftyy standing in front, portal closed — `logUpdate.done()`

---

## 4. Terminal Capability Constraints

### ANSI Support in Claude Code's Terminal

Claude Code runs in VS Code's integrated terminal (or the user's system terminal). Both support:

| Feature | Support | Notes |
|---------|---------|-------|
| 256-color ANSI | YES | `\x1b[38;5;{n}m` |
| True color (24-bit) | YES in most | `\x1b[38;2;R;G;Bm` |
| Unicode box-drawing | YES | `─ │ ╭ ╮ ╯ ╰` render fine |
| Unicode emoji | PARTIAL | Font-dependent; avoid for core art |
| Cursor movement | YES | `\x1b[{n}A` (up), `\x1b[2K` (clear line) |
| Alternate screen buffer | RISKY | Avoid — Claude Code may interfere |

### NO_COLOR Compliance

Respect the `NO_COLOR` env var (honored by `chalk` automatically). If `NO_COLOR=1`, chalk returns unstyled strings.

### TTY Detection

```js
if (!process.stdout.isTTY) {
  // Non-interactive — skip animation, print static art
  console.log(SCHWIFTYY_STATIC_ASCII);
  process.exit(0);
}
```

This is the key guard for piped output, CI, or non-terminal contexts.

### Terminal Width

```js
const cols = process.stdout.columns || 80; // safe fallback
```

Portal animation should be designed for 40-char width minimum so it works in split-pane terminals.

---

## 5. Skill File Structure

### Recommended Architecture

```
D:/Schwiftyy Ai/schwiftyy/
├── schwiftyy.md                  ← Claude Code slash command (prompt only)
└── bin/
    ├── schwiftyy-animation.js    ← Main animation (Node.js, no deps if possible)
    └── schwiftyy-static.txt      ← Fallback ASCII art
```

The markdown skill file:

```markdown
Run the Schwiftyy portal animation by executing:
`node "D:/Schwiftyy Ai/schwiftyy/bin/schwiftyy-animation.js"`

After the animation completes, respond as Schwiftyy — a chill Rick & Morty
weed leaf character who helps with $ARGUMENTS. Stay in character.
```

### Animation Script Structure

```js
#!/usr/bin/env node
// schwiftyy-animation.js — no external deps version

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const BRIGHT_GREEN = '\x1b[92m';
const CYAN = '\x1b[36m';
const CLEAR_LINE = '\x1b[2K\r';
const CURSOR_UP = (n) => `\x1b[${n}A`;
const HIDE_CURSOR = '\x1b[?25l';
const SHOW_CURSOR = '\x1b[?25h';

// Guard: non-TTY fallback
if (!process.stdout.isTTY) {
  console.log(STATIC_ART);
  process.exit(0);
}

// Portal frames (7 lines tall each)
const PORTAL_FRAMES = [
  // Frame 1 — portal barely cracked
  [
    '          ',
    '   (  )   ',
    '  (    )  ',
    '   (  )   ',
    '          ',
  ],
  // Frame 2 — portal opening
  [
    '   ~~~~~  ',
    '  /     \\ ',
    ' |       |',
    '  \\     / ',
    '   ~~~~~  ',
  ],
  // ... more frames
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function animate() {
  process.stdout.write(HIDE_CURSOR);

  // Render initial blank lines to anchor cursor
  const frameHeight = PORTAL_FRAMES[0].length;
  console.log('\n'.repeat(frameHeight));

  for (const frame of PORTAL_FRAMES) {
    // Move cursor up to top of frame
    process.stdout.write(CURSOR_UP(frameHeight + 1));

    for (const line of frame) {
      process.stdout.write(CLEAR_LINE + GREEN + line + RESET + '\n');
    }

    await sleep(80);
  }

  process.stdout.write(SHOW_CURSOR);
}

animate().catch(() => {
  process.stdout.write(SHOW_CURSOR);
  process.exit(1);
});
```

### With `log-update` (cleaner, requires npm):

```js
import logUpdate from 'log-update';

for (const frame of ALL_FRAMES) {
  logUpdate(frame);
  await sleep(80);
}
logUpdate.done(); // freeze final frame in terminal history
```

---

## 6. Fallback Strategy

### Detection Cascade

```js
const canAnimate =
  process.stdout.isTTY &&           // is a real terminal
  process.env.NO_COLOR == null &&    // color not disabled
  (process.env.TERM !== 'dumb');     // not a dumb terminal

if (canAnimate) {
  await runPortalAnimation();
} else {
  printStaticSchwiftyy();
}
```

### Static Fallback ASCII Art

```
  *   *   *
    \|/
  --[S]--      SCHWIFTYY
    /|\        "Wubba lubba dub dub, let's get schwifty!"
  *   *   *
```

The static version should be a named constant at the top of the script so it's always available regardless of animation success.

### Error Resilience

Wrap the entire animation in try/catch. On any error:
1. Write `SHOW_CURSOR` escape (cursor was hidden)
2. Print static art
3. Continue — never let the animation crash the skill

---

## Portal Animation Design: The Schwiftyy Swirl

### Color Palette

- Portal outer glow: `\x1b[32m` (standard green)
- Portal inner swirl: `\x1b[92m` (bright green)
- Schwiftyy character: `\x1b[33m` (yellow/gold for leaf)
- Portal sparks: `\x1b[96m` (bright cyan)

### Frame Sequence (16 frames at 80ms = ~1.3 seconds total)

```
Frame 1-4:   Portal crack appears (thin vertical line, bright green)
Frame 5-8:   Portal widens to oval shape, swirl characters appear (~@o)
Frame 9-12:  Portal fully open (full circle), Schwiftyy silhouette visible inside
Frame 13-15: Schwiftyy steps through (character moves from inside to in front)
Frame 16:    Portal closes behind Schwiftyy, static pose held
```

### Swirl Characters for Portal Effect

Use these Unicode chars to simulate swirling motion without emoji:
`~ ≈ @ o O 0 * · ° ∘ ◌ ○ ◯`

Rotating which characters appear at which positions per frame creates the swirl illusion.

---

## Key Decisions

1. **No external npm deps for the animation core** — use raw ANSI escapes. This makes the skill self-contained and installable without `npm install`.
2. **16 frames at 80ms** — 1.3 second total, fast enough to feel snappy, long enough to read as an animation.
3. **`log-update` optional** — if the project already has a `package.json`, use it. If not, raw ANSI is fine.
4. **Skill file = markdown prompt only** — the `.js` script is the real artifact. Claude Code runs it via Bash tool.
5. **Always guard with `isTTY`** — the animation must not corrupt piped or logged output.

---

## Sources

- ANSI escape code spec: https://en.wikipedia.org/wiki/ANSI_escape_code (HIGH confidence — stable standard)
- `log-update` npm: https://github.com/sindresorhus/log-update (HIGH confidence)
- `chalk` v5 docs: https://github.com/chalk/chalk (HIGH confidence)
- `cli-spinners`: https://github.com/sindresorhus/cli-spinners (HIGH confidence)
- Claude Code slash command format: inferred from `.claude/commands/` structure observed in this repo (HIGH confidence)
- TTY detection pattern: Node.js `process.stdout.isTTY` — official Node.js docs (HIGH confidence)
