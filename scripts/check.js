#!/usr/bin/env node
// Repo health checks. Runs in CI and before every npm publish.
// Exists because 0.1.0 was published from a private folder full of D:/ paths.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const failures = [];
const fail = (msg) => failures.push(msg);

function walk(dir) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = path.posix.join(dir, e.name);
    return e.isDirectory() ? walk(rel) : [rel];
  });
}

const shipped = ['commands', 'schwiftyy', 'installer'].flatMap(walk);

// 1. Nothing shipped may point at a specific machine or at ~/.claude directly.
const MACHINE_PATH = /[A-Za-z]:[\\/]|\/Users\/|\/home\/|~\/\.claude/;
for (const f of shipped) {
  if (f.startsWith('installer/')) continue; // the installer legitimately names these
  read(f).split('\n').forEach((line, i) => {
    if (MACHINE_PATH.test(line)) fail(`${f}:${i + 1} hardcoded path: ${line.trim()}`);
  });
}

// 2. Every command has the frontmatter Claude Code needs and the path header.
for (const f of walk('commands')) {
  const text = read(f);
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) { fail(`${f}: missing frontmatter`); continue; }
  for (const key of ['description', 'allowed-tools', 'argument-hint']) {
    if (!new RegExp(`^${key}:`, 'm').test(fm[1])) fail(`${f}: frontmatter missing ${key}`);
  }
  if (!text.includes('${CLAUDE_PLUGIN_ROOT}/schwiftyy')) fail(`${f}: missing the Schwiftyy paths header`);
}

// 3. Every file a workflow or command references actually exists.
for (const f of shipped.filter((p) => p.endsWith('.md'))) {
  for (const [, rel] of read(f).matchAll(/\$SCHWIFTYY_HOME\/([\w./-]+)/g)) {
    if (!fs.existsSync(path.join(ROOT, 'schwiftyy', rel))) fail(`${f}: references missing $SCHWIFTYY_HOME/${rel}`);
  }
}

// 4. Versions agree.
const pkg = JSON.parse(read('package.json'));
const plugin = JSON.parse(read('.claude-plugin/plugin.json'));
if (pkg.version !== plugin.version) fail(`version mismatch: package.json ${pkg.version} vs plugin.json ${plugin.version}`);
if (pkg.dependencies && Object.keys(pkg.dependencies).length) fail('package.json has runtime dependencies; Schwiftyy ships with zero');

// 5. The generated Modelfile is up to date.
const { build } = require('./build-modelfile');
if (!fs.existsSync(path.join(ROOT, 'ollama/Modelfile')) || read('ollama/Modelfile').replace(/\r\n/g, '\n') !== build()) {
  fail('ollama/Modelfile is stale: run `npm run build:modelfile`');
}

// 6. The memory hook allows Schwiftyy's own memory files and nothing else.
const hooks = JSON.parse(read('hooks/hooks.json'));
const hookArgs = hooks.hooks?.PreToolUse?.[0]?.hooks?.[0]?.args || [];
if (hookArgs[0] !== '${CLAUDE_PLUGIN_ROOT}/schwiftyy/memory-access.js') fail('hooks/hooks.json must run schwiftyy/memory-access.js');
const { decide } = require('../schwiftyy/memory-access');
const home = os.homedir();
const proj = path.join(os.tmpdir(), 'proj');
const hookCases = [
  ['~/.schwiftyy/memory/profile.md', true],
  [path.join(home, '.schwiftyy', 'memory', 'global.md'), true],
  [path.join(proj, '.schwiftyy', 'memory.md'), true],
  ['.schwiftyy/memory.md', true],
  [path.join(proj, '.gitignore'), false],
  [path.join(proj, 'index.html'), false],
  [path.join(proj, '.schwiftyy', '..', 'secrets.env'), false],
  [path.join(home, '.schwiftyyEVIL', 'x.md'), false],
  [path.join(home, '.ssh', 'id_rsa'), false],
];
for (const [file, want] of hookCases) {
  if (!!decide({ cwd: proj, tool_input: { file_path: file } }) !== want) fail(`memory hook: ${file} should be ${want ? 'allowed' : 'left alone'}`);
}

