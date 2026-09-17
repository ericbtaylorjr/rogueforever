import { shell } from '../../content/copy';
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

export function SweatyLegend() {
  return (
    <div className="flex items-center gap-[8px] text-[11px] text-faint">
      <span
        aria-hidden="true"
        className="inline-block shrink-0"
        style={{
          width: 8,
          height: 9,
          background: 'var(--venom)',
          clipPath: 'polygon(50% 0%, 100% 62%, 78% 100%, 22% 100%, 0% 62%)',
        }}
      />
      <span>
        {shell.legend.before}
        <strong className="font-semibold text-venom">{shell.legend.strong}</strong>
        {shell.legend.after}
      </span>
    </div>
  );
}
