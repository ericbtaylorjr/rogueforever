import { sectionIds } from '../../content/content';
import { headings } from '../../content/copy';

/** 01…14, derived from nav order so it can't drift from the sections. */
export function sectionNumber(id: string): string {
  const i = sectionIds.indexOf(id);
  return String(i).padStart(2, '0');
}

export function SectionHeading({
  id,
  tone = 'var(--accent)',
}: {
  id: string;
  tone?: string;
}) {
  return (
    <div className="mb-[22px] flex items-baseline gap-[14px]">
      <span className="t-eyebrow t-num text-[11px]" style={{ color: tone }}>
        {sectionNumber(id)}
      </span>
      <h2 className="t-h2 text-ink">{headings[id]}</h2>
    </div>
  );
}
