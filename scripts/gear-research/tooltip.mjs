/**
 * A tooltip for an item Wowhead doesn't list yet, in the same markup Wowhead's tooltip API
 * returns, so the Handbook shows it exactly like a linked item (src/lib/wowhead.ts sanitizes
 * it the same way). Built from the Forever database; only the lines the database can back.
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SLOT_LABEL = { Head: 'Head', Neck: 'Neck', Shoulders: 'Shoulder', Back: 'Back', Chest: 'Chest', Wrists: 'Wrist', Hands: 'Hands', Waist: 'Waist', Legs: 'Legs', Feet: 'Feet', Ring: 'Finger', Trinket: 'Trinket', 'Main hand': 'Main Hand', 'Off hand': 'Off Hand', 'One-hand': 'One-Hand', Ranged: 'Ranged' };
const ARMOR_LABEL = { 1: 'Cloth', 2: 'Leather' };
const PRIMARY = { 0: 'Strength', 1: 'Agility', 2: 'Stamina', 3: 'Intellect', 13: 'Spirit' };
/** Ratings per 1% at level 60 (the sim's own constants). */
const PCT = (rating, per) => `${(rating / per).toFixed(1)}%`;
const EQUIP = {
  14: (v) => `Equip: +${v} Attack Power.`,
  17: (v) => `Equip: Improves your chance to hit by ${PCT(v, 10)}.`,
  18: (v) => `Equip: Improves your chance to get a critical strike by ${PCT(v, 14)}.`,
  19: (v) => `Equip: Increases your melee haste by ${PCT(v, 10)}.`,
  21: (v) => `Equip: Increases your expertise by ${PCT(v, 10)}.`,
  20: (v) => `Equip: Your attacks ignore ${v} of your opponent's armor.`,
};

/** `item` is a candidate from items.mjs (its `raw` is the database record). */
export function buildTooltip(item) {
  const r = item.raw;
  const so = r.scalingOptions['0'];
  const stats = so.stats ?? {};
  const lines = [];
  lines.push(`<b class="q${r.quality}">${esc(r.name)}</b>`);
  if (so.ilvl) lines.push(`<span class="q"><br>Item Level ${so.ilvl}</span>`);
  const type = r.type === 13 || r.type === 14 ? item.wtype : ARMOR_LABEL[r.armorType] ?? '';
  lines.push(`<table width="100%"><tr><td>${SLOT_LABEL[item.slot] ?? item.slot}</td><th><span class="q1">${esc(type ?? '')}</span></th></tr></table>`);
  if (item.weapon) {
    lines.push(`<table width="100%"><tr><td><span>${item.weapon.min} - ${item.weapon.max} Damage</span></td><th>Speed ${item.weapon.speed.toFixed(2)}</th></tr></table>(${item.weapon.dps.toFixed(2)} damage per second)<br>`);
  }
  if (stats[27]) lines.push(`<span>${stats[27]} Armor</span><br>`);
  for (const [id, label] of Object.entries(PRIMARY)) if (stats[id]) lines.push(`<span>+${stats[id]} ${label}</span><br>`);
  if (item.suffixOptions?.length) lines.push(`<span class="q2">&lt;Random enchantment&gt;</span><br>`);
  const tail = [];
  if (item.level) tail.push(`Requires Level ${item.level}<br>`);
  for (const [id, fn] of Object.entries(EQUIP)) if (stats[id]) tail.push(`<span class="q2">${esc(fn(stats[id]))}</span><br>`);
  if (stats[12]) tail.push(`<span class="q2">+${stats[12]} Spell Penetration</span><br>`);
  for (const e of r.itemEffects ?? []) {
    const name = String(e.buffName ?? '').replace(/\s*\(\d+\)$/, '');
    if (!name) continue;
    if (e.onUse) tail.push(`<span class="q2">Use: ${esc(name)}</span><br>`);
    else if (e.proc) tail.push(`<span class="q2">Chance on hit: ${esc(name)}</span><br>`);
  }
  return `<table><tr><td>${lines.join('')}</td></tr></table><table><tr><td>${tail.join('').replace(/<br>$/, '')}</td></tr></table>`;
}
