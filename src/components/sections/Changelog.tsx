import { changelog } from '../../content/content';
import { SectionHeading } from '../ui/SectionHeading';

export function Changelog() {
  return (
    <section id="changelog" aria-label="Changelog">
      <SectionHeading id="changelog" />

      <div className="flex flex-col">
        {changelog.map((c) => (
          <div
            key={c.date}
            className="grid gap-x-[16px] gap-y-[4px] border-t border-line py-[14px] sm:grid-cols-[120px_minmax(0,1fr)]"
          >
            <span className="t-num text-[12px] text-accent">{c.date}</span>
            <p className="text-[13.5px] leading-[1.6] text-prose">{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
