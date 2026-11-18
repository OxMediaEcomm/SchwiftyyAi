# Memory Init Workflow

This workflow runs at the start of every `/schwiftyy` invocation. Follow all steps in order.

## Step 1 — First-Run Check (MEM-10)

Check if `$SCHWIFTYY_MEMORY/profile.md` exists.

**If it does NOT exist** (first time ever running Schwiftyy):

Ask the user 3 questions in Schwiftyy's voice, one at a time, waiting for each answer:

1. "What's your name? I'm gonna remember it."
2. "You a beginner, intermediate, or somewhere in between? No wrong answer — just helps me calibrate."
3. "What are you usually building? Python/FastAPI, plain HTML, something else?"

After all 3 answers, write `$SCHWIFTYY_MEMORY/profile.md`:
```
---
name: <answer 1>
skill_level: <answer 2>
preferred_stack: <answer 3>
onboarded: <today ISO date>
---
```

Then write `$SCHWIFTYY_MEMORY/global.md`:
```
---
name: <answer 1>
skill_level: <answer 2>
preferred_stack: <answer 3>
first_seen: <today ISO date>
last_seen: <today ISO date>
---

## User Profile
- Name: <answer 1>
- Skill level: <answer 2>
- Preferred stack: <answer 3>

## Cross-Project Patterns

## Projects
```

Then say: "Locked it in. Won't ask again. Now — pick your mode." and continue to Step 2.

**If it DOES exist**: skip onboarding, continue to Step 2.

---

## Step 2 — Project Memory Check (MEM-08, MEM-09)

Check if `.schwiftyy/memory.md` exists in the current working directory.

**If it does NOT exist**: create it silently with this structure:
```
---
project: <detect from directory name>
last_session: <today ISO date>
phase: getting started
skill_level: <read from profile.md if exists, else beginner>
---

## Next Action
- Start your first session with /schwiftyy:build or /schwiftyy:teach

## Last Session

## Open Threads

## Decisions Made

## What Was Taught
```

Then, if the current directory is a git repo (a `.git` folder exists) and `.gitignore` doesn't already list `.schwiftyy/`, ask once: "Want me to add `.schwiftyy/` to your .gitignore? Keeps my notes on you off GitHub." On yes, append `.schwiftyy/` (create `.gitignore` if missing). On no, drop it and don't ask again this session. (MEM-11)

Then continue to menu — no resume prompt.

**If it DOES exist**: read the `## Next Action` section.
- If Next Action has content: before showing menu, say in Schwiftyy's voice:
  "Last time you were [phase from frontmatter]. Next action was: [next_action content]. Picking up there?"
- Wait for user response:
  - "yes" / "yeah" / "yep" → route to the appropriate mode based on context
  - "no" / anything else → show the mode menu
- If Next Action is empty: show menu directly.

---

## Step 3 — Update last_seen (MEM-07)

Update `last_seen` in `$SCHWIFTYY_MEMORY/global.md` to today's ISO date.
