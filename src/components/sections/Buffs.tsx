import { buffGroups } from '../../content/content';
import { useCompendium } from '../../state/CompendiumProvider';
import { Droplet } from '../ui/Droplet';
import { SectionHeading } from '../ui/SectionHeading';
import { useTooltip } from '../ui/Tooltip';

export function Buffs() {
  const { sweaty } = useCompendium();
  const { bind } = useTooltip();

  return (
    <section id="buffs" aria-label="Buffs and debuffs">
      <SectionHeading id="buffs" />

      <div className="grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,248px),1fr))]">
        {buffGroups.map((g) => {
          const items = g.items.filter((i) => sweaty || !i.s);
          return (
            <article key={g.label} className="panel p-[18px]">
              <div className="flex items-baseline justify-between gap-[10px]">
                <h3 className="t-card-sub text-ink">{g.label}</h3>
                <span className="t-num text-[11px] text-faint">{items.length}</span>
              </div>
              <p className="mt-[6px] text-[11.5px] leading-[1.5] text-faint">{g.note}</p>

              <ul className="mt-[12px] flex flex-col gap-[7px]">
                {items.map((i) => (
                  <li key={i.n} className="flex items-baseline gap-[8px]">
                    <span
                      className="cursor-help text-[12.5px] text-prose transition-colors hover:text-accent focus-visible:text-accent"
                      {...bind({ name: i.n, kind: g.label, note: '' })}
                    >
                      {i.n}
                    </span>
                    {i.s && sweaty && <Droplet size={7} />}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
