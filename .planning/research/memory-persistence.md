# Memory & Persistence Research: Schwiftyy

**Researched:** 2026-04-14
**Confidence:** HIGH (based on direct inspection of live Claude Code memory systems)

---

## 1. How Claude Code's Existing Memory System Works

Claude Code uses a layered file-based memory model. Nothing is stored in Claude's weights — all persistence is on disk and injected into context at session start.

### CLAUDE.md hierarchy (context injection)

Claude Code automatically reads and injects CLAUDE.md files at startup:

| Scope | Location | Purpose |
|-------|----------|---------|
| Global user | `~/.claude/CLAUDE.md` | User preferences, always-on rules |
| Project | `<project-root>/CLAUDE.md` | Project-specific overrides |
| Subdirectory | `<subdir>/CLAUDE.md` | Narrowed context for that folder |

Files can use `@path/to/other.md` to import other files (seen in `~/.claude-ultron/CLAUDE.md` → `@D:/Schwiftyy Ai/ultron/CLAUDE.md`). This gives you composable, modular config.

### Auto-memory system (~/.claude-ultron/projects/)

The Ultron layer implements a cross-project memory store at:
`~/.claude-ultron/projects/<encoded-path>/memory/`

Structure observed:
```
memory/
  MEMORY.md          ← index file: one-liner per project with link
  project_foo.md     ← per-project memory blob with YAML frontmatter
  project_bar.md
```

Each project memory file uses YAML frontmatter:
```yaml
---
name: Project Name
description: One-line description
type: project
originSessionId: <uuid>
---
```

Body is free-form markdown — decisions, DB state, pending work, "how to apply" section.

Memory files carry a staleness warning injected by the system:
> "This memory is 7 days old. Memories are point-in-time observations, not live state..."

This is a critical design signal: **the system itself flags stale memory** rather than trusting it blindly.

---

## 2. Best Format: Machine-Readable + Human-Readable

### Winning pattern: YAML frontmatter + structured markdown sections

Observed across GSD templates and the auto-memory system. Rationale:

- YAML frontmatter = machine-parseable metadata (status, timestamps, phase number)
- Markdown body = human-readable, Claude-readable prose + lists
- Tagged XML-style sections (`<current_state>`, `<next_action>`) = scannable anchors Claude can locate without reading the whole file

### Recommended Schwiftyy memory format

**Per-project** (`.schwiftyy/memory.md`):
```markdown
---
project: my-project
last_session: 2026-04-14T18:30:00Z
phase: build
skill_level: beginner
---

## Last Session
Built the auth flow. Supabase RLS policies added. Login page done, dashboard skeleton started.

## Open Threads
- Dashboard: needs real data wired in (currently mock)
- Deployment: Railway env vars not set yet

## Decisions Made
- Using Supabase Auth over custom auth (security, speed)
- FastAPI not Next.js (per user stack preference)

## Next Action
Wire Supabase data into dashboard `/api/stats` endpoint.

## What Was Taught
- Explained RLS policies and why they matter
- Showed parameterized query pattern
```

**Global** (`~/.claude/schwiftyy/memory/global.md`):
```markdown
---
updated: 2026-04-14
projects_seen: 3
---

## User Profile
- Skill level: beginner-intermediate (improving)
- Prefers: direct explanations, no lectures
- Stack comfort: Python/FastAPI yes, React no
- Frustration trigger: over-engineering

## Patterns Learned
- User needs reminders about env vars (forgot 2x)
- Responds well to "here's why" explanations
- Prefers copy-paste ready code over theory

## Cross-Project Patterns
- Always deploys to Railway
- Uses Supabase for every project
- Tends to skip testing until pushed
```

---

## 3. How Existing Skills/Agents Handle Session Persistence

### GSD (Get Shit Done) system — most mature pattern observed

GSD uses a **two-file system**:

**STATE.md** — persistent living memory (< 100 lines, read first every session):
- Current phase/plan position
- Progress bar (visual)
- Performance metrics (velocity, avg plan duration)
- Accumulated decisions (digest, not archive)
- Session continuity block (last session, stopped at, resume file)

**continue-here.md** — ephemeral session handoff (deleted after resume):
- YAML frontmatter: phase, task number, status, timestamp
- Tagged sections: `<current_state>`, `<completed_work>`, `<remaining_work>`, `<decisions_made>`, `<blockers>`, `<context>`, `<next_action>`
- `<next_action>` is the single most important field: one actionable sentence, no context needed

Key insight from GSD docs: *"Be specific enough that a fresh Claude instance understands immediately."*

### Auto-memory pattern (Ultron)

- Memory written at session end (or on demand)
- Index file (`MEMORY.md`) kept tiny — just project names + one-liners + links
- Per-project files are self-contained blobs with "how to apply" section
- Staleness tracked implicitly via timestamps, surfaced as warnings

---

## 4. "Pick Up Where You Left Off" Patterns

Three patterns observed, ranked by effectiveness:

