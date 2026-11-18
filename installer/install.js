#!/usr/bin/env node
// npm install channel for Schwiftyy. The repo is also a Claude Code plugin
// (see .claude-plugin/); this script installs the same files without the
// plugin system by filling in the plugin path variables itself.

const fs = require('fs');
const path = require('path');
const os = require('os');

const [nodeMajor] = process.versions.node.split('.').map(Number);
if (nodeMajor < 18) {
  console.error(`\nSchwiftyy requires Node.js 18+. You have ${process.versions.node}.\n`);
  process.exit(1);
}

const PKG_ROOT = path.join(__dirname, '..');
const VERSION = require('../package.json').version;
const CONFIG_DIR = path.resolve(process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'));
const HOME_DIR = path.join(CONFIG_DIR, 'schwiftyy');
const CMD_DIR = path.join(CONFIG_DIR, 'commands', 'schwiftyy');
const ENTRY_CMD = path.join(CONFIG_DIR, 'commands', 'schwiftyy.md');
const SETTINGS = path.join(CONFIG_DIR, 'settings.json');
// Memory lives outside the Claude config dir: Claude Code treats writes there
// as sensitive and prompts every time, even when a hook approves them.
const MEMORY_DIR = path.join(os.homedir(), '.schwiftyy', 'memory');
const LEGACY_MEMORY_DIR = path.join(HOME_DIR, 'memory');
const HOOK_SCRIPT = path.join(HOME_DIR, 'memory-access.js');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const PURGE = args.includes('--purge');
const subcommand = args.find((a) => !a.startsWith('--')) || 'install';
const USAGE = 'Usage: npx schwiftyy-cc@latest [install | uninstall] [--dry-run] [--purge]';

const fwd = (p) => p.split(path.sep).join('/');
const log = (verb, p) => console.log(`  ${DRY_RUN ? `[dry-run] would ${verb}` : verb}: ${p}`);

// Plugin variable -> concrete path for a non-plugin install.
function render(text) {
  return text.split('${CLAUDE_PLUGIN_ROOT}').join(fwd(CONFIG_DIR));
}

function write(dest, content) {
  if (!DRY_RUN) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, content);
  }
  log('write', dest);
}

function remove(p) {
  if (!fs.existsSync(p)) return;
  if (!DRY_RUN) fs.rmSync(p, { recursive: true, force: true });
  log('remove', p);
}

function copyTree(srcDir, destDir) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) copyTree(src, dest);
    else write(dest, entry.name.endsWith('.md') ? render(fs.readFileSync(src, 'utf8')) : fs.readFileSync(src));
  }
}

const fileContains = (p, needle) => {
  try { return fs.readFileSync(p, 'utf8').includes(needle); } catch { return false; }
};

// Files earlier versions installed that this layout no longer uses.
function cleanLegacy() {
  // <=0.1.2 put the identity in rules/, which loaded Schwiftyy into every session.
  const legacyRule = path.join(CONFIG_DIR, 'rules', 'schwiftyy-identity.md');
  if (fileContains(legacyRule, 'Schwiftyy Identity')) remove(legacyRule);
  remove(path.join(CMD_DIR, 'schwiftyy.md'));
  remove(path.join(CMD_DIR, 'schwiftyy-animation.js'));
  remove(path.join(HOME_DIR, 'workflows', 'tone-mode.md'));
  // The 0.1.0 npm tarball shipped files from a private machine; they all reference D:/Schwiftyy Ai.
  const strays = [
    path.join(CONFIG_DIR, 'commands', 'inbox.md'),
    path.join(CONFIG_DIR, 'commands', 'send.md'),
    path.join(CONFIG_DIR, 'commands', 'shared.md'),
    path.join(CONFIG_DIR, 'rules', 'brains.md'),
    path.join(CONFIG_DIR, 'rules', 'bridge.md'),
    path.join(CMD_DIR, 'audit.md'),
    path.join(CMD_DIR, 'figma-sync.md'),
  ];
  for (const p of strays) if (fileContains(p, 'Schwiftyy Ai')) remove(p);
}

// The plugin registers memory-access.js through hooks/hooks.json; an npm
// install has no plugin, so the same hook goes into settings.json instead.
const isOurHook = (h) =>
  (h.args || []).some((a) => String(a).endsWith('memory-access.js')) ||
  String(h.command || '').includes('memory-access.js');

function editSettings(mutate) {
  let settings = {};
  if (fs.existsSync(SETTINGS)) {
    try {
      settings = JSON.parse(fs.readFileSync(SETTINGS, 'utf8'));
    } catch {
      console.log(`  skip: ${SETTINGS} isn't valid JSON, so the memory hook wasn't updated.`);
      console.log('        Memory still works; Claude Code will just ask before each memory write.');
      return;
    }
  }
  if (mutate(settings)) write(SETTINGS, JSON.stringify(settings, null, 2) + '\n');
}

