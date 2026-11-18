# Run Schwiftyy on a local model (Ollama)

[← back to README](../README.md)

Two different things get called "running Schwiftyy locally." Pick the one you actually want:

| | **A. Full Schwiftyy, local brain** | **B. Chat-only Schwiftyy** |
|---|---|---|
| What it is | Claude Code itself, pointed at a model running in Ollama | A plain Ollama model with Schwiftyy's personality |
| Modes | All five, plus memory | Just talking |
| Can read and edit your files | Yes, if the model supports tool calling | No |
| Remembers you between sessions | Yes | No |
| Needs | Ollama, Claude Code, a strong coding model, 64k+ context | Ollama |
| Costs | Free (your hardware) | Free (your hardware) |

> **Honest expectations:** Schwiftyy is a set of detailed instructions. Claude follows them very well. Smaller local models follow them noticeably worse: they skip steps, forget the 3-question limit, or drop character. Bigger coding-tuned models do better. If you try one, [tell us how it went](https://github.com/OxMediaEcomm/SchwiftyyAi/issues/new/choose) so we can keep a list.

---

## A. Full Schwiftyy with Claude Code + Ollama

Ollama speaks the same API as Anthropic, so Claude Code can use it as its brain.

1. **Install Ollama** from [ollama.com](https://ollama.com) and pull a model that supports tool calling. Check [Ollama's Claude Code page](https://docs.ollama.com/integrations/claude-code) for current recommendations.

2. **Install Claude Code** if you haven't:

   ```bash
   # macOS / Linux
   curl -fsSL https://claude.ai/install.sh | bash
   ```

   ```powershell
   # Windows
   irm https://claude.ai/install.ps1 | iex
   ```

3. **Start Claude Code on Ollama.** The easy way:

   ```bash
   ollama launch claude
   ```

   Or by hand:

   ```bash
   # macOS / Linux / Git Bash
   export ANTHROPIC_AUTH_TOKEN=ollama
   export ANTHROPIC_API_KEY=""
   export ANTHROPIC_BASE_URL=http://localhost:11434
   claude --model <your-model>
   ```

   ```powershell
   # PowerShell
   $env:ANTHROPIC_AUTH_TOKEN="ollama"
   $env:ANTHROPIC_API_KEY=""
   $env:ANTHROPIC_BASE_URL="http://localhost:11434"
   claude --model <your-model>
   ```

4. **Give the model enough context.** Ollama recommends **64k tokens or more** for Claude Code. Set it in the Ollama app's settings, or with `OLLAMA_CONTEXT_LENGTH=65536` before `ollama serve`.

5. **Install Schwiftyy** exactly as in [the Claude Code guide](install-claude-code.md), then run `/schwiftyy:portal`.

---

## B. Chat-only Schwiftyy

This repo ships a ready-made [`ollama/Modelfile`](../ollama/Modelfile). It's generated from the same [`schwiftyy/identity.md`](../schwiftyy/identity.md) the Claude Code version uses, so he has the same personality. He also knows he's running locally and will tell you when something needs the full version.

```bash
git clone https://github.com/OxMediaEcomm/SchwiftyyAi.git
cd SchwiftyyAi
ollama pull llama3.1:8b
ollama create schwiftyy -f ollama/Modelfile
ollama run schwiftyy
```

### Use a different base model

```bash
# needs Node.js 18+
SCHWIFTYY_BASE_MODEL=qwen2.5:14b npm run build:modelfile
ollama create schwiftyy -f ollama/Modelfile
```

Or just edit the `FROM` line in `ollama/Modelfile` locally. Don't commit that change, though: CI regenerates the file and will flag the difference.