### Pattern A: Next Action First (GSD continue-here)
The `<next_action>` block is the first thing Claude reads on resume. One sentence, immediately actionable. No context required to execute it. The rest of the file provides depth if needed.

**Best for:** Mid-task interruptions, session handoffs within a single phase.

### Pattern B: State + Position (GSD STATE.md)
A persistent file updated after every significant action. Contains current position in a structured workflow (phase X of Y, plan A of B). Progress bar gives instant orientation.

**Best for:** Long multi-session projects, returning after days/weeks away.

### Pattern C: Project Memory Blob (Ultron auto-memory)
Free-form markdown with "how to apply" section. Written at key milestones. Loaded into context via CLAUDE.md injection or explicit read.

**Best for:** Cross-project learning, user preferences, decisions that span sessions.

---

## 5. Risks and Failure Modes of File-Based Memory

| Failure Mode | Description | Mitigation |
|---|---|---|
| **Stale memory trusted as truth** | Code changed, memory not updated — Claude acts on wrong state | Timestamp all entries. System-level staleness warnings (like Ultron's "7 days old" notice). Always verify file state before acting on memory. |
| **Memory bloat** | File grows unbounded, Claude reads irrelevant history | Hard size limits (GSD: STATE.md < 100 lines). Archive old decisions to separate file. Keep active memory = recent + relevant only. |
| **Missing update** | Session ends abruptly, memory not written | Write memory incrementally (after each phase/milestone), not just at session end. |
| **Conflicting memories** | Per-project and global contradict each other | Explicit priority rule: per-project > global. Global is defaults, project overrides. |
| **Path encoding issues** | File paths with spaces/special chars break discovery | Use encoded slugs for directory names (e.g., `C--Users-OxGames` pattern from Ultron). |
| **Context window waste** | Loading full memory file when only 10% is relevant | Structured sections + clear headers so Claude can skip-read. `<next_action>` always first. |
| **Memory hallucination** | Claude "recalls" things not in the file | Memory is source of truth. If it's not written, it didn't happen. Teach this explicitly in skill prompts. |

---

## 6. Efficient Partial-Read Structure

The core insight: **Claude reads linearly but can scan headers**. Structure memory so the most critical info is at the top and sections are independently useful.

### Recommended section order (most → least urgent):

```
## Next Action          ← Read this, know what to do (5 seconds)
## Last Session         ← Read this, know what happened (30 seconds)
## Open Threads         ← Read this, know what's incomplete (1 minute)
## Decisions Made       ← Reference only when relevant
## What Was Taught      ← Reference only for teaching continuity
## Full History         ← Never load by default, link to archive
```

### Techniques for efficient loading:

1. **Split hot/cold memory**: Active state in `memory.md` (< 80 lines). Historical archive in `memory-archive.md` (never auto-loaded).

2. **YAML frontmatter as quick-parse**: Claude can read frontmatter for status/phase/timestamp without parsing the body.

3. **Tagged XML sections**: `<next_action>` as a grep target — skill bootstrap can `Read` the file and locate the section without full context load.

4. **Index + detail pattern** (from Ultron): `MEMORY.md` = tiny index with one-liners. Project files = full detail. Only load the project file relevant to current session.

5. **Size discipline**: If `memory.md` exceeds 100 lines, rotate oldest "Decisions Made" entries to archive. Keep file small enough to load without hesitation.

---

## Schwiftyy-Specific Recommendations

### Two-layer architecture

```
Per-project:  <project-root>/.schwiftyy/memory.md     ← session state, what was built, threads
Global:       ~/.claude/schwiftyy/memory/global.md    ← user profile, cross-project patterns
```

### Bootstrap sequence (every `/schwiftyy` invocation)

1. Check for `.schwiftyy/memory.md` → load if exists (full file, kept < 80 lines)
2. Check for `~/.claude/schwiftyy/memory/global.md` → load user profile section only
3. Read `<next_action>` from project memory → surface to user immediately
4. After session: update `memory.md` → write `## Last Session` + `## Next Action` + any new decisions

### Write discipline

- Write memory **after each milestone**, not just session end
- Never let memory.md exceed 80 lines — rotate to `memory-archive.md`
- Timestamp every entry (`2026-04-14`)
- Global memory updated when a new cross-project pattern is confirmed (not speculative)

### Teaching memory (differentiator)

Schwiftyy's `## What Was Taught` section enables continuity of pedagogy — don't re-explain RLS policies to someone you already taught. This is a unique value-add over generic memory systems.

---

## Sources

- Direct inspection: `~/.claude-ultron/projects/C--Users-OxGames/memory/` (live system)
- Direct inspection: `~/.claude/get-shit-done/templates/state.md` (GSD STATE template)
- Direct inspection: `~/.claude/get-shit-done/templates/continue-here.md` (GSD handoff template)
- Direct inspection: `~/.claude/get-shit-done/templates/user-profile.md` (GSD user profile template)
- Direct inspection: `~/.claude-ultron/CLAUDE.md` + rules (global config injection patterns)
- Project memory: `project_fdw_b2b.md`, `project_schwiftyy.md` (real-world memory examples)
