#!/usr/bin/env node
/**
 * Replace the EllesmereUI profile import string.
 *
 *   npm run ellesmere              # read from the clipboard
 *   npm run ellesmere -- path.txt  # read from a file
 *   pbpaste | npm run ellesmere -- -   # read from stdin
 *
 * Clipboard reading works on WSL/Windows (PowerShell), macOS (pbpaste) and
 * Linux (wl-paste or xclip).
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const TARGET = fileURLToPath(new URL('../src/content/imports/ellesmere.txt', import.meta.url));
const PREFIX = '!EUI_';

function readClipboard() {
  const commands = [
    'powershell.exe -NoProfile -Command "Get-Clipboard -Raw"',
    'pbpaste',
    'wl-paste --no-newline',
    'xclip -selection clipboard -o',
  ];
  for (const cmd of commands) {
    try {
      return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 16 * 1024 * 1024 });
    } catch {
      // Try the next clipboard tool.
    }
  }
  throw new Error('Could not read the clipboard. Pass a file path instead.');
}

const source = process.argv[2];
const raw = source === '-' ? readFileSync(0, 'utf8') : source ? readFileSync(source, 'utf8') : readClipboard();
// Strip all whitespace: the string is one line, and pastes often pick up stray line breaks.
const value = raw.replace(/\s+/g, '');

if (!value.startsWith(PREFIX)) {
  console.error(`Not an EllesmereUI import string: expected it to start with "${PREFIX}", got "${value.slice(0, 20)}".`);
  process.exit(1);
}

const previous = readFileSync(TARGET, 'utf8').trim();
if (previous === value) {
  console.log('EllesmereUI profile is already up to date.');
  process.exit(0);
}

writeFileSync(TARGET, `${value}\n`);
console.log(`Updated EllesmereUI profile: ${previous.length} → ${value.length} chars.`);
console.log(`  starts: ${value.slice(0, 24)}…`);
console.log(`  ends:   …${value.slice(-24)}`);
