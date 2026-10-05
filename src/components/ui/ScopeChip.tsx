import { scope } from '../../content/copy';
import { useSpecColor } from '../../state/useSpecColor';

const BASE = 'inline-flex items-center gap-[7px] rounded-full border px-[10px] py-[4px] text-[11.5px] font-semibold whitespace-nowrap';

/** "This follows your spec": the active spec's name in its colour. */
export function SpecChip() {
  const c = useSpecColor();
  return (
    <span
      className={BASE}
      style={{ borderColor: c.line, background: c.soft, color: c.text }}
    >
      <span aria-hidden="true" className="size-[7px] shrink-0 rounded-full" style={{ background: c.mark }} />
      <span className="sr-only">{scope.specChipPrefix}: </span>
      {c.spec.name}
    </span>
  );
}

/** "Same for everyone": neutral counterpart to SpecChip. */
export function AllSpecsChip() {
  return (
    <span className={`${BASE} border-line text-faint`}>
      <span aria-hidden="true" className="flex gap-[2px]">
        <span className="size-[5px] rounded-full bg-current opacity-70" />
        <span className="size-[5px] rounded-full bg-current opacity-70" />
        <span className="size-[5px] rounded-full bg-current opacity-70" />
      </span>
      {scope.allChip}
    </span>
  );
}
