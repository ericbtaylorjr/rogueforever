#!/usr/bin/env node
/**
 * Replace a Comfy's UI profile import string and stamp its "last updated" time.
 *
 *   npm run ellesmere              # EllesmereUI profile, read from the clipboard
 *   npm run editmode               # Edit Mode layout, read from the clipboard
 *   npm run ellesmere -- path.txt  # read from a file
 *   pbpaste | npm run ellesmere -- -   # read from stdin
 *
 * Clipboard reading works on WSL/Windows (PowerShell), macOS (pbpaste) and
 * Linux (wl-paste or xclip).
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PROFILES = {
  ellesmere: {
    name: 'EllesmereUI profile',
    // One line of base64-ish text; pastes often pick up stray line breaks.
    normalize: (raw) => raw.replace(/\s+/g, ''),
    validate: (value) => value.startsWith('!EUI_') || 'expected it to start with "!EUI_"',
  },
  editmode: {
    name: 'Edit Mode layout',
    // Space-separated fields, so only collapse line breaks and runs of whitespace.
    normalize: (raw) => raw.trim().replace(/\s+/g, ' '),
    validate: (value) => (/^\d+ /.test(value) && value.includes('UIParent')) || 'expected a WoW Edit Mode layout string',
  },
};

const id = process.argv[2];
const profile = PROFILES[id];
if (!profile) {
  console.error(`Unknown profile "${id}". Use one of: ${Object.keys(PROFILES).join(', ')}.`);
  process.exit(1);
}

const target = fileURLToPath(new URL(`../src/content/imports/${id}.txt`, import.meta.url));
const stamps = fileURLToPath(new URL('../src/content/imports/updated.json', import.meta.url));

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

const source = process.argv[3];
const raw = source === '-' ? readFileSync(0, 'utf8') : source ? readFileSync(source, 'utf8') : readClipboard();
const value = profile.normalize(raw);

const valid = profile.validate(value);
if (valid !== true) {
  console.error(`Not an ${profile.name} string: ${valid}, got "${value.slice(0, 20)}".`);
  process.exit(1);
}

const previous = readFileSync(target, 'utf8').trim();
if (previous === value) {
  console.log(`${profile.name} is already up to date.`);
  process.exit(0);
}

writeFileSync(target, `${value}\n`);
const updated = JSON.parse(readFileSync(stamps, 'utf8'));
updated[id] = new Date().toISOString();
writeFileSync(stamps, `${JSON.stringify(updated, null, 2)}\n`);

console.log(`Updated ${profile.name}: ${previous.length} → ${value.length} chars.`);
console.log(`  starts: ${value.slice(0, 24)}…`);
console.log(`  ends:   …${value.slice(-24)}`);
