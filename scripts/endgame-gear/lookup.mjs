#!/usr/bin/env node
/**
 * Turns a WoWSims gear export (the JSON from Export > JSON) into GearItem lines for an
 * endgame build's gear list, read from the Forever item database (latest origin/master).
 *
 *   node scripts/endgame-gear/lookup.mjs export.json     # or `-` for stdin
 *
 * Prints one `{ slot, itemId, name, quality, source, enchant, enchantSpellId }` line per
 * filled slot, with a `// ...` note where a human has to decide (no source recorded,
 * several enchant spells share one effect id, content not in at launch). See the
 * update-endgame-gear skill for what to do with the output.
 */
import { readFileSync } from 'node:fs';
import { loadDb } from '../gear-research/forever.mjs';

// WoWSims equipment order -> the Handbook's slot names (content.json gearSlots).
const SLOTS = ['Head', 'Neck', 'Shoulders', 'Back', 'Chest', 'Wrists', 'Hands', 'Waist', 'Legs', 'Feet', 'Ring 1', 'Ring 2', 'Trinket 1', 'Trinket 2', 'Main hand', 'Off hand', 'Ranged'];
const QUALITY = { 0: 'poor', 1: 'common', 2: 'uncommon', 3: 'rare', 4: 'epic', 5: 'legendary' };
const NOT_AT_LAUNCH_ZONES = new Set([2557]); // Dire Maul; keep in step with curation.json notAtLaunch.zones

const raw = process.argv[2] === '-' || !process.argv[2] ? readFileSync(0, 'utf8') : readFileSync(process.argv[2], 'utf8');
const items = JSON.parse(raw.replace(/^\s*<pasted[^>]*>|<\/pasted[^>]*>\s*$/g, '')).player.equipment.items;

const { db } = await loadDb();
const byId = new Map(db.items.map((i) => [i.id, i]));
const zone = (id) => db.zones.find((z) => z.id === id)?.name;
const npc = (id) => db.npcs.find((n) => n.id === id);

function source(it) {
  const out = [];
  const notes = [];
  for (const s of it.sources ?? []) {
    if (s.quest) out.push(`Quest: ${s.quest.name}`);
    else if (s.crafted) out.push('Crafted (profession ' + s.crafted.profession + ')');
    else if (s.drop) {
      const n = npc(s.drop.npcId);
      const z = zone(s.drop.zoneId ?? n?.zoneId);
      out.push(`${n?.name ?? s.drop.otherName ?? 'Drop'}${z ? ` (${z})` : ''}`);
      if (NOT_AT_LAUNCH_ZONES.has(s.drop.zoneId ?? n?.zoneId)) notes.push('zone not in at launch');
    } else if (s.soldBy) out.push(`Vendor (${zone(s.soldBy.zoneId) ?? s.soldBy.npcName})`);
    else if (s.rep) out.push('Reputation reward');
  }
  const uniq = [...new Set(out)];
  return { text: uniq.length ? uniq.join(' / ') : '—', notes: uniq.length ? notes : ['no source recorded'] };
}

function enchant(slotItem, effectId) {
  const cands = db.enchants.filter(
    (e) => e.effectId === effectId && (e.type === slotItem.type || (e.extraTypes ?? []).includes(slotItem.type)),
  );
  const bySpell = [...new Map(cands.map((c) => [c.spellId, c])).values()];
  return bySpell;
}

SLOTS.forEach((slot, i) => {
  const e = items[i];
  if (!e?.id) return;
  const it = byId.get(e.id);
  if (!it) {
    console.log(`    // ${slot}: item ${e.id} is not in the Forever database`);
    return;
  }
  const src = source(it);
  const notes = [...src.notes];
  let ench = '';
  if (e.enchant) {
    const c = enchant(it, e.enchant);
    if (!c.length) notes.push(`enchant ${e.enchant}: no spell found`);
    else {
      if (c.length > 1) notes.push(`enchant ${e.enchant}: pick one of ${c.map((x) => `${x.spellId} ${x.name}`).join(' | ')}`);
      ench = `, enchant: '${c[0].name}', enchantSpellId: ${c[0].spellId}`;
    }
  }
  const q = QUALITY[it.quality] ?? 'common';
  console.log(
    `    { slot: '${slot}', itemId: ${it.id}, name: ${JSON.stringify(it.name)}, quality: '${q}', source: ${JSON.stringify(src.text)}${ench} },${notes.length ? ` // ${notes.join('; ')}` : ''}`,
  );
});
