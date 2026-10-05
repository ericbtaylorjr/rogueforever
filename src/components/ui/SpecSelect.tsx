import { specs } from '../../content/content';
import { specBar } from '../../content/copy';
import type { SpecId } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useSpecColor } from '../../state/useSpecColor';

/**
 * Native spec dropdown tinted in the active spec's colour. Used by the phone spec
 * bar and the nav's spec group. `size="rail"` is the compact desktop variant.
 */
export function SpecSelect({ size = 'touch' }: { size?: 'rail' | 'touch' }) {
  const { spec, setSpec } = useHandbook();
  const c = useSpecColor();
  const rail = size === 'rail';

  return (
    <div className="relative min-w-0 flex-1">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[13px] top-1/2 size-[7px] shrink-0 -translate-y-1/2 rounded-full"
        style={{ background: c.mark }}
      />
      <select
        aria-label={specBar.label}
        value={spec}
        onChange={(e) => setSpec(e.target.value as SpecId)}
        className={`w-full cursor-pointer appearance-none rounded-[9px] border bg-transparent pl-[27px] pr-[46px] font-semibold transition-[border-color,box-shadow] hover:shadow-[inset_0_0_0_1px_currentColor] ${
          rail ? 'py-[7px] text-[12.5px]' : 'py-[10px] text-[13px]'
        }`}
        style={{ borderColor: c.line, background: c.soft, color: c.text }}
      >
        {specs.map((s) => (
          <option key={s.id} value={s.id} style={{ color: '#0B0B0D' }}>
            {s.name}
          </option>
        ))}
      </select>
      {/* Divided caret segment: reads as a dropdown field rather than a tinted pill. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-[5px] right-0 grid w-[36px] place-items-center border-l"
        style={{ borderColor: c.line, color: c.text }}
      >
        <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </span>
    </div>
  );
}
