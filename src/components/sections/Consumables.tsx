import { consumableCatCount, consumableCats, consumables } from '../../content/content';
import { consumablesCopy as copy } from '../../content/copy';
import { useHandbook } from '../../state/HandbookProvider';
import { Callout } from '../ui/Callout';
import { Droplet } from '../ui/Droplet';
import { FilterPill } from '../ui/Pill';
import { GameIcon } from '../ui/GameIcon';
import { SectionHeading } from '../ui/SectionHeading';
import { useTooltip } from '../ui/Tooltip';

export function Consumables() {
  const { consumeFilter, setConsumeFilter, sweaty } = useHandbook();
  const { bind } = useTooltip();

  const shown = consumables.filter(
    (c) => (consumeFilter === 'All' || c.k === consumeFilter) && (sweaty || !c.s),
  );

  return (
    <section id="consumables" aria-label="Consumables">
      <SectionHeading id="consumables" scope="all" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">
        {copy.intro}{' '}
        <strong className="font-semibold text-sweat">{copy.sweatyNote.strong}</strong>
        {copy.sweatyNote.after}
      </p>

      <div className="mt-[16px]">
        <Callout tone="accent" quiet label={copy.status.label}>
          {copy.status.text}
        </Callout>
      </div>

      <div
        role="group"
        aria-label="Filter consumables by category"
        className="mt-[18px] flex flex-wrap gap-[8px]"
      >
        {consumableCats.map((cat) => (
          <FilterPill
            key={cat}
            label={cat}
            count={consumableCatCount(cat, sweaty)}
            selected={consumeFilter === cat}
            onSelect={() => setConsumeFilter(cat)}
          />
        ))}
      </div>

      <p role="status" className="sr-only">
        {`Showing ${shown.length} consumable${shown.length === 1 ? '' : 's'}`}
      </p>

      <div className="mt-[18px]" style={{ columns: '232px', columnGap: 26 }}>
        {shown.map((c) => (
          <div
            key={c.n}
            className="flex items-center gap-[9px] py-[4px]"
            style={{ breakInside: 'avoid' }}
          >
            <GameIcon name={c.n} size={20} />
            <span
              className="cursor-help text-[13px] text-prose underline decoration-line underline-offset-[3px] transition-colors hover:text-accent focus-visible:text-accent"
              {...bind({ name: c.n, kind: c.s ? `${c.k} · sweaty` : c.k, note: c.note })}
            >
              {c.n}
            </span>
            {c.s && sweaty && <Droplet size={7} />}
          </div>
        ))}
      </div>
    </section>
  );
}
