#!/usr/bin/env node
/**
 * Resolves the shared WoWSims Rogue APL for one build: which rows that build can ever
 * fire, and what their conditions boil down to. The Rotation section is written from
 * this output, so it stays in parity with the sim.
 *
 *   npm run apl -- combat/sinister-strike              # race-neutral
 *   npm run apl -- combat/sinister-strike --race orc   # orc | nightelf | gnome | none
 *   npm run apl -- combat/sinister-strike --apl path/to/export.json --set "Use Ambush Opener=true"
 *
 * Mirrors how the sim builds an APL (sim/core/apl*.go in wowsims/forever): a spell or
 * aura the character doesn't know resolves to nothing, an And/Or drops branches that
 * resolve to nothing, a Compare with a missing side is dropped, Spell/Talent/Aura Is
 * Known fold to constants, and a row whose action resolves to nothing is removed.
 *
 * Inputs: scripts/apl/rogue.apl.json (the APL, as pasted from WoWSims' export),
 * scripts/apl/builds.json (per build variables and weapon), scripts/apl/spells.json
 * (id → name and what makes it known), and the build's talent link in src/content/builds.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1];
};
const buildKey = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--'));
if (!buildKey) {
  console.error('Usage: npm run apl -- <spec>/<build-id> [--race orc|nightelf|gnome|none] [--apl file] [--set "Name=value"]');
  process.exit(1);
}

const spells = readJson(root('scripts/apl/spells.json'));
const buildCfg = readJson(root('scripts/apl/builds.json'))[buildKey];
if (!buildCfg) throw new Error(`${buildKey} isn't in scripts/apl/builds.json`);
const race = opt('race') ?? 'none';

let apl = readJson(opt('apl') ?? root('scripts/apl/rogue.apl.json'));
apl = apl.player?.rotation ?? apl.rotation ?? apl;

// Talents: the build's calculator link, decoded the same way src/lib/talentCalc.ts does.
const [spec, id] = buildKey.split('/');
const buildSrc = readFileSync(root(`src/content/builds/${spec}.ts`), 'utf8');
const block = buildSrc.split(/\n\s*\{\n/).find((b) => b.includes(`id: '${id}'`));
const link = block?.match(/talent-calc\/rogue\/v2([0-9-]*)/)?.[1];
if (link === undefined) throw new Error(`No talent link for ${buildKey}`);
const trees = readJson(root('src/content/talent-trees.json')).trees;
const talents = new Map();
link.split('-').forEach((digits, t) =>
  [...digits].forEach((d, i) => {
    if (+d > 0) talents.set(trees[t].talents[i].spells[0], { name: trees[t].talents[i].name, rank: +d });
  }),
);

// Variables: the APL's own, with the build's toggles and any --set on top.
const overrides = { ...buildCfg.vars };
args.forEach((a, i) => {
  if (args[i - 1] === '--set') {
    const [k, v] = a.split('=');
    overrides[k] = v === 'true' ? true : v === 'false' ? false : v;
  }
});
const vars = Object.fromEntries(apl.valueVariables.map((v) => [v.name, v.value]));
for (const [k, v] of Object.entries(overrides)) vars[k] = { const: { val: String(v) } };

const keyOf = (sid) =>
  sid.spellId ? String(sid.spellId) : sid.itemId ? `item:${sid.itemId}` : `other:${sid.otherId}`;
const nameOf = (sid) => spells[keyOf(sid)]?.name ?? keyOf(sid);
function known(sid) {
  const s = spells[keyOf(sid)];
  if (!s) throw new Error(`Add ${keyOf(sid)} to scripts/apl/spells.json`);
  if (s.unregistered) return false;
  if (s.race) return s.race === race;
  if (s.talent) return talents.has(sid.spellId);
  if (s.requires) return talents.has(s.requires);
  return true;
}

// Resolved values: { c: true|false } for a constant bool, { e: 'text' } otherwise, null when dropped.
const T = { c: true };
const F = { c: false };
const txt = (v) => (v.c !== undefined ? String(v.c) : v.e);
const OPS = { OpEq: '=', OpNe: '≠', OpLt: '<', OpLe: '≤', OpGt: '>', OpGe: '≥' };
const dropped = new Set();

function val(v) {
  const [kind, body] = Object.entries(v)[0];
  switch (kind) {
    case 'const':
      return body.val === 'true' ? T : body.val === 'false' ? F : { e: body.val };
    case 'variableRef':
      return val(vars[body.name]);
    case 'and':
    case 'or': {
      const parts = body.vals.map(val).filter(Boolean);
      if (parts.length === 0) return null;
      const short = kind === 'and' ? false : true;
      if (parts.some((p) => p.c === short)) return { c: short };
      const rest = parts.filter((p) => p.c === undefined);
      if (rest.length === 0) return { c: !short };
      if (rest.length === 1) return rest[0];
      return { e: `(${rest.map(txt).join(kind === 'and' ? ' AND ' : ' OR ')})` };
    }
    case 'not': {
      const x = val(body.val);
      if (!x) return null;
      return x.c !== undefined ? { c: !x.c } : { e: `NOT ${x.e}` };
    }
    case 'cmp': {
      const l = val(body.lhs);
      const r = val(body.rhs);
      return l && r ? { e: `${txt(l)} ${OPS[body.op]} ${txt(r)}` } : null;
    }
    case 'math': {
      const l = val(body.lhs);
      const r = val(body.rhs);
      return l && r ? { e: `(${txt(l)} + ${txt(r)})` } : null;
    }
    case 'currentEnergy':
      return { e: 'energy' };
    case 'currentComboPoints':
      return { e: 'CP' };
    case 'remainingTime':
      return { e: 'fight remaining' };
    case 'spellIsKnown':
    case 'talentIsKnown':
      return { c: known(body.spellId ?? body.talentId) };
    case 'auraIsKnown':
      return { c: known(body.auraId) };
    default: {
      // Everything else reads one spell, dot or aura, and is dropped when it isn't known.
      const sid = body.spellId ?? body.auraId;
      if (!sid) return { e: kind };
      if (!known(sid)) {
        dropped.add(nameOf(sid));
        return null;
      }
      const n = nameOf(sid);
      const target = body.sourceUnit?.type === 'CurrentTarget' ? ' on target' : '';
      return {
        e: {
          spellIsReady: `${n} ready`,
          spellTimeToReady: `${n} cooldown left`,
          spellCurrentCost: `${n} cost`,
          spellFullCooldown: `${n} full cooldown`,
          auraIsActive: `${n} up${target}`,
          auraIsInactive: `${n} down${target}`,
          auraRemainingTime: `${n} time left${target}`,
          dotIsActive: `${n} ticking`,
          dotRemainingTime: `${n} time left`,
        }[kind] ?? `${kind}(${n})`,
      };
    }
  }
}

/** One action as text, or null if the sim would remove it. Notes say why a castable-looking row never fires. */
function action(a, notes) {
  const [kind, body] = Object.entries(a).find(([k]) => k !== 'condition');
  switch (kind) {
    case 'castSpell': {
      if (!known(body.spellId)) return null;
      const s = spells[keyOf(body.spellId)];
      if (s.dagger && buildCfg.mh !== 'dagger') notes.push(`needs a dagger main hand (${buildCfg.mh} equipped), never castable`);
      return nameOf(body.spellId);
    }
    case 'strictSequence': {
      const parts = body.actions.map((x) => action(x, notes)).filter(Boolean);
      return parts.length ? parts.join(' → ') : null;
    }
    case 'waitUntil': {
      const c = val(body.condition);
      return `Wait until ${c ? txt(c) : '?'}`;
    }
    case 'groupReference': {
      const g = apl.groups.find((x) => x.name === body.groupName);
      const inner = g.actions.map((x) => row(x.action)).filter((r) => r.keep);
      return inner.length ? inner.map((r) => `[${r.cond}] ${r.act}`).join('; ') : null;
    }
    case 'autocastOtherCooldowns':
      return 'Autocast other cooldowns (trinkets and any DPS cooldown not named in the APL)';
    default:
      return kind;
  }
}

