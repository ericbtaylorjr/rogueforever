import { professions } from '../../content/content';
import { professionsCopy as copy } from '../../content/copy';
import { GradeBadge } from '../ui/GradeBadge';
import { SectionHeading } from '../ui/SectionHeading';
import { Tip } from '../ui/Tip';

/** Profession meta for every Rogue: a compact graded list, styled like the race list. */
export function Professions() {
  return (
    <section id="professions" aria-label="Professions">
      <SectionHeading id="professions" scope="all" />

      <Tip>{copy.tip}</Tip>

      {/* Plain ruled rows, not bordered cards: this list is read-only, unlike the build lists. */}
      <div className="panel mt-[16px]">
        <div className="px-[18px] pt-[16px] pb-[6px]">
          <span className="t-panel-label text-ink">{copy.listTitle}</span>
        </div>
        <ol aria-label={copy.listLabel}>
          {professions.map((p) => (
            <li
              key={p.name}
              className="grid items-center gap-x-[14px] border-t border-line px-[18px] py-[12px] first:border-0"
              style={{ gridTemplateColumns: '30px minmax(0,1fr)' }}
            >
              <GradeBadge grade={p.grade} />
              <span className="min-w-0">
                <span className="block text-[12px] leading-[1.4] text-faint">
                  <span className="text-[13.5px] font-semibold text-ink">{p.name}</span>
                  <span aria-hidden="true" className="mx-[8px] text-dim">|</span>
                  <span className="sr-only">: </span>
                  {p.kind}
                </span>
                <span className="mt-[6px] block text-[13px] leading-[1.5] text-prose">{p.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
