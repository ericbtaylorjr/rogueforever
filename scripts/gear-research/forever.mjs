#!/usr/bin/env node
/**
 * Gets the WoWSims Forever item database for the gear research (see README.md here).
 *
 *   node scripts/gear-research/forever.mjs             # fetch origin/master, fast-forward the checkout if safe, report
 *   node scripts/gear-research/forever.mjs --offline   # skip the fetch (use whatever origin/master the checkout already has)
 *
 * The database is `assets/database/db.json` in the `wowsims/forever` repo (a checkout at
 * ~/dev/forever, or $FOREVER_REPO), which WoWSims regenerates from the decrypted game files
 * several times a day. The research always reads it from `origin/master` with `git show`, so
 * it is the latest master whatever the working tree is doing. The checkout itself is only
 * fast-forwarded when it is clean and on master; otherwise it is left alone and the report
 * says so. Never switches branches or resets anything.
 *
 * Exports `syncForever()` and `loadDb()` for the other scripts; the CLI writes cache/forever.json.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
export const REPO = process.env.FOREVER_REPO ?? `${homedir()}/dev/forever`;
const DB_PATH = 'assets/database/db.json';

const git = (...args) => execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 120_000 });

/** Fetch master and say which commit the research will read. Throws if the fetch fails (no silent stale data). */
export function syncForever({ offline = false } = {}) {
  try {
    git('rev-parse', '--git-dir');
  } catch {
    throw new Error(`No git checkout of wowsims/forever at ${REPO}. Clone it there (or set FOREVER_REPO).`);
  }
  let note = 'fetched';
  if (offline) note = 'offline: used the checkout as it was';
  else {
    try {
      git('fetch', 'origin', 'master');
    } catch (e) {
      throw new Error(`git fetch origin master failed in ${REPO}: ${String(e.stderr ?? e.message).trim()}\nFix the connection or SSH key, or rerun with --offline to use the last fetched master.`);
    }
  }
  const head = git('rev-parse', 'origin/master').trim();
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD').trim();
  const dirty = git('status', '--porcelain', '--untracked-files=no').trim() !== '';
  const local = git('rev-parse', 'HEAD').trim();
  if (!offline && local !== head) {
    if (branch === 'master' && !dirty) {
      try {
        git('merge', '--ff-only', 'origin/master');
        note = 'fetched and fast-forwarded the checkout';
      } catch {
        note = 'fetched; the checkout could not fast-forward, left alone';
      }
    } else note = `fetched; checkout left alone (${branch === 'master' ? 'has uncommitted changes' : `on ${branch}, not master`}), the database is read from origin/master`;
  }
  // The commit that last changed the database file is the data's real date.
  const [dbCommit, dbDate] = git('log', '-1', '--format=%H|%cI', 'origin/master', '--', DB_PATH).trim().split('|');
  const [headDate, headSubject] = git('log', '-1', '--format=%cI|%s', 'origin/master').trim().split('|');
  return { repo: REPO, head, headDate, headSubject, dbCommit, dbDate, branch, note };
}

/** The database JSON text and its parse, straight from origin/master. */
export function loadDb() {
  const text = git('show', `origin/master:${DB_PATH}`);
  return { text, db: JSON.parse(text), hash: createHash('sha1').update(text).digest('hex') };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const info = syncForever({ offline: process.argv.includes('--offline') });
  const { db, hash } = loadDb();
  mkdirSync(here('./cache'), { recursive: true });
  writeFileSync(here('./cache/forever.json'), JSON.stringify({ ...info, items: db.items.length, hash, checked: new Date().toISOString() }, null, 2));
  console.log(`Forever master ${info.head.slice(0, 10)} (${info.headDate.slice(0, 16)}): ${info.headSubject}`);
  console.log(`Database last changed in ${info.dbCommit.slice(0, 10)} at ${info.dbDate.slice(0, 16)}; ${db.items.length} items. (${info.note})`);
}
