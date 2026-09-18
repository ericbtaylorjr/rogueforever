import { specBar } from '../../content/copy';
import { specById, specs } from '../../content/content';
import type { SpecId } from '../../content/types';
import { useCompendium } from '../../state/CompendiumProvider';
import { useTheme } from '../../state/ThemeProvider';
import { Droplet } from '../ui/Droplet';

/** Sticky under the hero. Owns the two page-level controls. */
export function SpecBar() {
  const { spec, setSpec, sweaty, toggleSweaty, isNarrow, isPhone } = useCompendium();
  const { tone } = useTheme();

  return (
    <div
      className="sticky z-[30] py-[10px]"
      style={{ top: isNarrow ? 58 : 0 }}
    >
      <div
        className="flex flex-wrap items-center gap-[10px] rounded-[12px] border border-line"
        style={{
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
              style={{ background: tone(specById[spec].color, 3) }}
            />
            <select
              aria-label={specBar.label}
              value={spec}
              onChange={(e) => setSpec(e.target.value as SpecId)}
              className="w-full appearance-none rounded-[20px] border bg-transparent py-[10px] pl-[27px] pr-[30px] text-[13px] font-semibold"
              style={{
                borderColor: 'var(--accent)',
                background: 'rgba(var(--accent-rgb),.13)',
                color: 'var(--accent)',
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
              className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 text-[9px] text-accent"
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
                      borderColor: on ? 'var(--accent)' : 'var(--line)',
                      background: on ? 'rgba(var(--accent-rgb),.13)' : 'transparent',
                      color: on ? 'var(--accent)' : 'var(--mute)',
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
            borderColor: sweaty ? 'rgba(var(--venom-rgb),.4)' : 'var(--line)',
            color: sweaty ? 'var(--venom)' : 'var(--faint)',
          }}
        >
          <Droplet size={8} color={sweaty ? 'var(--venom)' : 'var(--dim)'} title="" />
          {sweaty ? specBar.sweatyOn : specBar.sweatyOff}
        </button>
      </div>
    </div>
  );
}
