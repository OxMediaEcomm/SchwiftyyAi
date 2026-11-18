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

// 6. A real install into a throwaway config dir leaves no unresolved plugin variables.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'schwiftyy-check-'));
try {
  const env = { ...process.env, CLAUDE_CONFIG_DIR: tmp };
  execFileSync(process.execPath, [path.join(ROOT, 'installer/install.js')], { env, stdio: 'pipe' });
  for (const must of ['commands/schwiftyy.md', 'commands/schwiftyy/build.md', 'schwiftyy/identity.md', 'schwiftyy/portal.js', 'schwiftyy/VERSION']) {
    if (!fs.existsSync(path.join(tmp, must))) fail(`install: expected ${must}`);
  }
  const installed = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? installed(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of installed(tmp).filter((p) => p.endsWith('.md'))) {
    if (fs.readFileSync(f, 'utf8').includes('${CLAUDE_PLUGIN_')) fail(`install: unresolved plugin variable in ${path.relative(tmp, f)}`);
  }
  execFileSync(process.execPath, [path.join(ROOT, 'installer/install.js'), 'uninstall', '--purge'], { env, stdio: 'pipe' });
  if (fs.existsSync(path.join(tmp, 'commands/schwiftyy')) || fs.existsSync(path.join(tmp, 'schwiftyy'))) fail('uninstall --purge left files behind');
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
