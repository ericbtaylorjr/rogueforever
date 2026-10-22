import type { HTMLAttributes } from 'react';
import icons from '../../content/icons.json';
import type { WowheadRef } from '../../lib/wowhead';

type IconEntry = { id: number; icon: string; kind: 'item' | 'spell' };
const manifest = icons as Record<string, IconEntry>;

/** Look up an item or spell by its display name, or a gear item by `item:<id>`. */
export const iconFor = (key: string): IconEntry | undefined => manifest[key];

export const wowheadFor = (key: string): string | undefined => {
  const e = manifest[key];
  return e && `https://www.wowhead.com/forever/${e.kind}=${e.id}`;
};

/** The Wowhead entity behind a display name or `item:<id>`, for live tooltips. */
export const wowheadRefFor = (key: string): WowheadRef | undefined => {
  const e = manifest[key];
  return e && { kind: e.kind, id: e.id };
};

/**
 * A name that opens its Wowhead page in a new tab. Falls back to plain text (with
 * a help cursor, since it still has a tooltip) when the name hasn't been resolved
 * by `npm run icons`. Extra props (tooltip bindings) go on whichever element renders.
 */
export function WowheadLink({ name, className, ...rest }: { name: string; className?: string } & HTMLAttributes<HTMLElement>) {
  const href = wowheadFor(name);
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={className} {...rest}>
      {name}
    </a>
  ) : (
    <span className={`cursor-help ${className ?? ''}`} {...rest}>
      {name}
    </span>
  );
}

/**
 * In-game icon, self-hosted from public/icons (run `npm run icons` to refresh).
 * Framed like the action bar: a dark bevelled border. Renders nothing when the
 * name hasn't been resolved, so a missing icon never leaves a hole.
 */
export function GameIcon({ name, size = 22 }: { name: string; size?: number }) {
  const e = manifest[name];
  if (!e) return null;
  return (
    <img
      src={`${import.meta.env.BASE_URL}icons/${e.icon}.jpg`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="game-icon shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
