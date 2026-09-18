import { useCompendium } from '../../state/CompendiumProvider';

/**
 * Copy-to-clipboard with a 1600ms confirmation. Only one confirmation shows at
 * a time — the provider holds a single `copied` key.
 */
export function CopyButton({
  copyKey,
  text,
  label,
  copiedLabel = 'Copied',
  variant = 'block',
  name,
}: {
  copyKey: string;
  text: string;
  label: string;
  copiedLabel?: string;
  /** What is being copied. Gives repeated buttons ("Copy" ×N) a unique accessible name. */
  name?: string;
  variant?: 'block' | 'small';
}) {
  const { copied, copy } = useCompendium();
  const done = copied === copyKey;

  const base =
    variant === 'block'
      ? 'w-full rounded-[8px] px-[13px] py-[10px] text-[12.5px] font-semibold text-center transition-colors'
      : 'rounded-[6px] border px-[9px] py-[4px] text-[10.5px] font-semibold transition-colors';

  return (
    <>
      <button
        type="button"
        onClick={() => copy(copyKey, text)}
        aria-label={name ? `${done ? copiedLabel : label} ${name}` : undefined}
        className={base}
        style={
          done
            ? {
                border: '1px solid rgba(var(--venom-rgb),.4)',
                background: 'rgba(var(--venom-rgb),.1)',
                color: 'var(--venom)',
              }
            : {
                border: '1px solid rgba(var(--accent-rgb),.4)',
                background: 'rgba(var(--accent-rgb),.1)',
                color: 'var(--accent)',
              }
        }
      >
        {done ? copiedLabel : label}
      </button>
      <span role="status" className="sr-only">
        {done ? (name ? `${copiedLabel}: ${name}` : copiedLabel) : ''}
      </span>
    </>
  );
}
