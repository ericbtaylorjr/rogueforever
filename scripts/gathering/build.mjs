#!/usr/bin/env node
/**
 * Rebuilds src/content/gathering.json (the Gathering Reference in Tools & UI) from a gathering
 * export: per-zone Mining, Herbalism and Skinning requirements and skill-up limits.
 *
 *   npm run gathering -- path/to/gathering.json
 *
 * Keeps only what the tool shows, per zone and profession (null when the zone has none):
 *   min / max   lowest and highest skill any node (or skinnable creature) needs
 *   common      highest skill among the common nodes (max includes sparse and rare ones)
 *   levelsTo    the highest skill the zone reliably raises you to (export: maxSkillLevelable)
 *   lastSkillUp the highest skill at which the zone can still give a skill-up (maxSkillLevelableAbsolute)
 * Zones are listed by name; the tool sorts them for the professions picked.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const src = process.argv[2];
if (!src) {
  console.error('Usage: npm run gathering -- <gathering.json>');
  process.exit(1);
}
const data = JSON.parse(readFileSync(src, 'utf8'));
if (data.schemaVersion !== 1) console.warn(`! Export schemaVersion is ${data.schemaVersion}, this script reads 1. Check the fields below.`);

const trim = (p) =>
  p?.minRequiredSkill == null
    ? null
    : {
        min: p.minRequiredSkill,
        max: p.maxRequiredSkill,
        common: p.maxRequiredSkillCommon ?? p.maxRequiredSkill,
        levelsTo: p.maxSkillLevelable,
        lastSkillUp: p.maxSkillLevelableAbsolute,
      };

const zones = data.zones
  .map((z) => ({ id: z.id, name: z.name, mining: trim(z.mining), herbalism: trim(z.herbalism), skinning: trim(z.skinning) }))
  .sort((a, b) => a.name.localeCompare(b.name));

for (const z of zones) {
  const bad = ['mining', 'herbalism', 'skinning'].filter((k) => z[k] && [z[k].max, z[k].levelsTo, z[k].lastSkillUp].some((v) => typeof v !== 'number'));
  if (bad.length) throw new Error(`${z.name}: missing numbers for ${bad.join(', ')}`);
}
writeFileSync(new URL('../../src/content/gathering.json', import.meta.url), `${JSON.stringify({ generated: data.generatedOn, zones }, null, 1)}\n`);

const none = zones.flatMap((z) => ['mining', 'herbalism', 'skinning'].filter((k) => !z[k]).map((k) => `${z.name} ${k}`));
console.log(`${zones.length} zones from the export generated on ${data.generatedOn}.`);
if (none.length) console.log(`No data for: ${none.join('; ')}`);
