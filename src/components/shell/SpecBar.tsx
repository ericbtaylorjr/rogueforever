import { specBar } from '../../content/copy';
import { specs } from '../../content/content';
import type { SpecId } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { hexA } from '../../lib/color';
import { Droplet } from '../ui/Droplet';

/** Sticky inside the spec zone. Owns the spec picker and the sweaty-tips toggle. */
export function SpecBar() {
  const { spec, setSpec, sweaty, toggleSweaty, isNarrow, isPhone } = useHandbook();
  const { tone } = useTheme();
  const c = useSpecColor();

  return (
    <div
      className="sticky z-[30] py-[10px]"
      style={{ top: isNarrow ? 58 : 0 }}
    >
      <div
        className="flex flex-wrap items-center gap-[10px] rounded-[12px] border transition-colors"
        style={{
          borderColor: c.line,
          boxShadow: `inset 3px 0 0 ${c.mark}`,
          background: 'var(--specbar-bg)',
          backdropFilter: 'blur(10px)',
          padding: isPhone ? '10px 12px' : '11px 16px',
        }}
      >
        {isPhone ? (
          <div className="relative min-w-0 flex-1">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-[13px] top-1/2 size-[7px] shrink-0 -translate-y-1/2 rounded-full"
              style={{ background: c.mark }}
            />
            <select
              aria-label={specBar.label}
              value={spec}
              onChange={(e) => setSpec(e.target.value as SpecId)}
              className="w-full appearance-none rounded-[20px] border bg-transparent py-[10px] pl-[27px] pr-[30px] text-[13px] font-semibold"
              style={{
                borderColor: c.line,
                background: c.soft,
                color: c.text,
              }}
            >
              {specs.map((s) => (
                <option key={s.id} value={s.id} style={{ color: '#0B0B0D' }}>
                  {s.name}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[9px]"
              style={{ color: c.text }}
            >
              ▾
            </span>
          </div>
        ) : (
          <>
            <span className="t-eyebrow text-[9.5px] tracking-[.18em] text-faint">
              {specBar.label}
            </span>

            <div role="group" aria-label={specBar.label} className="flex flex-wrap gap-[7px]">
              {specs.map((s) => {
                const on = s.id === spec;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSpec(s.id)}
                    className="pill transition-colors"
                    style={{
                      padding: '7px 13px',
                      borderColor: on ? hexA(s.color, 0.42) : 'var(--line)',
                      background: on ? hexA(s.color, 0.12) : 'transparent',
                      color: on ? tone(s.color) : 'var(--mute)',
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="size-[7px] shrink-0 rounded-full"
                      style={{ background: tone(s.color, 3) }}
                    />
                    {s.name}
                  </button>
                );
              })}
            </div>

            <span className="ml-auto" />
          </>
        )}

        <button
          type="button"
          aria-pressed={sweaty}
          onClick={toggleSweaty}
          className="pill shrink-0 transition-colors"
          style={{
            padding: isPhone ? '10px 14px' : '7px 13px',
            borderColor: sweaty ? 'rgba(var(--sweat-rgb),.4)' : 'var(--line)',
            color: sweaty ? 'var(--sweat)' : 'var(--faint)',
          }}
        >
          <Droplet size={8} color={sweaty ? 'var(--sweat)' : 'var(--dim)'} title="" />
          {sweaty ? specBar.sweatyOn : specBar.sweatyOff}
        </button>
      </div>
    </div>
  );
}
