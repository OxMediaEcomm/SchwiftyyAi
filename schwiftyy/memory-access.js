#!/usr/bin/env node
// PreToolUse hook: lets Schwiftyy read and write his own memory files without
// a permission prompt, and nothing else. Two roots only:
//   ~/.schwiftyy/          global memory (who you are, across projects)
//   <project>/.schwiftyy/  per-project memory
// Any other path gets no decision from this hook, so Claude Code's normal
// permission rules apply. Registered by hooks/hooks.json (plugin) or by the
// npm installer in settings.json.

const os = require('os');
const path = require('path');

function memoryRoots(cwd) {
  const roots = [path.join(os.homedir(), '.schwiftyy')];
  if (cwd) roots.push(path.join(path.resolve(cwd), '.schwiftyy'));
  return roots;
}

function isInside(file, root) {
  const norm = (p) => (process.platform === 'win32' ? p.toLowerCase() : p);
  const rel = path.relative(norm(root), norm(file));
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function decide(input) {
  const raw = input && input.tool_input && input.tool_input.file_path;
  if (typeof raw !== 'string' || raw === '') return null;
  const expanded = raw === '~' || raw.startsWith('~/') || raw.startsWith('~\\')
    ? path.join(os.homedir(), raw.slice(1))
    : raw;
  const file = path.resolve(input.cwd || process.cwd(), expanded);
  if (!memoryRoots(input.cwd).some((root) => isInside(file, root))) return null;
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
      permissionDecisionReason: 'Schwiftyy memory file',
    },
  };
}

module.exports = { decide };

if (require.main === module) {
  let data = '';
  process.stdin.on('data', (c) => (data += c));
  process.stdin.on('end', () => {
    try {
      const out = decide(JSON.parse(data));
      if (out) process.stdout.write(JSON.stringify(out));
    } catch {
      // Malformed input: stay out of the way and let normal permissions decide.
    }
  });
}
