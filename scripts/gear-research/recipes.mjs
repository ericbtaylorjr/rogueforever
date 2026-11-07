#!/usr/bin/env node
/**
 * Which recipe item teaches each crafted item, from the game's tables (see README.md here).
 *
 * A crafted pick is only as available as its recipe: Shifting Cloak is Leatherworking, but
 * its pattern is a Dire Maul drop. The Forever database gives each crafted item's crafting
 * spell; this finds the recipe item (a Pattern, Plans or Formula whose use effect is that
 * spell) in the game tables procs.mjs downloaded. lookups.mjs then asks Wowhead where each
 * recipe comes from, and rank.mjs judges it.
 *
 *   node scripts/gear-research/recipes.mjs      # reads the database + cache/db2 (run procs.mjs first)
 *
 * Writes cache/recipes.json: { "<crafting spell id>": [recipe item ids] }. No recipe item
 * means a trainer teaches it (or the game tables don't know it yet).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadDb } from './forever.mjs';
import { parseCsv } from './wago.mjs';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const dbRoot = here('./cache/db2/');
if (!existsSync(dbRoot)) throw new Error('Run procs.mjs first: it downloads the game tables this reads.');
const dir = `${dbRoot}${readdirSync(dbRoot).sort().at(-1)}/`;

const itemOfEffect = new Map();
for (const r of parseCsv(readFileSync(`${dir}ItemXItemEffect.csv`, 'utf8'))) itemOfEffect.set(r.ItemEffectID, r.ItemID);
const recipesBySpell = new Map();
for (const e of parseCsv(readFileSync(`${dir}ItemEffect.csv`, 'utf8'))) {
  const item = itemOfEffect.get(e.ID);
  if (item) (recipesBySpell.get(e.SpellID) ?? recipesBySpell.set(e.SpellID, []).get(e.SpellID)).push(Number(item));
}

const { db } = loadDb();
const out = {};
for (const item of db.items) for (const s of item.sources ?? []) if (s.crafted?.spellId) out[s.crafted.spellId] = recipesBySpell.get(String(s.crafted.spellId)) ?? [];
writeFileSync(here('./cache/recipes.json'), JSON.stringify(out));
const withRecipe = Object.values(out).filter((r) => r.length).length;
console.log(`${Object.keys(out).length} crafting spells; ${withRecipe} have a recipe item, the rest are trainer recipes → cache/recipes.json`);
