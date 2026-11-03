---
name: update-gathering
description: Update the Gathering Reference Tool (Tools & UI) from a gathering export JSON (per-zone Mining, Herbalism and Skinning requirements and skill-up limits). Use when the user gives a new gathering.json or says to refresh the gathering data.
---

# Update the Gathering Reference Tool

The modal in Tools & UI (`src/components/sections/Gathering.tsx`) reads `src/content/gathering.json`,
which is generated. Never edit it by hand.

## Input

A `gathering.json` export (`schemaVersion` 1): per zone, `mining`, `herbalism` and `skinning` objects with
`minRequiredSkill`, `maxRequiredSkill`, `maxRequiredSkillCommon`, `maxSkillLevelable` (reliable skill-up
limit) and `maxSkillLevelableAbsolute` (last possible skill-up). A profession with no data has nulls. The user
keeps it at `~/Downloads/gathering.json`; from WSL that is `/mnt/c/Users/<name>/Downloads/`.

## Steps

1. `npm run gathering -- <path-to-json>`. It writes `gathering.json` and prints the zone count and any zone and
   profession with no data (Felwood has no mapped nodes, for example). If it warns about `schemaVersion` or throws
   about missing numbers, read the export's `meta` before changing the script.
2. `npm run typecheck` and `npm run build`.
3. Check the modal (`npx vite preview --port 4173 --strictPort &`, Tools & UI, "View Gathering Reference Tool"):
   pick two professions, check the zone list is sorted by the higher profession's maximum and the cards match
   the export for a few zones. Check dark, light and a 390px phone.
4. Don't commit unless asked.

## What the tool shows

- **Minimum / Maximum skill**: `minRequiredSkill` and `maxRequiredSkill` (the best node, rare ones included).
  When `maxRequiredSkillCommon` is lower, the hint says most nodes need up to that.
- **Reliable limit**: `maxSkillLevelable`; **last skill-up**: `maxSkillLevelableAbsolute`. The export says both are
  estimates (+50 and +100 above the best common node's requirement), and the modal says so too. If the user
  verifies the real thresholds, regenerate the export and update `estimateNote` in `copy.ts`.
- **Skinning** comes from the skinnable creatures in the zone's level band; the note on its card says so.
- Zone list: only zones with data for a picked profession, sorted by the higher of the picked professions' maximums.

## Report

Tell the user the export's `generatedOn`, the zone count, and which zones lack data for which profession.
