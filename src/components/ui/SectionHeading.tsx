import { headings } from '../../content/copy';

export function SectionHeading({ id }: { id: string }) {
  return (
    <div className="mb-[22px]">
      <h2 className="t-h2 text-ink">{headings[id]}</h2>
    </div>
  );
}
