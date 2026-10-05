import { headings } from '../../content/copy';
import { AllSpecsChip, SpecChip } from './ScopeChip';

/** `scope` adds a chip saying whether the section follows the active spec. */
export function SectionHeading({ id, scope }: { id: string; scope?: 'spec' | 'all' }) {
  return (
    <div className="mb-[22px] flex flex-wrap items-center gap-x-[14px] gap-y-[8px]">
      <h2 className="t-h2 text-ink">{headings[id]}</h2>
      {scope === 'spec' && <SpecChip />}
      {scope === 'all' && <AllSpecsChip />}
    </div>
  );
}