function stripOurHook(settings) {
  const groups = settings.hooks && settings.hooks.PreToolUse;
  if (!Array.isArray(groups)) return false;
  const kept = groups
    .map((g) => ({ ...g, hooks: (g.hooks || []).filter((h) => !isOurHook(h)) }))
    .filter((g) => g.hooks.length > 0);
  if (kept.length === groups.length && kept.every((g, i) => g.hooks.length === groups[i].hooks.length)) return false;
  if (kept.length) settings.hooks.PreToolUse = kept;
  else delete settings.hooks.PreToolUse;
  if (Object.keys(settings.hooks).length === 0) delete settings.hooks;
  return true;
}

function registerHook() {
  editSettings((settings) => {
    stripOurHook(settings);
    settings.hooks = settings.hooks || {};
    settings.hooks.PreToolUse = settings.hooks.PreToolUse || [];
    settings.hooks.PreToolUse.push({
      matcher: 'Read|Write|Edit',
      hooks: [{ type: 'command', command: 'node', args: [fwd(HOOK_SCRIPT)] }],
    });
    return true;
  });
}

// <=0.2.0 kept memory in <config>/schwiftyy/memory. Move it; never overwrite.
function migrateMemory() {
  if (!fs.existsSync(LEGACY_MEMORY_DIR)) return;
  for (const name of fs.readdirSync(LEGACY_MEMORY_DIR)) {
    const dest = path.join(MEMORY_DIR, name);
    if (fs.existsSync(dest)) {
      console.log(`  keep: ${dest} already exists; left the old copy in ${LEGACY_MEMORY_DIR}`);
      continue;
    }
    if (!DRY_RUN) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
      fs.renameSync(path.join(LEGACY_MEMORY_DIR, name), dest);
    }
    log('move memory', dest);
  }
  if (!DRY_RUN && fs.readdirSync(LEGACY_MEMORY_DIR).length === 0) fs.rmdirSync(LEGACY_MEMORY_DIR);
}

function install() {
  console.log(`\nSchwiftyy v${VERSION} — installing to ${CONFIG_DIR}\n`);
  cleanLegacy();

  const commandsSrc = path.join(PKG_ROOT, 'commands');
  for (const name of fs.readdirSync(commandsSrc)) {
    const content = render(fs.readFileSync(path.join(commandsSrc, name), 'utf8'));
    write(path.join(CMD_DIR, name), content); // /schwiftyy:build, /schwiftyy:portal, ...
    if (name === 'portal.md') write(ENTRY_CMD, content); // plain /schwiftyy
  }

  migrateMemory();
  // Overwrites workflows, identity, portal and hook; memory lives elsewhere.
  copyTree(path.join(PKG_ROOT, 'schwiftyy'), HOME_DIR);
  write(path.join(HOME_DIR, 'VERSION'), VERSION + '\n');
  registerHook();

  console.log(`\n${DRY_RUN ? '[dry-run] Done. No files were written.' : 'Done. Open Claude Code and run /schwiftyy to get started.'}\n`);
}

function uninstall() {
  console.log(`\nRemoving Schwiftyy from ${CONFIG_DIR}\n`);
  cleanLegacy();
  remove(CMD_DIR);
  remove(ENTRY_CMD);
  editSettings(stripOurHook);
  migrateMemory(); // an old-layout memory folder must survive removing HOME_DIR
  remove(HOME_DIR);
  if (PURGE) remove(MEMORY_DIR);
  else if (fs.existsSync(MEMORY_DIR)) console.log(`\n  Kept your memory in ${MEMORY_DIR} (pass --purge to delete it).`);
  console.log(`\n${DRY_RUN ? '[dry-run] Done. No files were removed.' : 'Schwiftyy is gone. He says "rude."'}\n`);
}

// You weren't supposed to find this. `npx schwiftyy-cc --get-schwifty`
function getSchwifty() {
  const { spawnSync } = require('child_process');
  spawnSync(process.execPath, [path.join(PKG_ROOT, 'schwiftyy', 'portal.js')], { stdio: 'inherit' });
  console.log('\n  Portal test complete. Nothing was installed. Nothing was harmed.');
  console.log('  Mostly.\n');
}

try {
  if (args.includes('--get-schwifty')) getSchwifty();
  else if (subcommand === 'install') install();
  else if (subcommand === 'uninstall') uninstall();
  else {
    console.error(`\nUnknown command: ${subcommand}\n${USAGE}\n`);
    process.exit(1);
  }
} catch (err) {
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    console.error(`\nPermission denied writing to ${CONFIG_DIR}`);
    console.error('Check folder ownership, or set CLAUDE_CONFIG_DIR to a folder you own.\n');
  } else {
    console.error(`\nFailed: ${err.message}\n`);
  }
  process.exit(1);
}
