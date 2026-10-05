import icons from '../../content/icons.json';

type IconEntry = { id: number; icon: string; kind: 'item' | 'spell' };
const manifest = icons as Record<string, IconEntry>;

/** Look up an item or spell by its display name, or a gear item by `item:<id>`. */
export const iconFor = (key: string): IconEntry | undefined => manifest[key];

export const wowheadFor = (key: string): string | undefined => {
  const e = manifest[key];
  return e && `https://www.wowhead.com/classic/${e.kind}=${e.id}`;
};

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