// 7. A real install into a throwaway config dir (and a fake home) round-trips cleanly.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'schwiftyy-check-'));
try {
  const cfg = path.join(tmp, 'cfg');
  const fakeHome = path.join(tmp, 'home');
  const env = { ...process.env, CLAUDE_CONFIG_DIR: cfg, HOME: fakeHome, USERPROFILE: fakeHome };
  const run = (...a) => execFileSync(process.execPath, [path.join(ROOT, 'installer/install.js'), ...a], { env, stdio: 'pipe' });

  // A 0.2.0-era install: memory inside the config dir, plus a user hook and setting we must keep.
  fs.mkdirSync(path.join(cfg, 'schwiftyy', 'memory'), { recursive: true });
  fs.writeFileSync(path.join(cfg, 'schwiftyy', 'memory', 'profile.md'), 'name: Test\n');
  const userHook = { matcher: 'Bash', hooks: [{ type: 'command', command: 'echo mine' }] };
  fs.writeFileSync(path.join(cfg, 'settings.json'), JSON.stringify({ theme: 'dark', hooks: { PreToolUse: [userHook] } }));

  run();
  run(); // re-running must not duplicate the hook
  for (const must of ['commands/schwiftyy.md', 'commands/schwiftyy/build.md', 'schwiftyy/identity.md', 'schwiftyy/portal.js', 'schwiftyy/memory-access.js', 'schwiftyy/VERSION']) {
    if (!fs.existsSync(path.join(cfg, must))) fail(`install: expected ${must}`);
  }
  if (!fs.existsSync(path.join(fakeHome, '.schwiftyy', 'memory', 'profile.md'))) fail('install: legacy memory was not moved to ~/.schwiftyy/memory');
  if (fs.existsSync(path.join(cfg, 'schwiftyy', 'memory'))) fail('install: legacy memory folder left behind');
  const settings = JSON.parse(fs.readFileSync(path.join(cfg, 'settings.json'), 'utf8'));
  const pre = settings.hooks?.PreToolUse || [];
  const ours = pre.filter((g) => g.hooks.some((h) => (h.args || []).some((a) => a.endsWith('memory-access.js'))));
  if (ours.length !== 1) fail(`install: expected exactly 1 memory hook in settings.json, found ${ours.length}`);
  if (settings.theme !== 'dark' || !pre.some((g) => g.matcher === 'Bash')) fail('install: clobbered existing settings.json content');

  const installed = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? installed(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of installed(cfg).filter((p) => p.endsWith('.md'))) {
    if (fs.readFileSync(f, 'utf8').includes('${CLAUDE_PLUGIN_')) fail(`install: unresolved plugin variable in ${path.relative(cfg, f)}`);
  }

  run('uninstall');
  if (fs.existsSync(path.join(cfg, 'commands/schwiftyy')) || fs.existsSync(path.join(cfg, 'schwiftyy'))) fail('uninstall left files behind');
  if (!fs.existsSync(path.join(fakeHome, '.schwiftyy', 'memory', 'profile.md'))) fail('uninstall (no --purge) deleted memory');
  const after = JSON.parse(fs.readFileSync(path.join(cfg, 'settings.json'), 'utf8'));
  if (JSON.stringify(after) !== JSON.stringify({ theme: 'dark', hooks: { PreToolUse: [userHook] } })) fail('uninstall: settings.json not restored to the user\'s original');
  run('uninstall', '--purge');
  if (fs.existsSync(path.join(fakeHome, '.schwiftyy', 'memory'))) fail('uninstall --purge left memory behind');
} catch (err) {
  fail(`install/uninstall threw: ${err.stderr?.toString() || err.message}`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} check(s) failed:\n`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error('');
  process.exit(1);
}
console.log('✓ all checks passed');
