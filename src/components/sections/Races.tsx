import { races } from '../../content/content';
import { racesCopy as copy } from '../../content/copy';
import { links, wowsimsLink } from '../../content/links';
import { Callout } from '../ui/Callout';
import { GradeBadge } from '../ui/GradeBadge';
import { LinkedText } from '../ui/LinkedText';
import { SectionHeading } from '../ui/SectionHeading';

/** Race meta for every Rogue: a graded list, framed by how far the sims generalise. */
export function Races() {
  return (
    <section id="races" aria-label="Races">
      <SectionHeading id="races" scope="all" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">
        <LinkedText text={copy.intro} links={wowsimsLink} />
      </p>
      <a
        href={links.wowheadRacials}
        target="_blank"
        rel="noreferrer"
        className="mt-[10px] inline-block text-[13px] font-semibold text-accent underline underline-offset-2"
      >
        {copy.learnMore}
      </a>

      <div className="mt-[14px]">
        <Callout label={copy.tip.label}>{copy.tip.text}</Callout>
      </div>

      {/* Plain ruled rows, not bordered cards: this list is read-only, unlike the build lists. */}
      <div className="panel mt-[16px]">
        <div className="px-[18px] pt-[16px] pb-[6px]">
          <span className="t-panel-label text-ink">{copy.listTitle}</span>
        </div>
        <ol aria-label={copy.listLabel}>
          {races.map((r) => (
            <li
              key={r.name}
              className="grid items-center gap-x-[14px] border-t border-line px-[18px] py-[12px] first:border-0"
              style={{ gridTemplateColumns: '30px minmax(0,1fr)' }}
            >
              <GradeBadge grade={r.grade} />
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-ink">{r.name}</span>
                <span className="mt-[2px] block text-[12.5px] leading-[1.5] text-mute">{r.note}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-[16px] max-w-[70ch] text-[13px] leading-[1.6] text-mute">
        <LinkedText text={copy.sheet.text} links={{ [copy.sheet.link]: links.anhakRacials }} />
      </p>
    </section>
  );
}
