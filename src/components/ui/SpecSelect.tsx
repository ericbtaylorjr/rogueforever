import type { ReactNode } from 'react';
import { buildsFor, phaseOrder } from '../../content/builds';
import { specs } from '../../content/content';
import { buildPhases, specBar } from '../../content/copy';
import type { SpecId } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useSpecColor } from '../../state/useSpecColor';

type Size = 'rail' | 'touch';

/**
 * Native dropdown tinted in the active spec's colour. `size="rail"` is the compact
 * desktop variant. `grow` fills the row; off, it sizes to its widest option.
 */
function TintedSelect({
  label,
  value,
  onChange,
  size,
  grow = true,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  size: Size;
  grow?: boolean;
  children: ReactNode;
}) {
  const c = useSpecColor();
  const rail = size === 'rail';

  return (
    <div className={`relative min-w-0 ${grow ? 'flex-1' : 'shrink-0'}`}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[13px] top-1/2 size-[7px] shrink-0 -translate-y-1/2 rounded-full"
        style={{ background: c.mark }}
      />
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full cursor-pointer appearance-none rounded-[9px] border bg-transparent pl-[27px] pr-[46px] font-semibold transition-[border-color,box-shadow] hover:shadow-[inset_0_0_0_1px_currentColor] ${
          rail ? 'py-[7px] text-[12.5px]' : 'py-[10px] text-[13px]'
        }`}
        style={{ borderColor: c.line, background: c.soft, color: c.text }}
      >
        {children}
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

/** Spec dropdown. Used by the phone spec bar and the nav's spec group. */
export function SpecSelect({ size = 'touch' }: { size?: Size }) {
  const { spec, setSpec } = useHandbook();
  return (
    <TintedSelect label={specBar.label} value={spec} onChange={(v) => setSpec(v as SpecId)} size={size}>
      {specs.map((s) => (
        <option key={s.id} value={s.id} style={{ color: '#0B0B0D' }}>
          {s.name}
        </option>
      ))}
    </TintedSelect>
  );
}

/** The active spec's builds, grouped Level 60 then Leveling. Sits beside every spec picker. */
export function BuildSelect({ size = 'touch', grow = true }: { size?: Size; grow?: boolean }) {
  const { spec, build, pickBuild } = useHandbook();
  const list = buildsFor(spec);

  return (
    <TintedSelect
      label={specBar.buildLabel}
      value={build.id}
      onChange={(id) => pickBuild(spec, id)}
      size={size}
      grow={grow}
    >
      {phaseOrder.map((phase) => {
        const group = list.filter((b) => b.phase === phase);
        return (
          group.length > 0 && (
            <optgroup key={phase} label={buildPhases[phase]} style={{ color: '#0B0B0D' }}>
              {group.map((b) => (
                <option key={b.id} value={b.id} style={{ color: '#0B0B0D' }}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          )
        );
      })}
    </TintedSelect>
  );
}
