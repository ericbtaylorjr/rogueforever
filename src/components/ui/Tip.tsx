import type { ReactNode } from 'react';
import { tips as copy } from '../../content/copy';
import { hexA } from '../../lib/color';
import { useHandbook } from '../../state/HandbookProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { Callout } from './Callout';
import { Droplet } from './Droplet';

/**
 * Every tip on the page. Colour says who it is for:
 * - default: yellow, a tip for every Rogue.
 * - `sweaty`: blue with the droplet, and hidden unless sweaty tips are on.
 * - `spec`: the active spec's colour, for tips that only apply to that spec.
 *   Combine with `sweaty` for a spec tip that is also a sweaty one.
 * `label` defaults to "Tip:" or "Sweaty tip:"; pass `false` for none.
 */
export function Tip({
  sweaty = false,
  spec = false,
  label,
  children,
}: {
  sweaty?: boolean;
  spec?: boolean;
  label?: string | false;
  children: ReactNode;
}) {
  const { sweaty: showSweaty } = useHandbook();
  const c = useSpecColor();
  if (sweaty && !showSweaty) return null;

  const lead = label === false ? undefined : (label ?? (sweaty ? copy.sweatyLabel : copy.label));
  return (
    <Callout
      tone={sweaty ? 'sweat' : 'accent'}
      colors={spec ? { rule: c.mark, tint: hexA(c.spec.color, 0.07), text: c.text } : undefined}
      label={lead}
      // The label already says "Sweaty tip", so the droplet stays silent for screen readers.
      icon={sweaty ? <Droplet size={8} title="" color={spec ? c.mark : undefined} /> : undefined}
    >
      {children}
    </Callout>
  );
}
