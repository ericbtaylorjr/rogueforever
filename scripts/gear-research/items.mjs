/**
 * Turns the Forever database into the candidates rank.mjs scores (see README.md here):
 * what a Rogue can wear, its stats, where each faction can get it, and the level to show.
 *
 * Everything here is judgment about *availability*, so it all reads from curation.json
 * and the database, never from a hardcoded list.
 */
import { STAT_IDS, RANGED_AP_ID } from './weights.mjs';

export const SLOT_BY_TYPE = { 1: 'Head', 2: 'Neck', 3: 'Shoulders', 4: 'Back', 5: 'Chest', 6: 'Wrists', 7: 'Hands', 8: 'Waist', 9: 'Legs', 10: 'Feet', 11: 'Ring', 12: 'Trinket' };
/** Slots that need leather or cloth (the rest take anything). */
const ARMOR_TYPED = new Set([1, 3, 5, 6, 7, 8, 9, 10]);
/** One-handed melee weapon types a Rogue can use: Axe, Dagger, Fist, Mace, Sword. */
export const WEAPON_TYPE = { 1: 'Axe', 2: 'Dagger', 3: 'Fist Weapon', 4: 'Mace', 9: 'Sword' };
/** Bow, Crossbow, Gun, Thrown. */
const RANGED_TYPE = { 1: 'Bow', 2: 'Crossbow', 3: 'Gun', 4: 'Thrown' };
export const QUALITY = ['poor', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
const PROFESSION = { 1: 'Alchemy', 2: 'Blacksmithing', 3: 'Enchanting', 4: 'Engineering', 8: 'Leatherworking', 11: 'Tailoring' };
const REP_LEVEL = ['', 'Hated', 'Hostile', 'Unfriendly', 'Neutral', 'Friendly', 'Honored', 'Revered', 'Exalted'];
const FACTIONS = ['Alliance', 'Horde'];
/** Best source first. */
const PRIORITY = ['quest', 'dungeon', 'crafted', 'vendor', 'rep', 'world'];

const STAT_KEY = Object.fromEntries(Object.entries(STAT_IDS).map(([k, id]) => [id, k]));
const JUNK_NAME = /\b(test|deprecated|unused|placeholder|obsolete|dnt|zzold)\b|^\[|^monster -|\(old\)|\bPH\b/i;

/** Stats a Rogue actually wants; a green counts toward the baseline only if it has one (caster greens would drag it down). */
export const ROGUE_STATS = ['agi', 'str', 'ap', 'hit', 'crit', 'haste', 'exp'];

/** Database stat map (id → value) to short keys. */
function shortStats(map, scale = 1) {
  const out = {};
  for (const [id, v] of Object.entries(map ?? {})) {
    const key = STAT_KEY[id] ?? (Number(id) === RANGED_AP_ID ? 'rap' : undefined);
    if (key) out[key] = (out[key] ?? 0) + v * scale;
  }
  return out;
}

/** Recipe lookups pending or done for one crafted spell: 'ok' | 'unknown' | 'bad' | 'pending' | 'trainer'. */
function recipeStatus(spellId, ctx) {
  const ids = ctx.recipes[spellId] ?? [];
  if (!ids.length) return { status: 'trainer' };
  const per = ids.map((rid) => {
    const r = ctx.lookups.recipes?.[rid];
    if (!r) return { rid, status: 'pending' };
    if (!r.codes?.length) return { rid, status: 'unknown' };
    // Where the recipe comes from: a drop or vendor in a zone that isn't open yet doesn't count.
    const usable = r.codes.some((c, k) => [1, 2, 4, 5].includes(c) && !((c === 2 || c === 5) && ctx.notAtLaunch.has(r.more[k]?.z)));
    return { rid, status: usable ? 'ok' : 'bad' };
  });
  if (per.some((p) => p.status === 'ok')) return { status: 'ok' };
  if (per.some((p) => p.status === 'pending')) return { status: 'pending', ids: per.filter((p) => p.status === 'pending').map((p) => p.rid) };
  if (per.some((p) => p.status === 'unknown')) return { status: 'unknown' };
  return { status: 'bad' };
}

/**
 * Every way to get an item, as offers `{ kind, text, factions }`, plus the reasons some were
 * dropped (for the "kept out" report). Which kinds count as chaseable: quests, dungeon drops,
 * crafted (with a recipe players can get), vendors and reputation rewards players can reach.
 * Raids, PvP, world drops and rare spawns are out unless curation.json `allow` lets one in.
 */
function offersOf(item, ctx) {
  const { db, curation } = ctx;
  const offers = [];
  const dropped = [];
  const sources = item.sources ?? [];
  const hasRep = sources.some((s) => s.rep);
  const zoneName = (id) => curation.dungeonInZone?.[id] ?? ctx.zones.get(id)?.name ?? `Zone ${id}`;
  const sideOf = (f) => (f === 1 ? ['Alliance'] : f === 2 ? ['Horde'] : FACTIONS);
  const isPvpRep = (name) => (curation.excludeReps ?? []).some((n) => n.toLowerCase() === String(name).toLowerCase());
  let needsVendorLookup = false;
  let pendingRecipes = [];
  let recipeUnknown = false;

  if (sources.some((s) => s.pvp) && !ctx.allowed.has(item.id)) dropped.push('PvP gear');
  else
    for (const s of sources) {
      if (s.quest) {
        offers.push({ kind: 'quest', text: `Quest: ${s.quest.name}`, factions: curation.questSide?.[s.quest.id] ? [curation.questSide[s.quest.id]] : sideOf(s.quest.faction), questId: s.quest.id, sideKnown: s.quest.faction != null || curation.questSide?.[s.quest.id] != null });
      } else if (s.drop) {
        const d = s.drop;
        const zone = zoneName(d.zoneId);
        const who = ctx.npcs.get(d.npcId)?.name ?? d.otherName ?? d.category;
        if (d.difficulty === 2) dropped.push(`Raid: ${zone}`);
        else if (curation.notAtLaunch?.zones?.includes(d.zoneId)) dropped.push(`Not at launch: ${zone}`);
        else if (d.difficulty === 1) {
          const only = curation.cityDungeons?.[d.zoneId];
          offers.push({ kind: 'dungeon', text: who ? `${zone} (${who})` : zone, factions: only ? [only] : FACTIONS });
        } else offers.push({ kind: 'world', text: `${who ?? 'World drop'}, ${zone}`, factions: FACTIONS });
      } else if (s.crafted) {
        const r = recipeStatus(s.crafted.spellId, ctx);
        const text = PROFESSION[s.crafted.profession] ?? 'Crafted';
        if (r.status === 'bad') dropped.push(`Not at launch: ${text} recipe`);
        else {
          if (r.status === 'pending') pendingRecipes = pendingRecipes.concat(r.ids);
          if (r.status === 'unknown') recipeUnknown = true;
          offers.push({ kind: 'crafted', text, factions: FACTIONS, recipe: r.status });
        }
      } else if (s.soldBy && !hasRep) {
        const v = s.soldBy;
        if (ctx.pvpVendors.has(v.npcId) && !ctx.allowed.has(item.id)) dropped.push(`PvP vendor: ${v.npcName}`);
        else if (curation.notAtLaunch?.zones?.includes(v.zoneId)) dropped.push(`Not at launch: vendor in ${zoneName(v.zoneId)}`);
        else {
          // The database doesn't record the reputation a vendor item needs; Wowhead's tooltip does (lookups.mjs).
          const req = ctx.lookups.vendors?.[item.id];
          if (req && isPvpRep(req.faction)) dropped.push(`PvP reputation: ${req.faction}`);
          else if (req && req.level > (curation.maxRepLevel ?? 6)) dropped.push(`${req.faction} reputation too high (${req.standing})`);
          else {
            if (ctx.lookups.vendors?.[item.id] === undefined) needsVendorLookup = true;
            offers.push({ kind: 'vendor', text: `Vendor: ${v.npcName}${v.zoneId ? `, ${zoneName(v.zoneId)}` : ''}${req ? ` (${req.faction} - ${req.standing})` : ''}`, factions: sideOf(v.faction) });
          }
        }
      } else if (s.rep) {
        const r = s.rep;
        const name = ctx.repFactions.get(r.repFactionId)?.name ?? `Faction ${r.repFactionId}`;
        if (isPvpRep(name)) dropped.push(`PvP reputation: ${name}`);
        else if (curation.notAtLaunch?.reps?.includes(r.repFactionId)) dropped.push(`Not at launch: ${name} reputation`);
        else if ((r.repLevel ?? 0) > (curation.maxRepLevel ?? 6)) dropped.push(`${name} reputation too high (${REP_LEVEL[r.repLevel]})`);
        else offers.push({ kind: 'rep', text: `${name} (${REP_LEVEL[r.repLevel] ?? '?'})`, factions: sideOf(r.factionId) });
      }
    }
  // Content the item itself is restricted to one side for.
  const only = item.factionRestriction === 1 ? ['Alliance'] : item.factionRestriction === 2 ? ['Horde'] : null;
  const usable = offers
    .map((o) => ({ ...o, factions: only ? o.factions.filter((f) => only.includes(f)) : o.factions }))
    .filter((o) => o.factions.length && (o.kind !== 'world' || ctx.allowed.has(item.id)));
  const avail = {};
  for (const f of FACTIONS) {
    avail[f] = usable.filter((o) => o.factions.includes(f)).sort((a, b) => PRIORITY.indexOf(a.kind) - PRIORITY.indexOf(b.kind))[0] ?? null;
  }
  const unchaseable = offers.filter((o) => o.kind === 'world' && !ctx.allowed.has(item.id));
  if (!usable.length && unchaseable.length) dropped.push(`World drop (${unchaseable[0].text})`);
  return { avail, dropped, pendingRecipes, recipeUnknown, needsVendorLookup, hasSource: sources.length > 0 };
}

/** Build the list of candidates the research scores. */
export function buildCandidates({ db, curation, recipes, lookups }) {
  const ctx = {
    db,
    curation,
    recipes,
    lookups,
    zones: new Map(db.zones.map((z) => [z.id, z])),
    npcs: new Map(db.npcs.map((n) => [n.id, n])),
    repFactions: new Map(db.factions.map((f) => [f.id, f])),
    notAtLaunch: new Set(curation.notAtLaunch?.zones ?? []),
    allowed: new Set(curation.allow ?? []),
    // A vendor who sells any PvP-flagged item is a battleground quartermaster: none of their stock is leveling gear.
    pvpVendors: new Set(db.items.filter((i) => i.sources?.some((s) => s.pvp)).flatMap((i) => (i.sources ?? []).filter((s) => s.soldBy).map((s) => s.soldBy.npcId))),
  };
  const excluded = new Set(curation.exclude.map((e) => e.id));
  const allowEpic = new Set(curation.allowEpic ?? []);
  const suffixes = new Map(db.randomSuffixes.map((s) => [s.id, s]));
  const out = [];
  const outsideDb = [];

  for (const it of db.items) {
    if (excluded.has(it.id) || it.quality < 2 || it.quality > 4 || JUNK_NAME.test(it.name)) continue;
    if (it.classAllowlist?.length && !it.classAllowlist.includes(4)) continue;
    const so = it.scalingOptions?.['0'];
    if (!so) continue;
    let slot, cls, wtype, hand;
    if (it.type in SLOT_BY_TYPE) {
      if (ARMOR_TYPED.has(it.type) && ![1, 2].includes(it.armorType)) continue;
      if (it.type === 4 && it.armorType > 2) continue;
      slot = SLOT_BY_TYPE[it.type];
      cls = 'armor';
    } else if (it.type === 13) {
      wtype = WEAPON_TYPE[it.weaponType];
      if (!wtype || ![1, 2, 3].includes(it.handType)) continue;
      slot = it.handType === 1 ? 'Main hand' : it.handType === 3 ? 'Off hand' : 'One-hand';
      cls = 'weapon';
    } else if (it.type === 14) {
      wtype = RANGED_TYPE[it.rangedWeaponType];
      if (!wtype) continue;
      slot = 'Ranged';
      cls = 'ranged';
    } else continue;

    const stats = shortStats(so.stats);
    const o = offersOf(it, ctx);
    const faction = !o.avail.Alliance && !o.avail.Horde ? null : o.avail.Alliance && o.avail.Horde ? 'Both' : o.avail.Alliance ? 'Alliance' : 'Horde';

    // Random-suffix items ("of the Tiger"): each option adds stats scaled by the item's rand-prop points.
    let suffixOptions;
    if (it.randomSuffixOptions?.length && so.randPropPoints) {
      suffixOptions = it.randomSuffixOptions
        .map((id) => suffixes.get(id))
        .filter(Boolean)
        .map((s) => ({ name: s.name, stats: Object.fromEntries(Object.entries(shortStats(Object.fromEntries(s.stats.map((v, i) => [i, v]).filter(([, v]) => v)))).map(([k, v]) => [k, Math.round((v * so.randPropPoints) / 10000)])) }));
    }

    // Level: the item's own requirement (the database, or what Wowhead lists for it). A quest's level is its
    // difficulty, usually a few above the level it can be accepted at, so it is only a fallback for an item
    // with no requirement. Last resort: item level − 4.
    const lk = lookups.items?.[it.id];
    const quest = [o.avail.Alliance, o.avail.Horde].find((x) => x?.kind === 'quest');
    const questLevel = quest ? lookups.quests?.[quest.questId]?.level : undefined;
    let level, levelFrom;
    if (curation.level?.[it.id]) (level = curation.level[it.id]), (levelFrom = 'curation');
    else {
      const parts = [
        [it.reqLvl, 'database'],
        [lk?.reqlevel, 'Wowhead item'],
      ].filter(([v]) => v);
      if (parts.length) [level, levelFrom] = parts[0];
      else if (questLevel) (level = questLevel), (levelFrom = 'Wowhead quest');
      else (level = Math.max(1, (so.ilvl ?? 5) - 4)), (levelFrom = 'item level');
    }
    // A quest's "Requires level" (verified by hand on Wowhead, curation.json questMinLevel) can be higher than the item's own requirement.
    const questMin = quest ? curation.questMinLevel?.[quest.questId] : undefined;
    if (questMin && questMin > level && !curation.level?.[it.id]) (level = questMin), (levelFrom = 'quest requirement');
    const needsLevelLookup = !it.reqLvl && !!quest && !lk && !curation.level?.[it.id];

    out.push({
      id: it.id,
      name: it.name,
      icon: it.icon,
      quality: it.quality,
      slot,
      cls,
      wtype,
      stats,
      suffixOptions,
      weapon: it.weaponSpeed ? { min: so.weaponDamageMin ?? 0, max: so.weaponDamageMax ?? 0, speed: it.weaponSpeed, dps: so.unroundedDps ?? 0 } : undefined,
      ilvl: so.ilvl,
      reqLvl: it.reqLvl,
      level,
      levelFrom,
      needsLevelLookup,
      faction,
      avail: o.avail,
      dropped: o.dropped,
      hasSource: o.hasSource,
      pendingRecipes: o.pendingRecipes,
      needsVendorLookup: o.needsVendorLookup,
      recipeUnknown: o.recipeUnknown,
      raw: it,
    });
    // Epics below 60 are mostly raid-era or post-launch rewards: blocked until curation.json allowEpic says otherwise.
    const last = out[out.length - 1];
    if (it.quality === 4 && !allowEpic.has(it.id) && (it.reqLvl ?? 0) < 60 && last.faction) {
      last.dropped.push(`Epic, not confirmed for launch (${(last.avail.Alliance ?? last.avail.Horde).text})`);
      last.avail = { Alliance: null, Horde: null };
      last.faction = null;
    }
  }
  return { items: out, ids: new Set(db.items.map((i) => i.id)), outsideDb };
}
