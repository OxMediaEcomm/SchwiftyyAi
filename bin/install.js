#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const PKG_ROOT = path.join(__dirname, '..');
const VERSION = require('../package.json').version;

const TARGETS = [
  { src: 'commands/schwiftyy', dest: path.join(CLAUDE_DIR, 'commands', 'schwiftyy'), merge: false },
  { src: 'agents',             dest: path.join(CLAUDE_DIR, 'agents'),                merge: false },
  { src: 'rules',              dest: path.join(CLAUDE_DIR, 'rules'),                 merge: true  },
  { src: 'schwiftyy',          dest: path.join(CLAUDE_DIR, 'schwiftyy'),             merge: false },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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
      if (merge && fs.existsSync(destPath)) {
        console.log(`  skip (exists): ${destPath}`);
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
      console.log(`  copied: ${destPath}`);
    }
  }
}

function writeVersion() {
  const versionDir = path.join(CLAUDE_DIR, 'schwiftyy');
  ensureDir(versionDir);
  fs.writeFileSync(path.join(versionDir, 'VERSION'), VERSION + '\n');
}

function main() {
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
  console.log(`\n  wrote: ${path.join(CLAUDE_DIR, 'schwiftyy', 'VERSION')}`);
  console.log('\nDone. Open Claude Code and run /schwiftyy to get started.\n');
}

main();
