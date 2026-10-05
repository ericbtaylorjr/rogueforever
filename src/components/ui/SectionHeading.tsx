import { headings } from '../../content/copy';
import { SpecChip } from './ScopeChip';

/** `scope="spec"` adds the active spec's chip. Shared sections need no marker. */
export function SectionHeading({ id, scope }: { id: string; scope?: 'spec' | 'all' }) {
  return (
    <div className="mb-[20px] flex flex-wrap items-center gap-x-[14px] gap-y-[8px]">
      <h2 className="t-h2 text-ink">{headings[id]}</h2>
      {scope === 'spec' && <SpecChip />}
    </div>
  );
}
