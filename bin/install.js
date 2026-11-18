#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PKG_ROOT = path.join(__dirname, '..');
const VERSION = require('../package.json').version;

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');

const TARGETS = [
  { src: 'commands/schwiftyy', dest: path.join(CLAUDE_DIR, 'commands', 'schwiftyy'), merge: false },
  { src: 'agents',             dest: path.join(CLAUDE_DIR, 'agents'),                merge: false },
  { src: 'rules',              dest: path.join(CLAUDE_DIR, 'rules'),                 merge: true  },
  { src: 'schwiftyy',         dest: path.join(CLAUDE_DIR, 'schwiftyy'),             merge: false },
];

function ensureDir(dir) {
  if (!DRY_RUN && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyDir(src, dest, merge) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, merge);
    } else {
      const exists = fs.existsSync(destPath);
      if (merge && exists && !FORCE) {
        console.log(`  skip (exists): ${destPath}`);
        continue;
      }
      if (exists && !merge && !FORCE) {
        console.log(`  overwrite: ${destPath}`);
      }
      if (!DRY_RUN) fs.copyFileSync(srcPath, destPath);
      console.log(`  ${DRY_RUN ? '[dry-run] would copy' : 'copied'}: ${destPath}`);
    }
  }
}

function writeVersion() {
  const versionDir = path.join(CLAUDE_DIR, 'schwiftyy');
  ensureDir(versionDir);
  const versionPath = path.join(versionDir, 'VERSION');
  if (!DRY_RUN) fs.writeFileSync(versionPath, VERSION + '\n');
  console.log(`  ${DRY_RUN ? '[dry-run] would write' : 'wrote'}: ${versionPath}`);
}

function initMemoryDirs() {
  const memoryDir = path.join(CLAUDE_DIR, 'schwiftyy', 'memory');
  ensureDir(memoryDir);
  console.log(`  ${DRY_RUN ? '[dry-run] would create' : 'created'}: ${memoryDir}`);
}

// You weren't supposed to find this. `npx schwiftyy-cc --get-schwifty`
function getSchwifty() {
  const { spawnSync } = require('child_process');
  const anim = path.join(PKG_ROOT, 'commands', 'schwiftyy', 'schwiftyy-animation.js');
  spawnSync(process.execPath, [anim], { stdio: 'inherit' });
  console.log('\n  Portal test complete. Nothing was installed. Nothing was harmed.');
  console.log('  Mostly.\n');
}

function main() {
  if (args.includes('--get-schwifty')) return getSchwifty();
  if (DRY_RUN) console.log('\n[dry-run] No files will be written.\n');
  console.log(`\nSchwiftyy v${VERSION} — installing to ${CLAUDE_DIR}\n`);

  ensureDir(CLAUDE_DIR);

  for (const { src, dest, merge } of TARGETS) {
    const srcPath = path.join(PKG_ROOT, src);
    if (!fs.existsSync(srcPath)) continue;
    const entries = fs.readdirSync(srcPath);
    if (entries.length === 0) continue;
    console.log(`${src}/`);
    copyDir(srcPath, dest, merge);
  }

  writeVersion();
  initMemoryDirs();
  console.log(`\n${DRY_RUN ? '[dry-run] Done. No files were written.' : 'Done. Open Claude Code and run /schwiftyy to get started.'}\n`);
}

try {
  main();
} catch (err) {
  if (err.code === 'EACCES' || err.code === 'EPERM') {
    console.error(`\nPermission denied writing to ${CLAUDE_DIR}`);
    console.error('Try running with elevated permissions or check folder ownership.\n');
  } else {
    console.error(`\nInstall failed: ${err.message}\n`);
  }
  process.exit(1);
}
