/**
 * Turns a Wowhead tooltip (nether.wowhead.com/forever/tooltip/item/<id>) into the
 * fields the gear research needs. Wowhead's tooltip HTML marks most values with
 * comments (<!--stat3-->+5 Agility, <!--rlvl-->29, <!--scstart2:15-->…); the rest
 * (hit, crit, procs) is read from the "Equip:" text.
 *
 * If Wowhead changes its markup, `unparsed` on each item collects equip lines this
 * doesn't understand; rank.mjs lists them so new stats get noticed.
 */

/** Tooltip slot label → the slot names the site uses (content.json gearSlots). */
export const SLOTS = {
  Head: 'Head', Neck: 'Neck', Shoulder: 'Shoulders', Back: 'Back', Chest: 'Chest',
  Wrist: 'Wrists', Hands: 'Hands', Waist: 'Waist', Legs: 'Legs', Feet: 'Feet',
  Finger: 'Ring', Trinket: 'Trinket',
  'Main Hand': 'Main hand', 'One-Hand': 'One-hand', 'Off Hand': 'Off hand',
  Ranged: 'Ranged', Thrown: 'Ranged',
};

/** Weapon subclass → name, for the ones a Rogue can use (Forever adds one-handed axes). */
export const WEAPON_TYPES = {
  0: 'Axe', 4: 'Mace', 7: 'Sword', 13: 'Fist Weapon', 15: 'Dagger',
  2: 'Bow', 3: 'Gun', 18: 'Crossbow', 16: 'Thrown',
};
/** Armor subclass → name: -2 ring, -3 neck, -4 trinket, 0 other misc, 1 cloth, 2 leather. */
export const ARMOR_TYPES = { '-2': 'Ring', '-3': 'Neck', '-4': 'Trinket', 0: 'Misc', 1: 'Cloth', 2: 'Leather' };

/** Percent → rating, as Wowhead's XML reports the same items (Mask of the Unforgiven: 2% hit = 20, 1% crit = 14). */
const HIT_RATING_PER_PCT = 10;
const CRIT_RATING_PER_PCT = 14;

const STAT_IDS = { 3: 'agi', 4: 'str', 5: 'int', 6: 'spi', 7: 'sta' };
const RATING_IDS = { 38: 'ap', 12: 'def' };

const num = (s) => (s == null ? undefined : Number(s));
const text = (html) => html.replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();

export function parseTooltip({ name, quality, tooltip: t }) {
  const sc = t.match(/<!--scstart(\d+):(-?\d+)-->/);
  const slotLabel = t.match(/<table width="100%"><tr><td>([^<]+)<\/td>/)?.[1];
  const stats = {};
  for (const [, id, v] of t.matchAll(/<!--stat(\d+)-->([+-]?\d+)/g)) {
    const k = STAT_IDS[id];
    if (k) stats[k] = (stats[k] ?? 0) + Number(v);
  }
  for (const [, id, v] of t.matchAll(/<!--rtg(\d+)-->(\d+)/g)) {
    const k = RATING_IDS[id] ?? `rtg${id}`;
    stats[k] = (stats[k] ?? 0) + Number(v);
  }

  // Equip / chance-on-hit / use lines, as plain text.
  const effects = [...t.matchAll(/((?:Equip|Chance on hit|Use): .*?)<\/span>/g)].map((m) => text(m[1]));
  const procs = [];
  const unparsed = [];
  for (const line of effects) {
    let m;
    if ((m = line.match(/chance to hit by ([\d.]+)%/))) stats.hit = (stats.hit ?? 0) + Number(m[1]) * HIT_RATING_PER_PCT;
    else if ((m = line.match(/critical strike by ([\d.]+)%/)))
      stats.crit = (stats.crit ?? 0) + Number(m[1]) * CRIT_RATING_PER_PCT;
    else if (/^Equip: \+\d+ Attack Power\.$/.test(line)) continue; // counted from <!--rtg38-->
    else if ((m = line.match(/^Equip: Increased (Daggers|Swords|Maces|Axes|Fist Weapons) \+(\d+)/)))
      stats.skill = { type: m[1], value: Number(m[2]) };
    else if (line.startsWith('Chance on hit:') || line.startsWith('Use:')) procs.push(line);
    else if (!/Defense|Resistance|when fighting|Spell|spells|mana|Mana|Healing|healing|Dodge|Block|Parry/.test(line))
      unparsed.push(line);
  }

  const dmg = t.match(/<!--dmg-->(\d+) - (\d+) Damage/);
  const weapon = dmg
    ? { min: Number(dmg[1]), max: Number(dmg[2]), speed: num(t.match(/<!--spd-->([\d.]+)/)?.[1]), dps: num(t.match(/\(([\d.]+) damage per second\)/)?.[1]) }
    : undefined;

  return {
    name,
    quality,
    ilvl: num(t.match(/<!--ilvl-->(\d+)/)?.[1]),
    reqlevel: num(t.match(/Requires Level <!--rlvl-->(\d+)/)?.[1]),
    slotLabel,
    slot: SLOTS[slotLabel],
    cls: sc ? Number(sc[1]) : slotLabel === 'Back' ? 4 : undefined,
    sub: sc ? Number(sc[2]) : slotLabel === 'Back' ? 1 : undefined,
    armor: num(t.match(/<!--amr-->(\d+) Armor/)?.[1]),
    stats,
    weapon,
    bind: t.includes('Binds when equipped') ? 'BoE' : t.includes('Binds when picked up') ? 'BoP' : undefined,
    unique: /Unique/.test(t),
    random: /Random enchantment|Random Enchantment/.test(t),
    classes: t.match(/Classes: (.*?)<\/div>/)?.[1] ? text(t.match(/Classes: (.*?)<\/div>/)[1]) : undefined,
    set: t.match(/item-set=(\d+)/)?.[1],
    procs,
    unparsed,
  };
}

/** Recipes (they carry the crafted item's tooltip) and Blizzard's internal test items. */
export const isJunkName = (name) =>
  /^(Pattern|Plans|Schematic|Formula|Recipe|Manual|Design):|\bTest(ing)?\b|^Monster -|^\d+ (Epic|Rare|Green)|\[PH\]|^zz|Deprecated|^OLD/i.test(name);

/** Why an item is no use to a leveling Rogue, or null when it is. */
export function rejectReason(item) {
  if (isJunkName(item.name)) return 'junk';
  if ((item.quality ?? 0) < 2) return 'quality';
  if (!item.slot) return `slot ${item.slotLabel ?? '?'}`;
  if (item.cls === 2 && !(item.sub in WEAPON_TYPES)) return 'weapon type';
  if (item.cls === 4 && !(String(item.sub) in ARMOR_TYPES)) return 'armor type';
  if (item.cls !== 2 && item.cls !== 4 && !['Neck', 'Ring', 'Trinket', 'Back'].includes(item.slot)) return 'not gear';
  if (item.classes && !item.classes.includes('Rogue')) return 'class';
  if ((item.reqlevel ?? 0) > 60) return 'level';
  return null;
}
