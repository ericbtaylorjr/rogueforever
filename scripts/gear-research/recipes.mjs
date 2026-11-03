#!/usr/bin/env node
/**
 * Which recipe item teaches each crafted item, from the game's tables (see README.md here).
 *
 * A crafted pick is only as available as its recipe: Shifting Cloak is Leatherworking, but
 * its pattern is a Dire Maul drop. sources.mjs records "Leatherworking"; this finds the
 * recipe item (a Pattern, Plans or Formula whose use effect is the crafting spell), so
 * sources.mjs can look up where *that* comes from and rank.mjs can judge it.
 *
 *   node scripts/gear-research/recipes.mjs      # reads cache/sources.json + cache/db2 (run procs.mjs first)
 *
 * Writes cache/recipes.json: { "<crafted item id>": { spell, recipes: [recipe item ids] } }.
 * No recipe item means the recipe comes from a trainer (or isn't known yet).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const dbRoot = here('./cache/db2/');
if (!existsSync(dbRoot)) throw new Error('Run procs.mjs first: it downloads the game tables this reads.');
const dir = `${dbRoot}${readdirSync(dbRoot).sort().at(-1)}/`;

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') (field += '"', i++);
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') (row.push(field), (field = ''));
    else if (c === '\n') (row.push(field), rows.push(row), (row = []), (field = ''));
    else if (c !== '\r') field += c;
  }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

const itemEffects = parseCsv(readFileSync(`${dir}ItemEffect.csv`, 'utf8'));
const itemOfEffect = new Map();
for (const r of parseCsv(readFileSync(`${dir}ItemXItemEffect.csv`, 'utf8'))) itemOfEffect.set(r.ItemEffectID, r.ItemID);
const recipesBySpell = new Map();
for (const e of itemEffects) {
  const item = itemOfEffect.get(e.ID);
  if (item) (recipesBySpell.get(e.SpellID) ?? recipesBySpell.set(e.SpellID, []).get(e.SpellID)).push(Number(item));
}

const sources = JSON.parse(readFileSync(here('./cache/sources.json'), 'utf8'));
const out = {};
for (const [id, s] of Object.entries(sources)) {
  // Wowhead source code 1 = crafted; its `ti` is the crafting spell (t: 6).
  const i = (s.codes ?? []).indexOf(1);
  const spell = i >= 0 ? s.more?.[i]?.ti : undefined;
  if (spell) out[id] = { spell, recipes: recipesBySpell.get(String(spell)) ?? [] };
}
writeFileSync(here('./cache/recipes.json'), JSON.stringify(out));
const withRecipe = Object.values(out).filter((r) => r.recipes.length).length;
console.log(`${Object.keys(out).length} crafted items; ${withRecipe} have a recipe item, the rest are trainer recipes → cache/recipes.json`);
