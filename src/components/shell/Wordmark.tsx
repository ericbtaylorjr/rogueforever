import { shell } from '../../content/copy';
import { useHandbook } from '../../state/HandbookProvider';
import { RogueMark } from '../ui/RogueMark';

export function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <div className="flex items-center gap-[10px]">
      <RogueMark size={size} />
      <div>
        <div
          className="text-ink"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontStretch: '72%',
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          {shell.wordmark}
        </div>
        <div className="t-eyebrow mt-[3px] text-[9px] tracking-[.18em] text-faint">
          {shell.wordmarkSub}
        </div>
      </div>
    </div>
  );
}

/**
 * Legend for the droplet marker, doubling as the sweaty-tips toggle. Sweaty
 * tips appear outside the spec zone too (consumables, buffs), so the toggle
 * can't live only in the spec bar.
 */
export function SweatyLegend() {
  const { sweaty, toggleSweaty } = useHandbook();
  return (
    <button
      type="button"
      aria-pressed={sweaty}
      onClick={toggleSweaty}
      className="flex w-full items-center gap-[8px] rounded-[8px] text-left text-[11px] text-faint"
    >
      <span
        aria-hidden="true"
        className="inline-block shrink-0"
        style={{
          width: 8,
          height: 9,
          background: sweaty ? 'var(--sweat)' : 'var(--dim)',
          clipPath: 'polygon(50% 0%, 100% 62%, 78% 100%, 22% 100%, 0% 62%)',
        }}
      />
      <span className="flex-1">
        {shell.legend.before}
        <strong className="font-semibold text-sweat">{shell.legend.strong}</strong>
        {shell.legend.after}
      </span>
      <span
        className="pill shrink-0 px-[9px] py-[3px] text-[10.5px]"
        style={{
          borderColor: sweaty ? 'rgba(var(--sweat-rgb),.4)' : 'var(--line)',
          color: sweaty ? 'var(--sweat)' : 'var(--faint)',
        }}
      >
        {sweaty ? shell.legend.on : shell.legend.off}
      </span>
    </button>
  );
}