function row(a) {
  const notes = [];
  const cond = a.condition ? val(a.condition) : T;
  const act = action(a, notes);
  if (!act) {
    const ids = [...JSON.stringify(a).matchAll(/"(castSpell|groupName)":\{?"?(?:spellId":)?(\{[^}]*\}|[^"]*)/g)];
    const what = ids.map(([, k, v]) => (k === 'groupName' ? v : nameOf(JSON.parse(v)))).join(' → ');
    const why = a.groupReference ? 'nothing in the group can fire' : 'not known to this build';
    return { keep: false, why, act: what };
  }
  if (cond?.c === false) return { keep: false, why: 'condition is always false', act };
  if (notes.length) return { keep: false, why: notes.join('; '), act };
  return { keep: true, cond: cond ? txt(cond) : 'always', act };
}

const out = [];
out.push(`# ${buildKey} · race: ${race} · WoWSims preset "${buildCfg.wowsimsPreset}"`);
out.push(`Talents: ${[...talents.values()].map((t) => `${t.name} ${t.rank}`).join(', ')}`);
out.push(`Variables set: ${Object.entries(overrides).map(([k, v]) => `${k}=${v}`).join(', ')}`);
out.push('', '## Prepull');
for (const p of apl.prepullActions) {
  const act = action(p.action, []);
  if (act) out.push(`- ${p.doAtValue.const.val}: ${act}`);
}
out.push('', '## Priority list (rows this build can fire)');
const skipped = [];
apl.priorityList.forEach((item, i) => {
  const r = row(item.action);
  if (r.keep) out.push(`${String(i + 1).padStart(2)}. ${r.act}\n    if ${r.cond}`);
  else skipped.push(`${String(i + 1).padStart(2)}. ${r.act ?? '(unknown action)'}: ${r.why}`);
});
out.push('', '## Removed for this build', ...skipped);
out.push('', `## Unknown to this build (checks on these were dropped): ${[...dropped].join(', ') || 'none'}`);
console.log(out.join('\n'));
