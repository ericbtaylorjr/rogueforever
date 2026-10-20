import { scope } from '../../content/copy';
import { useHandbook } from '../../state/HandbookProvider';
import { useSpecColor } from '../../state/useSpecColor';

const BASE = 'inline-flex items-center gap-[7px] rounded-full border px-[10px] py-[4px] text-[11.5px] font-semibold whitespace-nowrap';

/** "This follows your build": the active spec and build in the spec's colour. */
export function SpecChip() {
  const { build } = useHandbook();
  const c = useSpecColor();
  return (
    <span
      className={BASE}
      style={{ borderColor: c.line, background: c.soft, color: c.text }}
    >
      <span aria-hidden="true" className="size-[7px] shrink-0 rounded-full" style={{ background: c.mark }} />
      <span className="sr-only">{scope.specChipPrefix}: </span>
      {c.spec.name}
      <span aria-hidden="true" className="opacity-60">·</span>
      <span className="font-normal">{build.name}</span>
    </span>
  );
}
