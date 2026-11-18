# Contributing to Schwiftyy

> "You wanna help? Cool. Don't make it weird." (Schwiftyy)

## How this thing is built

Schwiftyy is plain Markdown instructions, one zero-dependency installer, and a couple of check scripts. There's no build step. The repo is a Claude Code plugin *and* an npm package, from the same files.

| Layer | Lives in | Rule |
|---|---|---|
| Commands | `commands/*.md` | **Thin.** Frontmatter + the paths header + "follow this workflow". |
| Workflows | `schwiftyy/workflows/*.md` | All mode behavior goes here. |
| Identity | `schwiftyy/identity.md` | Voice, tone, banned phrases. Also generates `ollama/Modelfile`. |
| Installer | `installer/install.js` | npm channel only. Node built-ins only, no dependencies, ever. |
| Plugin | `.claude-plugin/` | Manifest + marketplace. Version must match `package.json`. |
| Guardrails | `scripts/check.js` | Runs in CI and before every publish. |
| Receipts | `docs/development/planning/` | Requirements, research, phase plans. |

See [docs/how-it-works.md](docs/how-it-works.md) for the full picture.

## Ground rules

1. **No runtime dependencies.** `npx` should install in seconds.
2. **Thin commands.** If you're writing behavior in a command file, move it to a workflow.
3. **Trace it.** New behavior gets a requirement ID in `.planning/REQUIREMENTS.md` (e.g. `BUILD-05`) and the workflow references it.
4. **Stay in character.** No "Certainly!", "Great question!", "I'd be happy to help", or "As an AI..." anywhere Schwiftyy speaks.
5. **Never fabricate memory.** Anything touching memory must only write what actually happened.
6. **Respect the 40-column portal.** Animation frames max 40 visible chars per line.
7. **No hardcoded paths.** Reference Schwiftyy's own files as `$SCHWIFTYY_HOME/...` and memory as `$SCHWIFTYY_MEMORY/...`. `npm run check` fails on anything like `~/.claude`, `C:/` or `/Users/`.
8. **Changed `identity.md`?** Run `npm run build:modelfile` and commit the result.
9. **Never `npm publish` by hand.** See [docs/releasing.md](docs/releasing.md).

## Testing your change

```bash
# all the guardrails (paths, frontmatter, versions, Modelfile, a real install + uninstall)
npm run check

# load your working copy as a plugin, no install needed
claude --plugin-dir .
# then: /schwiftyy:portal

# or test the npm channel into a throwaway config folder
CLAUDE_CONFIG_DIR=/tmp/claude-test node installer/install.js
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

1. `commands/<mode>.md`: copy an existing command, keep the paths header, set `description`, `allowed-tools`, `argument-hint`
2. `schwiftyy/workflows/<mode>-workflow.md`: opening lines, flow, milestone reactions, memory triggers
3. Add per-mode voice calibration to `schwiftyy/identity.md` (then `npm run build:modelfile`)
4. Add it to the menu + routing in `schwiftyy/workflows/entry-workflow.md`
5. Add it to the README mode table

Welcome to C-420. 🌿
