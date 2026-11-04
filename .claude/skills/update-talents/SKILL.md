---
name: update-talents
description: Update a build's talents from a Wowhead Forever talent calculator link. Use when the user gives a new talent link for a build, or says to update its talents.
---

# Update a build's talents

A build's talents are its calculator `link` in `src/content/builds/<spec>.ts`, plus `talents`
(the point split) and a rotation and summary that match what the talents unlock.

## Steps

1. **Link.** Replace the build's `link` with the user's URL exactly as given, **including the
   learning order** (the part after `_t5/` or `_t0/`). The Talents card lists the order for
   leveling builds. Only drop the order when the user's link has none (for example, a link
   rebuilt from a screenshot): then end the link at `_t5`/`_t0` and say so. Never copy the
   order from the old link.
2. **Points.** `talents: points(a, c, s)` is the link's split, derived, not typed: run
   `npm run talents -- --fix` and it rewrites the numbers from the link (plain `--check` fails
   on a mismatch; it prints the split as `a/c/s` next to each link, dropping a zero tree).
   The check also fails when the order doesn't end on the link's ranks.
3. **Rotation.** Talents decide which APL rows the build can fire. Follow the `apl-rotation`
   skill for this build: `npm run apl -- <spec>/<build-id>` (and `--race` runs), compare with
   the build's `rotation`, and fix the opener, steps and tips (Cold Blood, Ghostly Strike,
   Premeditation, Preparation, Blade Flurry, Venom...). Builds that share a rotation constant
   share the result, so check siblings that use the same constant. When the rows don't
   change, say so. For a **leveling** build, wrap the rotation in `forLeveling` (`apl-rotation`
   step 2): no opener (leveling builds never have one), no racial or Thistle Tea tips, and one
   combined "Pair your trinkets and racial with <cooldowns> on a powerful mob or big pull." tip. Never
   the Vanish into Garrote/Ambush tip: leveling builds say "Use Vanish and Evasion as defensive
   abilities if threat becomes an issue." instead. If the build now
   resolves to a different rotation, use that endgame constant's leveling version, or add one.
4. **Riposte.** If the new link takes Riposte (Combat tree, row 3, rank 1; `v2…-<combat digits>`
   has a `1` in the 8th place of the Combat digits), wrap the build's rotation in
   `withRiposte(rotation, '<builder>')` from `shared.ts`: Mutilate, Sinister Strike, Hemorrhage
   (Subtlety Hemo and Questing) or Backstab. It adds the Pro tip "Macro Riposte with <builder>
   so it fires whenever it's available after a parry." before the pooling tip. If the new link
   drops Riposte, remove the wrapper. Check this on every talent update; as of now Assassination
   Questing and Dungeons, Combat Questing and Subtlety Questing take it.
5. **Summary.** Refresh `talentNote` (see `apl-rotation` step 5) so it names the same spells
   as the rotation. If the talents changed the build's character (new builder, new bleed),
   rewrite the damage profile too.
6. `npm run talents -- --check` and `npm run typecheck`. Don't commit unless asked.

## Report

Tell the user: points split, which talents moved if it's easy to tell, and what changed in
the rotation and summary (or that they didn't). If a screenshot is the source instead of a
link, build the link as `v2<digits>` (see `src/lib/talentCalc.ts`), mention that no order
was included, and flag any spell the rotation uses that the new talents drop.
