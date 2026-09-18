import { consumableCatCount, consumableCats, consumables } from '../../content/content';
import { consumablesCopy as copy } from '../../content/copy';
import { dotFor } from '../../content/palette';
import { useCompendium } from '../../state/CompendiumProvider';
import { Callout } from '../ui/Callout';
import { Droplet } from '../ui/Droplet';
import { FilterPill } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';
import { useTooltip } from '../ui/Tooltip';

export function Consumables() {
  const { consumeFilter, setConsumeFilter, sweaty } = useCompendium();
  const { bind } = useTooltip();

  const shown = consumables.filter(
    (c) => (consumeFilter === 'All' || c.k === consumeFilter) && (sweaty || !c.s),
  );

  return (
    <section id="consumables" aria-label="Consumables">
      <SectionHeading id="consumables" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">
        {copy.intro}{' '}
        <strong className="font-semibold text-venom">{copy.sweatyNote.strong}</strong>
        {copy.sweatyNote.after}
      </p>

      <div className="mt-[16px]">
        <Callout tone="accent" dashed label={copy.todoLabel}>
          {copy.todo.before}
          <strong className="font-semibold text-accent">{copy.todo.strong}</strong>
          {copy.todo.after}
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
            className="flex items-baseline gap-[9px] py-[6px]"
            style={{ breakInside: 'avoid' }}
          >
            <span
              aria-hidden="true"
              className="mt-[6px] size-[4px] shrink-0 rounded-full"
              style={{ background: dotFor(c.k) }}
            />
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
