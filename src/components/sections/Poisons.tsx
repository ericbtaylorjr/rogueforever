import { poisons } from '../../content/content';
import { poisonsCopy as copy } from '../../content/copy';
import type { Poison } from '../../content/types';
import { useTheme } from '../../state/ThemeProvider';
import { GameIcon, wowheadFor } from '../ui/GameIcon';
import { SectionHeading } from '../ui/SectionHeading';

/** How much each poison matters, said plainly rather than as a badge. */
const tagTone: Record<Poison['tag'], string> = {
  Core: 'var(--accent)',
  Situational: 'var(--amber)',
  Utility: 'var(--faint)',
};

/** One row of the rack: icon, name and where it goes, then what it's for. */
function PoisonRow({ p }: { p: Poison }) {
  const { tone } = useTheme();
  const href = wowheadFor(p.name);
  return (
    <li className="grid gap-x-[18px] gap-y-[6px] border-t border-line px-[18px] py-[14px] first:border-0 stack:grid-cols-[minmax(0,240px)_minmax(0,1fr)_72px] stack:items-center">
      <div className="flex items-center gap-[12px]">
        <GameIcon name={p.name} size={34} />
        <div className="min-w-0">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="t-card-sub text-ink decoration-line underline-offset-[3px] hover:underline"
            >
              {p.name}
            </a>
          ) : (
            <span className="t-card-sub text-ink">{p.name}</span>
          )}
          <div className="mt-[2px] text-[12px]" style={{ color: tone(p.hue) }}>
            {p.where}
          </div>
        </div>
      </div>
      <p className="text-[13px] leading-[1.55] text-prose">{p.note}</p>
      <span className="text-[12px] font-semibold stack:text-right" style={{ color: tagTone[p.tag] }}>
        {p.tag}
      </span>
    </li>
  );
}

export function Poisons() {
  return (
    <section id="poisons" aria-label="Poisons">
      <SectionHeading id="poisons" scope="all" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{copy.intro}</p>

      <ul className="panel mt-[18px] overflow-hidden">
        {poisons.map((p) => (
          <PoisonRow key={p.name} p={p} />
        ))}
      </ul>

      <div className="mt-[16px] max-w-[88ch] border-l-2 border-sky pl-[14px]">
        <h3 className="text-[13px] font-semibold text-sky">{copy.foreverTitle}</h3>
        <ul className="mt-[6px] flex flex-col gap-[6px]">
          {copy.forever.map((f) => (
            <li key={f.strong} className="text-[13px] leading-[1.6] text-prose">
              {f.before}
              <strong className="font-semibold text-ink">{f.strong}</strong>
              {f.after}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
