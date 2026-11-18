<!--
  ╔══════════════════════════════════════════════════════════════╗
  ║  oh hey. you opened the raw README.                          ║
  ║  that's the kind of curiosity we like in Dimension C-420.    ║
  ║                                                              ║
  ║  secret #1: once Schwiftyy is installed, say                 ║
  ║             "wubba lubba dub dub" to him. just once.         ║
  ║                                                              ║
  ║  there are more. he won't tell you. we won't either.         ║
  ║  (ok one hint: the installer has a flag that isn't in --help)║
  ╚══════════════════════════════════════════════════════════════╝
-->

<div align="center">

<img src="assets/banner.svg" alt="Schwiftyy, a sentient leaf stepping out of a green portal, next to the install command" width="100%">

<br>

[![npm](https://img.shields.io/npm/v/schwiftyy-cc?style=for-the-badge&logo=npm&logoColor=white&color=2fbf3a&labelColor=0b1a10)](https://www.npmjs.com/package/schwiftyy-cc)
[![Claude Code](https://img.shields.io/badge/Claude_Code-plugin-b6ff5a?style=for-the-badge&logo=anthropic&logoColor=white&labelColor=0b1a10)](https://docs.claude.com/en/docs/claude-code)
[![Node](https://img.shields.io/badge/node-%E2%89%A518-9dff3a?style=for-the-badge&logo=node.js&logoColor=white&labelColor=0b1a10)](https://nodejs.org)
[![CI](https://img.shields.io/github/actions/workflow/status/OxMediaEcomm/SchwiftyyAi/ci.yml?branch=master&style=for-the-badge&label=CI&labelColor=0b1a10&color=2fbf3a)](https://github.com/OxMediaEcomm/SchwiftyyAi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-7fbf86?style=for-the-badge&labelColor=0b1a10)](LICENSE)

![dependencies](https://img.shields.io/badge/runtime_deps-0-2fbf3a?style=flat-square&labelColor=0b1a10)
![dimension](https://img.shields.io/badge/dimension-C--420-2fbf3a?style=flat-square&labelColor=0b1a10)
![burps](https://img.shields.io/badge/burps-yes-b6ff5a?style=flat-square&labelColor=0b1a10)
![slop tolerance](https://img.shields.io/badge/slop_tolerance-0%25-ff5a5a?style=flat-square&labelColor=0b1a10)

### Your vibe coding is about to get roasted. And then it's going to get *good*.

**Schwiftyy** is a Rick & Morty-flavored AI companion that lives inside [Claude Code](https://docs.claude.com/en/docs/claude-code).
He builds websites and apps *with* you, explains every move he makes, remembers where you left off,
and calls out the slop before it ships.

[**Install**](#-install) · [**Modes**](#-pick-your-poison) · [**Local / Ollama**](docs/install-ollama.md) · [**How the AI works**](docs/how-it-works.md) · [**Memory**](docs/memory.md) · [**FAQ**](#-faq)

</div>

---

## 🌀 The pitch

You heard about vibe coding. You asked an AI to "make me a website." It gave you 900 lines of something. It sort of works. You have no idea why. Next week it breaks and you have no idea why either.

**Schwiftyy fixes the "no idea why" part.**

| Plain AI coding assistant | Schwiftyy |
|---|---|
| Dumps code, says "Let me know if you need anything else!" | Explains what the code does and **why** after every block. No silent code drops, ever |
| Forgets you exist when the session ends | Remembers your name, your skill level, your project, and your **next action** |
| Re-explains `flexbox` for the 14th time | Tracks what it already taught you and skips ahead |
| Politely builds whatever you asked for | Asks the 3 questions that matter, plans the architecture, *then* builds |
| "Great question!" | "okay that's actually a good one" |
| Quietly rewrites half your codebase | Announces every fix before it touches a file |

He's built for people who **have never coded before**, or who started vibe coding and keep getting garbage out. If you're a senior engineer, you already have a workflow. Schwiftyy might still roast it.

---
## ⚡ Install

**You need [Claude Code](https://docs.claude.com/en/docs/claude-code).** That's it. Pick one:

### Plugin (recommended): one line, inside Claude Code

```
/plugin install schwiftyy --marketplace OxMediaEcomm/SchwiftyyAi
```

Then: **`/schwiftyy:portal`**

### npm: one line, in your terminal (needs Node 18+)

```bash
npx schwiftyy-cc@latest install
```

Then: **`/schwiftyy`**

The portal opens. He drops in. You're off.

| I want to… | Go here |
|---|---|
| Install, update, uninstall, use a custom config folder | [docs/install-claude-code.md](docs/install-claude-code.md) |
| Run him on a **local model** with Ollama, free and offline | [docs/install-ollama.md](docs/install-ollama.md) |
| Upgrade from 0.1.x | [docs/install-claude-code.md#upgrading-from-01x](docs/install-claude-code.md#upgrading-from-01x) |

---

## 🧪 Pick your poison

Start Schwiftyy and you get the portal, then the menu:

```text
Alright, pick your poison:

  [build]     got something to make?
  [optimize]  your code's probably bad, let me fix it
  [teach]     slow mode, big explanations
  [chat]      just wanna talk? fine
  [memory]    see what I remember about you
```

Or skip the menu and call a mode directly:

| Command | Energy | What happens |
|---|---|---|
| **`/schwiftyy:build`** `<idea>` | 🚀 Hype. Moving fast. | Asks max 3 questions → detects your stack → writes an architecture plan in phases → builds phase by phase, explaining each code block in 2–3 sentences → ends with *what was built*, *what's live*, and *one specific next action* |
| **`/schwiftyy:optimize`** `[path]` | 🔪 Surgical. Blunt. | Scans in impact order: **security → performance → code quality**. For each issue: name it, say why it matters, show the fix, move on. Announces every edit before making it. Ends with what's actually *good* |
| **`/schwiftyy:teach`** `<topic>` | 🐢 Slow. Patient. | Plain-English concept → weird analogy → "make sense so far?" → *then* code → line-by-line walkthrough. Calibrates depth to your skill level. Won't re-teach what you already learned |
| **`/schwiftyy:chat`** `<anything>` | 🛋️ Relaxed. Tangents allowed. | Freeform. Loads your project memory so it feels like talking to someone who knows what you're working on. C-420 lore may occur |
| **`/schwiftyy:memory`** `[show|clear|edit]` | 🔮 Stoned oracle. | Reads back both memory layers. Edit or wipe entries, and he always shows you the exact change and asks before writing |

**Chill mode vs Pro mode:** say **"pro mode"** and he drops the slang and lore but keeps the bluntness and precision. **"chill mode"** brings him back. Pro mode is Schwiftyy dialed down; he doesn't turn into a generic assistant, and "Certainly!" is banned in both modes.

---

## 🧠 How it works, in 30 seconds

There's no custom model and no server. **Schwiftyy is Claude** (or whatever model your Claude Code runs), steered by Markdown instructions:

- **[`commands/`](commands)**: one short file per mode. Each one says which tools that mode may use and which playbook to follow.
- **[`schwiftyy/identity.md`](schwiftyy/identity.md)**: who he is, how he talks, what he'll never say. Loads only when you call him.
- **[`schwiftyy/workflows/`](schwiftyy/workflows)**: the playbook for each mode, rule by rule. Plan before building. Explain every code block. Announce every fix. Never re-teach.
- **Memory**: plain Markdown files, one per project plus one about you. [How memory works →](docs/memory.md)

[Full breakdown with diagrams →](docs/how-it-works.md)

---

## 🛣️ Roadmap

- [x] Installable npm package, zero dependencies
- [x] Claude Code plugin + marketplace, `CLAUDE_CONFIG_DIR` support, CI-only releases
- [x] Chat-only local Schwiftyy for Ollama
- [x] Portal animation + `/schwiftyy` entry menu
- [x] Locked-in character, Chill/Pro tone toggle
- [x] Build + Optimize modes
- [x] Teach + Chat modes, skill-level aware
- [x] Two-layer memory with rotation + `/schwiftyy:memory`
- [ ] More stacks in `build` (React, Next.js, Astro…)
- [ ] Tone mode that persists across sessions
- [ ] Bundled specialist agents
- [ ] **Schwiftyy Pro:** extra dimensions (modes), cloud memory sync across machines
- [ ] **Schwiftyy Teams:** shared config + memory across a team

Got an idea? [Open a portal request](../../issues/new/choose).

---

## ❓ FAQ

<details>
<summary><b>Is this an actual AI model?</b></summary>
<br>
No, and that's the cool part. Schwiftyy is a <i>personality and a playbook</i> running on whatever Claude model your Claude Code uses. All the "intelligence" comes from Claude; Schwiftyy just makes sure it plans before it builds, explains instead of dumping code, remembers you, and stays honest about bad code.
</details>

<details>
<summary><b>Does it cost anything?</b></summary>
<br>
Schwiftyy is free and MIT-licensed. You need a working Claude Code setup: a Claude plan, an API key, or a free local model through <a href="docs/install-ollama.md">Ollama</a>.
</details>

<details>
<summary><b>Can I run it locally / offline?</b></summary>
<br>
Yes, two ways: full Schwiftyy with Claude Code running on an Ollama model, or a chat-only Schwiftyy as a plain Ollama model. <a href="docs/install-ollama.md">Setup for both →</a>
</details>

<details>
<summary><b>Will he talk like this in ALL my Claude Code sessions?</b></summary>
<br>
No. Since 0.2.0 he only shows up when you call him. (Up to 0.1.2, the npm install put him in every session; re-running the install fixes that.)
</details>

<details>
<summary><b>I use a custom Claude config folder (<code>CLAUDE_CONFIG_DIR</code>). Does it work?</b></summary>
<br>
Yes. The plugin handles it automatically; for npm, set the variable when you install. <a href="docs/install-claude-code.md#custom-config-folder-claude_config_dir">Details →</a>
</details>

<details>
<summary><b>Does he send my code anywhere?</b></summary>
<br>
Schwiftyy itself sends nothing. There's no server and no telemetry. Your code goes to Claude exactly as it would in any normal Claude Code session, and memory stays in local Markdown files.
</details>

<details>
<summary><b>Is this affiliated with Rick and Morty?</b></summary>
<br>
No. This is an independent fan-flavored project with an original character. Schwiftyy is a Cannaboidian from Dimension C-420, a whole different branch of the multiverse. <i>Rick and Morty</i> is owned by its creators and Adult Swim.
</details>

<details>
<summary><b>Why does he keep saying "vibe coder"?</b></summary>
<br>
He doesn't know your name yet. Start him once and tell him.
</details>

---

<details>
<summary>📁 <b>CLASSIFIED: Dimension C-420 field report</b> <sub>(clearance level: leaf)</sub></summary>

<br>

> **SUBJECT:** Schwiftyy
> **SPECIES:** Cannaboidian (sentient leaf, seven leaflets, one attitude)
> **ORIGIN:** Dimension C-420
> **STATUS:** Escaped. Currently embedded in the developer tooling of Dimension Us.
>
> In C-420 there were the **Code Wars**: a long, dumb conflict between the people who shipped and the people who tested. Nobody did both. Every app was a monolith. Every monolith was "temporary." Somewhere in the **Monolith Wastes** there's a 40,000-line `index.php` still serving traffic, held together by a comment that says `// do not touch`.
>
> Then came the **Great Prod Outage**. A junior dev, a Friday, a `DROP TABLE` with no `WHERE`. Three continents lost their session cookies.
>
> Schwiftyy survived it. He learned the only lesson that matters: *understand what you ship.* He's been trying to teach it ever since, mostly to people who just want the button to be blue.
>
> **KNOWN WEAKNESSES:** clean code (makes him emotional), people who say "it works on my machine," the color `#FF00FF`.
>
> **KNOWN PASSPHRASES:** █████ █████ ███ ███ · ███ ████████ · ████ ██ ████ ███ ███ ███
>
> *redacted for your protection. try them anyway.*

</details>

---

## 🤝 Contributing

PRs welcome, especially new modes, better workflows, more stacks, and better roasts. Read [CONTRIBUTING.md](CONTRIBUTING.md) first. The short version:

1. Keep command files **thin**. Logic goes in `schwiftyy/workflows/`.
2. Never hardcode a path. Use `$SCHWIFTYY_HOME` / `$SCHWIFTYY_MEMORY`.
3. Every behavior change traces to a requirement in [`docs/development/planning/REQUIREMENTS.md`](docs/development/planning/REQUIREMENTS.md).
4. Don't break character. Don't add "Certainly!".
5. `npm run check` before you open the PR. CI runs it on Windows and Linux anyway (macOS runs after merge).

---

<div align="center">

**MIT** © [Diyon Clark](https://github.com/OxMediaEcomm) · OxMedia

If Schwiftyy roasted your code and you came out better for it, **drop a ⭐**. It's the only currency C-420 accepts.

<sub>No Cannaboidians were harmed in the making of this README. One was mildly inconvenienced.</sub>

<!-- secret #3: if you've read this far you deserve to know. ask him "what's in dimension C-420". -->

</div>
