#!/usr/bin/env node
/**
 * After Forever's talents change: what moved, and where the Handbook still talks about it.
 *
 *   npm run talents                 # refresh src/content/talent-trees.json first
 *   npm run talent-audit            # diff it against the committed copy (git HEAD)
 *   npm run talent-audit -- --old path/to/old-talent-trees.json
 *
 * Lists talents that were added, removed, renamed, moved (row/column), re-ranked or
 * re-worded (matched by talent id), then greps the prose for every name that changed so
 * stale text (a removed talent's name) is found by the script, not by reading.
 * Finishes with the builds still flagged `stale: true`.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(`../${p}`, import.meta.url));
const args = process.argv.slice(2);
const oldPath = args.includes('--old') ? args[args.indexOf('--old') + 1] : null;

const now = JSON.parse(readFileSync(root('src/content/talent-trees.json'), 'utf8')).trees;
const before = JSON.parse(
  oldPath
    ? readFileSync(oldPath, 'utf8')
    : execFileSync('git', ['show', 'HEAD:src/content/talent-trees.json'], {
        cwd: root('.'),
        encoding: 'utf8',
        maxBuffer: 1 << 26,
      }),
).trees;

const flat = (trees) =>
  new Map(trees.flatMap((t) => t.talents.map((x) => [`${t.id}:${x.id}`, { ...x, tree: t.name }])));
const a = flat(before);
const b = flat(now);

const changed = new Set(); // names to grep for
const report = [];
const note = (kind, t, detail = '') =>
  report.push(`${kind.padEnd(8)} ${t.tree} · ${t.name}${detail ? ` — ${detail}` : ''}`);

for (const [k, o] of a) {
  const n = b.get(k);
  if (!n) {
    note('REMOVED', o);
    changed.add(o.name);
    continue;
  }
  const diffs = [];
  if (o.name !== n.name) {
    diffs.push(`renamed from ${o.name}`);
    changed.add(o.name);
  }
  if (o.row !== n.row || o.col !== n.col)
    diffs.push(`moved row ${o.row + 1}→${n.row + 1}${o.col !== n.col ? `, col ${o.col + 1}→${n.col + 1}` : ''}`);
  if (o.max !== n.max) diffs.push(`ranks ${o.max}→${n.max}`);
  if (JSON.stringify(o.text) !== JSON.stringify(n.text)) diffs.push('text changed');
  if (JSON.stringify(o.requires) !== JSON.stringify(n.requires)) diffs.push('prerequisite changed');
  if (diffs.length) {
    note('CHANGED', n, diffs.join('; '));
    changed.add(n.name);
  }
}
for (const [k, n] of b)
  if (!a.has(k))
    note(
      'NEW',
      n,
      `row ${n.row + 1}, ${n.max} rank${n.max > 1 ? 's' : ''} (add its spell ids to scripts/apl/spells.json, then npm run icons)`,
    );

console.log(report.length ? report.sort().join('\n') : 'No talent changes against the old trees.');

// Where the prose still mentions a changed name.
const SKIP = new Set([
  'talent-trees.json',
  'icons.json',
  'leveling-gear.json',
  'searchIndex.ts',
  'cache',
  'node_modules',
]);
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    if (SKIP.has(f)) continue;
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx|json|md|mjs)$/.test(f)) files.push(p);
  }
})(root('src'));
for (const d of ['scripts/apl', '.claude/skills'])
  (function walk(dir) {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|json|md|mjs)$/.test(f)) files.push(p);
    }
  })(root(d));
files.push(root('README.md'));

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let hits = 0;
for (const name of [...changed].sort()) {
  const re = new RegExp(`(?<![\\w'])${esc(name)}(?!\\w)`, 'i');
  for (const f of files) {
    readFileSync(f, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (!re.test(line)) return;
        hits++;
        console.log(`  mentions ${name}: ${relative(root('.'), f)}:${i + 1}  ${line.trim().slice(0, 110)}`);
      });
  }
}
if (changed.size) console.log(`\n${hits} mention(s) of ${changed.size} changed talent name(s) to review.`);

// Builds still waiting on the rework.
const stale = [];
for (const spec of ['assassination', 'combat', 'subtlety']) {
  const src = readFileSync(root(`src/content/builds/${spec}.ts`), 'utf8');
  for (const block of src.split(/\n  \{\n/).slice(1)) {
    const id = block.match(/\bid: '([^']+)'/)?.[1];
    if (id && /\n\s+stale: true,/.test(block)) stale.push(`${spec}/${id}`);
  }
}
console.log(`\nBuilds still flagged stale (${stale.length}): ${stale.join(', ') || 'none'}`);
