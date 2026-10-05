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
      <p className="mb-[6px] max-w-[70ch] text-[13.5px] leading-[1.6] text-mute">
        {scope.zone.before}
        <strong className="font-semibold" style={{ color: c.text }}>
          {c.spec.name}
        </strong>
        {scope.zone.after}
      </p>
      <SpecBar />
      {/* Plain (accent) divider: it closes the zone header, it isn't a break between spec sections. */}
      <Divider plain />
      {children}
    </div>
  );
}

/** Marks the hand-off from spec guidance to content that's the same for every Rogue. */
export function AllRoguesBanner() {
  return <p className="mb-[30px] max-w-[70ch] text-[13.5px] leading-[1.6] text-mute">{scope.allZone}</p>;
}
