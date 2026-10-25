import type { ReactNode } from 'react';
import { scope } from '../../content/copy';
import { useKeepPlace } from '../../lib/keepPlace';
import { useHandbook, useShownBuild } from '../../state/HandbookProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { Divider } from '../ui/Divider';
import { Tip } from '../ui/Tip';
import { SpecBar } from './SpecBar';

/**
 * Everything that follows the active spec and build. The spec bar is sticky *within this
 * wrapper*, so it scrolls away once you leave the spec sections — the page
 * itself shows what the picker controls. A rail in the spec's colour runs the
 * length of the zone.
 */
export function SpecZone({ children }: { children: ReactNode }) {
  const { build } = useHandbook();
  const c = useSpecColor();
  // Runs after the deferred build commits, so the switch has fully rendered.
  const shown = useShownBuild();
  useKeepPlace(`${shown.spec}/${shown.id}`);

  return (
    <div
      className="spec-zone relative"
      role="region"
      aria-label={scope.zone.label}
      style={{ '--spec-mark': c.mark } as React.CSSProperties}
    >
      <span
        aria-hidden="true"
        // In the page's side gutter, which widens at each breakpoint (see Shell).
        className="pointer-events-none absolute bottom-[40px] top-[4px] -left-[9px] w-[2px] rounded-full transition-colors sm:-left-[13px] rail:-left-[17px]"
        style={{
          background: `linear-gradient(180deg, ${c.mark}, ${c.line} 85%, transparent)`,
        }}
      />
      <SpecBar />
      <div className="mt-[4px]">
        <Tip spec label={false}>
          {scope.zone.before}
          <strong className="font-semibold" style={{ color: c.text }}>
            {c.spec.name} · {build.name}
          </strong>
          {scope.zone.after}
        </Tip>
      </div>
      <Divider />
      {children}
    </div>
  );
}

/** Marks the hand-off from spec guidance to content that's the same for every Rogue. */
export function AllRoguesBanner() {
  return (
    <Tip label={false}>
      {scope.allZone}
    </Tip>
  );
}
