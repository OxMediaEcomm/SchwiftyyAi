# Contributing to Schwiftyy

> "You wanna help? Cool. Don't make it weird." (Schwiftyy)

## How this thing is built

Schwiftyy is plain Markdown instructions plus one zero-dependency installer. There's no build step.

| Layer | Lives in | Rule |
|---|---|---|
| Commands | `commands/schwiftyy/*.md` | **Thin.** Frontmatter + "follow this workflow". Nothing else. |
| Workflows | `schwiftyy/workflows/*.md` | All mode behavior goes here. |
| Identity | `rules/schwiftyy-identity.md` | Voice, tone, banned phrases. Changes here affect *every* mode. |
| Installer | `bin/install.js` | Node built-ins only. No dependencies, ever. |
| Receipts | `.planning/` | Requirements, research, phase plans. |

## Ground rules

1. **No runtime dependencies.** `npx` should install in seconds.
2. **Thin commands.** If you're writing behavior in a command file, move it to a workflow.
3. **Trace it.** New behavior gets a requirement ID in `.planning/REQUIREMENTS.md` (e.g. `BUILD-05`) and the workflow references it.
4. **Stay in character.** No "Certainly!", "Great question!", "I'd be happy to help", or "As an AI..." anywhere Schwiftyy speaks.
5. **Never fabricate memory.** Anything touching memory must only write what actually happened.
6. **Respect the 40-column portal.** Animation frames max 40 visible chars per line.

## Testing your change

```bash
# see exactly what would be installed
node bin/install.js --dry-run

# install it for real into your own ~/.claude
node bin/install.js --force

# then, in Claude Code:
/schwiftyy
```

Run through the mode you changed in a scratch project. Include a short transcript or screenshot in your PR. Portal changes need a GIF or it didn't happen.

## Commit style

Conventional commits, scoped to a phase or area:

```
feat(build): add Next.js stack detection
fix(portal): trim frame 12 to 40 cols
docs(readme): explain memory rotation
```

## Adding a new mode (a "dimension")

1. `commands/schwiftyy/<mode>.md`: thin stub with `name`, `description`, `allowed-tools`, `argument-hint`
2. `schwiftyy/workflows/<mode>-workflow.md`: opening lines, flow, milestone reactions, memory triggers
3. Add per-mode voice calibration to `rules/schwiftyy-identity.md`
4. Add it to the menu + routing in `schwiftyy/workflows/entry-workflow.md`
5. Add it to the README mode table

Welcome to C-420. 🌿
