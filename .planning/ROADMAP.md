# Roadmap: Schwiftyy

## Overview

Schwiftyy ships in 7 phases. Phase 1 builds the installable npm package scaffold. Phase 2 delivers the portal animation and entry command. Phase 3 bakes in the Schwiftyy character and identity system. Phases 4 and 5 implement the five core modes (build, optimize, teach, chat). Phase 6 completes the two-layer memory system. Phase 7 hardens the package for public npm release. Each phase delivers a testable, runnable capability — nothing is partially built.

## Phases

- [ ] **Phase 1: Package Scaffold** - npm package structure, installer script, file layout — `npx schwiftyy-cc@latest install` works
- [ ] **Phase 2: Portal & Entry Command** - `/schwiftyy` command registered, portal animation plays, mode menu displayed
- [ ] **Phase 3: Character & Identity** - Schwiftyy personality locked in, identity rule file installed, tone calibration implemented
- [ ] **Phase 4: Build & Optimize Modes** - `/schwiftyy:build` and `/schwiftyy:optimize` fully functional with teaching explanations
- [ ] **Phase 5: Teach & Chat Modes** - `/schwiftyy:teach` and `/schwiftyy:chat` functional, skill-level-aware
- [ ] **Phase 6: Memory System** - Two-layer memory (per-project + global), `/schwiftyy:memory` command, session continuity
- [ ] **Phase 7: npm Release Polish** - Package hardened, frontmatter validated, thin-command pattern enforced, published to npm

## Phase Details

### Phase 1: Package Scaffold
**Goal**: The Schwiftyy npm package exists, installs correctly on all platforms, and leaves `~/.claude/` in the right state
**Depends on**: Nothing (first phase)
**Requirements**: DIST-01, DIST-02, DIST-03, DIST-04, PKG-01, PKG-02, PKG-03, PKG-04, PKG-05
**Success Criteria** (what must be TRUE):
  1. Running `npx schwiftyy-cc@latest install` on Windows, macOS, and Linux completes in under 60 seconds with no errors
  2. After install, `~/.claude/commands/schwiftyy/`, `~/.claude/agents/`, `~/.claude/rules/`, and `~/.claude/schwiftyy/` directories exist with correct files
  3. `~/.claude/schwiftyy/VERSION` file exists with the installed version string
  4. Installer does not overwrite existing user rule files — merges safely
**Plans**: TBD

### Phase 2: Portal & Entry Command
**Goal**: Users can invoke `/schwiftyy` and experience the portal animation followed by the mode menu
**Depends on**: Phase 1
**Requirements**: CMD-01, ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05
**Success Criteria** (what must be TRUE):
  1. `/schwiftyy` is discoverable in Claude Code's command palette immediately after install
  2. Portal animation plays in a real terminal: 16 frames, green ANSI colors, approximately 1.3 seconds, zero npm dependencies required
  3. In a non-TTY context (piped output, CI), static ASCII art prints instead of animation — no crash, no garbled output
  4. After animation, Schwiftyy displays a mode menu listing all available sub-commands
  5. Animation works in a 40-column split-pane terminal without wrapping or corruption
**Plans**: TBD
**UI hint**: yes

### Phase 3: Character & Identity
**Goal**: Schwiftyy's personality is consistent, persistent, and adjustable — users feel like they're talking to a character, not a generic AI
**Depends on**: Phase 2
**Requirements**: CHAR-01, CHAR-02, CHAR-03, CHAR-04, CHAR-05
**Success Criteria** (what must be TRUE):
  1. Schwiftyy's voice is recognizably Rick-style (direct, blunt, explains the "why") in every response — never generic AI assistant tone
  2. After every code generation action, Schwiftyy provides a plain-English explanation of what was built and why — unprompted
  3. Schwiftyy acknowledges milestone moments (first file created, first error fixed) with a character-appropriate reaction
  4. `~/.claude/rules/schwiftyy-identity.md` is installed and the personality persists across Claude Code sessions without re-invoking `/schwiftyy`
  5. User can switch between Chill mode and Pro mode within a session
**Plans**: TBD

