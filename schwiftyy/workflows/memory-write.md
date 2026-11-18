# Memory Write Workflow

Milestone-gated writes to `.schwiftyy/memory.md`. Do NOT write on every message — only on the triggers below.

## Write Triggers (MEM-04)

| Trigger | What to write |
|---------|---------------|
| Architecture plan produced | Update `phase` in frontmatter + add plan summary to `## Decisions Made` |
| First file written this session | Update `last_session` in frontmatter |
| User makes a decision ("use Supabase", "go with FastAPI") | Append to `## Decisions Made` |
| Concept explained (teach mode) | Append concept name to `## What Was Taught` |
| User asks a question we can't answer now | Append to `## Open Threads` |
| Session wraps up | Update `## Last Session` (max 5 bullets) + `## Next Action` (single most important next step) |

## Write Rules

- Read the current file before writing — never overwrite blindly
- One write per trigger event — do not batch multiple triggers into one write unless session end
- `## Next Action` always contains exactly ONE item — the single most important next step
- `## Last Session` rotates: max 5 bullets. If full, drop the oldest before adding new
- Never fabricate entries. Only write what actually happened.

## Rotation Check (MEM-05, MEM-06)

After every write, count lines in `.schwiftyy/memory.md`.

If line count >= 80:
1. Read `## Last Session` entries — take the 2 oldest
2. Read `## What Was Taught` entries — take the 2 oldest
3. Append them to `.schwiftyy/memory-archive.md` under a new header:
   ```
   ## Archived: <today ISO date>

   ### Last Session (rotated)
   - <entry>

   ### What Was Taught (rotated)
   - <entry>
   ```
4. Remove those entries from the active memory.md
5. NEVER rotate `## Next Action` or `## Open Threads` — these are sacred

## Global Memory Updates

Update `$SCHWIFTYY_MEMORY/global.md` only when:
- A pattern is confirmed across 2+ projects (add to `## Cross-Project Patterns`)
- A new project is completed (add to `## Projects` list)
- User's skill level clearly advances (update `skill_level` in frontmatter)

Never speculatively write to global memory. Only write confirmed facts.
