import { gearSlots } from '../../content/content';
import { gear as copy } from '../../content/copy';
import { itemForSlot, qualityColor, wowheadUrl } from '../../content/gear';
import { links } from '../../content/links';
import type { GearSetId } from '../../content/types';
import { useCompendium } from '../../state/CompendiumProvider';
import { Callout } from '../ui/Callout';
import { SegmentedTabs } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';
import { useTooltip } from '../ui/Tooltip';

const GRID = '104px minmax(0,1.5fr) minmax(0,1fr) 84px';

/** Diagonal-hatch stand-in until item icons are sourced. See README > Assets. */
function IconPlaceholder() {
  return (
    <span
      aria-hidden="true"
      className="size-[22px] shrink-0 rounded-[4px] border border-line"
      style={{
        background:
          'repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 2px, transparent 2px 6px)',
      }}
    />
  );
}

function GearRow({ slot, set }: { slot: string; set: GearSetId }) {
  const item = itemForSlot(set, slot);
  const { bind } = useTooltip();

  return (
    <div
      className="grid items-center border-t border-line px-[14px] py-[11px]"
      style={{ gridTemplateColumns: GRID }}
    >
      <span className="t-eyebrow text-[10px] tracking-[.12em] text-faint">{slot}</span>

      {item ? (
        <a
          href={wowheadUrl(item.itemId)}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-[10px] text-[13px] font-semibold"
          style={{ color: qualityColor[item.quality] }}
          {...bind({ name: item.name, kind: slot, note: item.source })}
        >
          <IconPlaceholder />
          <span className="truncate">{item.name}</span>
        </a>
      ) : (
        <span className="flex min-w-0 items-center gap-[10px]">
          <IconPlaceholder />
          <span className="truncate text-[12.5px] italic text-dim">{copy.empty}</span>
        </span>
      )}

      <span className="truncate text-[12px] text-faint">{item?.source ?? '—'}</span>
      <span className="truncate text-[12px] text-faint">{item?.enchant ?? '—'}</span>
    </div>
  );
}

export function Gear() {
  const { gearSet, setGearSet } = useCompendium();

  return (
    <section id="gear" aria-label="Gear">
      <SectionHeading id="gear" />

      <div className="flex flex-wrap items-center gap-[12px]">
        <SegmentedTabs
          tabs={copy.tabs as unknown as { id: string; label: string }[]}
          value={gearSet}
          onChange={(id) => setGearSet(id as GearSetId)}
          label="Gear list"
        />
        <a
          href={links.wowsims}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
        >
          {copy.simsLink}
        </a>
      </div>

      <div className="mt-[16px]">
        <Callout tone="accent" dashed label={copy.todoLabel}>
          {copy.todo.before}
          <strong className="font-semibold text-accent">{copy.todo.strong}</strong>
          {copy.todo.after}
        </Callout>
      </div>

      <div
        id={`panel-${gearSet}`}
        role="tabpanel"
        aria-labelledby={`tab-${gearSet}`}
        className="table-scroll panel mt-[16px]"
      >
        <div style={{ minWidth: 600 }}>
          <div
            className="grid items-center px-[14px] py-[10px]"
            style={{ gridTemplateColumns: GRID }}
          >
            {[copy.cols.slot, copy.cols.item, copy.cols.source, copy.cols.enchant].map((c) => (
              <span key={c} className="t-eyebrow text-[9px] tracking-[.14em] text-faint">
                {c}
              </span>
            ))}
          </div>
          {gearSlots.map((slot) => (
            <GearRow key={slot} slot={slot} set={gearSet} />
          ))}
        </div>
      </div>
    </section>
  );
}
