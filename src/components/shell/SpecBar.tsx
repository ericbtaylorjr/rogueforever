import { specBar } from '../../content/copy';
import { specs } from '../../content/content';
import { useCompendium } from '../../state/CompendiumProvider';
import { Droplet } from '../ui/Droplet';

/** Sticky under the hero. Owns the two page-level controls. */
export function SpecBar() {
  const { spec, setSpec, sweaty, toggleSweaty, isNarrow, isPhone } = useCompendium();

  return (
    <div
      className="sticky z-[30] py-[10px]"
      style={{ top: isNarrow ? 58 : 0 }}
    >
      <div
        className="flex flex-wrap items-center gap-[10px] rounded-[12px] border border-line"
        style={{
          background: 'rgba(14,14,19,.94)',
          backdropFilter: 'blur(10px)',
          padding: isPhone ? '10px 12px' : '11px 16px',
        }}
      >
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
                  padding: isPhone ? '10px 14px' : '7px 13px',
                  borderColor: on ? 'var(--accent)' : 'var(--line)',
                  background: on ? 'rgba(255,244,104,.13)' : 'transparent',
                  color: on ? 'var(--accent)' : 'var(--mute)',
                  fontWeight: on ? 600 : 400,
                }}
              >
                <span
                  aria-hidden="true"
                  className="size-[7px] shrink-0 rounded-full"
                  style={{ background: s.color }}
                />
                {s.name}
              </button>
            );
          })}
        </div>

        <span className="ml-auto" />

        <button
          type="button"
          aria-pressed={sweaty}
          onClick={toggleSweaty}
          className="pill transition-colors"
          style={{
            padding: isPhone ? '10px 14px' : '7px 13px',
            borderColor: sweaty ? 'rgba(123,224,107,.4)' : 'var(--line)',
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
