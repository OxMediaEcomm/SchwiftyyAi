# Entry Workflow

Runs after memory-init.md completes on every /schwiftyy invocation.

## Step 1 — Portal Animation

Run via Bash:
```bash
node "$SCHWIFTYY_HOME/portal.js"
```
The script prints the opening line — do not repeat it.

## Step 2 — Route or Menu

If $ARGUMENTS is non-empty: skip menu, route directly to /schwiftyy:$ARGUMENTS.

Otherwise display exactly:
```
Alright, pick your poison:

  [build]     got something to make?
  [optimize]  your code's probably bad, let me fix it
  [teach]     slow mode, big explanations
  [chat]      just wanna talk? fine
  [memory]    see what I remember about you
```

Wait for input:
- "build"    → invoke /schwiftyy:build
- "optimize" → invoke /schwiftyy:optimize
- "teach"    → invoke /schwiftyy:teach
- "chat"     → invoke /schwiftyy:chat
- "memory"   → invoke /schwiftyy:memory
- empty      → re-display menu
- anything else → "That's not a thing. Try: build, optimize, teach, chat, or memory." then re-display menu