### Phase 4: Build & Optimize Modes
**Goal**: Users can describe what they want to build and receive working code with explanations, and can point Schwiftyy at an existing project to get prioritized fixes
**Depends on**: Phase 3
**Requirements**: CMD-02, CMD-03, BUILD-01, BUILD-02, BUILD-03, BUILD-04, OPT-01, OPT-02, OPT-03, OPT-04
**Success Criteria** (what must be TRUE):
  1. User types `/schwiftyy:build` with a plain-English goal and receives an architecture plan before any code is written
  2. Generated code matches the project's detected stack (FastAPI + Jinja2 for Python, plain HTML/CSS for static)
  3. Every code block is followed by a Schwiftyy explanation in plain English — no silent code drops
  4. Build session ends with a "what was built" summary and a specific next action suggestion
  5. `/schwiftyy:optimize` scans project files and returns issues ordered by impact, each with a fix and a reason
**Plans**: TBD

### Phase 5: Teach & Chat Modes
**Goal**: Users can learn at their own pace through guided building, and have freeform conversations with Schwiftyy that stay project-aware
**Depends on**: Phase 3
**Requirements**: CMD-04, CMD-05, TEACH-01, TEACH-02, TEACH-03, TEACH-04, CHAT-01, CHAT-02
**Success Criteria** (what must be TRUE):
  1. `/schwiftyy:teach` explains every concept before implementing it — no code appears before the explanation
  2. Explanations use zero assumed knowledge: analogies, plain English, no jargon without translation
  3. Schwiftyy does not re-explain a concept already covered in a previous session (memory-aware teaching)
  4. `/schwiftyy:chat` responds in Schwiftyy's voice on any topic with project context loaded — feels like talking to someone who knows your project
**Plans**: TBD

### Phase 6: Memory System
**Goal**: Schwiftyy remembers every project it touches and every user it works with — sessions resume exactly where they left off
**Depends on**: Phase 4, Phase 5
**Requirements**: MEM-01, MEM-02, MEM-03, MEM-04, MEM-05, MEM-06, MEM-07, MEM-08, MEM-09, MEM-10, CMD-06
**Success Criteria** (what must be TRUE):
  1. On first `/schwiftyy` invocation in a project, `.schwiftyy/memory.md` is created with YAML frontmatter and correct section structure
  2. On return sessions, Schwiftyy explicitly says what it remembers ("Last time we were building X, and your next action was Y") — memory is visible to the user
  3. Memory is written after each milestone action, not only at session end — an abrupt session end does not lose more than one action of context
  4. Per-project memory file never exceeds 80 lines; rotation to `memory-archive.md` happens automatically
  5. `/schwiftyy:memory` lets user read both memory layers and edit or clear entries
  6. Global memory at `~/.claude/schwiftyy/memory/global.md` accumulates user profile and cross-project patterns across sessions
**Plans**: TBD

### Phase 7: npm Release Polish
**Goal**: The package is ready for public npm publish — all command files validated, thin-command pattern enforced, installer hardened
**Depends on**: Phase 6
**Requirements**: PKG-06, PKG-07
**Success Criteria** (what must be TRUE):
  1. Every command `.md` file has correct frontmatter: `name`, `description`, `allowed-tools`, `argument-hint`
  2. All heavy workflow logic lives in `~/.claude/schwiftyy/workflows/*.md` files — command files are thin stubs that reference workflows
  3. A clean install on a machine that has never had Schwiftyy produces a working `/schwiftyy` invocation with no manual steps
  4. Package is published to npm as `schwiftyy-cc` and `npx schwiftyy-cc@latest install` resolves from the registry
**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Package Scaffold | 0/TBD | Not started | - |
| 2. Portal & Entry Command | 0/TBD | Not started | - |
| 3. Character & Identity | 0/TBD | Not started | - |
| 4. Build & Optimize Modes | 0/TBD | Not started | - |
| 5. Teach & Chat Modes | 0/TBD | Not started | - |
| 6. Memory System | 0/TBD | Not started | - |
| 7. npm Release Polish | 0/TBD | Not started | - |
