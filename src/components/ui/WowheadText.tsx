import icons from '../../content/icons.json';
import { useTooltip } from './Tooltip';
import { WowheadLink, wowheadRefFor } from './GameIcon';

/**
 * Every spell and item name `npm run icons` resolved (gear `item:<id>` keys aside),
 * longest first so "Greater Frenzy Potion" wins over a shorter name inside it.
 */
const names = Object.keys(icons)
  .filter((k) => !k.startsWith('item:'))
  .sort((a, b) => b.length - a.length);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Whole names only: "Stealth" shouldn't light up inside "Stealthed".
const pattern = new RegExp(`(?<![\\w'])(${names.map(escape).join('|')})(?!\\w)`);

/** The first spell or item named in `text`, e.g. for its icon. */
export const firstWowheadName = (text: string) => text.match(pattern)?.[1];

/**
 * Prose with every resolved spell and item name turned into its Wowhead Forever link,
 * with the live tooltip on hover and focus. Names Wowhead couldn't resolve stay plain.
 */
export function WowheadText({ text }: { text: string }) {
  const { bind } = useTooltip();
  return (
    <>
      {text.split(pattern).map((part, i) =>
        i % 2 === 1 ? (
          <WowheadLink
            key={i}
            name={part}
            className="underline decoration-line underline-offset-[3px] transition-colors hover:text-accent focus-visible:text-accent"
            {...bind({ name: part, wowhead: wowheadRefFor(part) })}
          />
        ) : (
          part
        ),
      )}
    </>
  );
}
