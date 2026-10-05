import type { ReactNode } from 'react';
import { scope } from '../../content/copy';
import { useHandbook } from '../../state/HandbookProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { Divider } from '../ui/Divider';
import { SpecBar } from './SpecBar';

/**
 * Everything that follows the active spec. The spec bar is sticky *within this
 * wrapper*, so it scrolls away once you leave the spec sections — the page
 * itself shows what the picker controls. A rail in the spec's colour runs the
 * length of the zone.
 */
export function SpecZone({ children }: { children: ReactNode }) {
  const { isPhone, isNarrow } = useHandbook();
  const c = useSpecColor();
  const gutter = isPhone ? -9 : isNarrow ? -13 : -17;

  return (
    <div
      className="spec-zone relative"
      role="region"
      aria-label={scope.zone.label}
      style={{ '--spec-mark': c.mark } as React.CSSProperties}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[40px] top-[4px] w-[2px] rounded-full transition-colors"
        style={{
          left: gutter,
          background: `linear-gradient(180deg, ${c.mark}, ${c.line} 85%, transparent)`,
        }}
      />
      <div className="mb-[8px]">
        <div className="t-eyebrow text-[9.5px] tracking-[.18em]" style={{ color: c.text }}>
          {scope.zone.eyebrow}
        </div>
        <p className="mt-[7px] max-w-[70ch] text-[13px] leading-[1.6] text-mute">{scope.zone.body}</p>
      </div>
      <SpecBar />
      {/* Plain (accent) divider: it closes the zone header, it isn't a break between spec sections. */}
      <Divider plain />
      {children}
    </div>
  );
}

/** Marks the hand-off from spec guidance to content that's the same for every Rogue. */
export function AllRoguesBanner() {
  return (
    <div className="flex flex-wrap items-baseline gap-x-[10px] gap-y-[4px] mb-[34px] rounded-[12px] border border-line px-[16px] py-[12px]">
      <span className="t-eyebrow text-[9.5px] tracking-[.18em] text-faint">{scope.allZone.eyebrow}</span>
      <span className="text-[12.5px] leading-[1.55] text-mute">{scope.allZone.body}</span>
    </div>
  );
}
