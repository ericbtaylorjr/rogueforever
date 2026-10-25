import { useEffect, useRef, useState } from 'react';
import { specBar } from '../../content/copy';
import { specs } from '../../content/content';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { hexA } from '../../lib/color';
import { Droplet } from '../ui/Droplet';
import { BuildSelect, SpecSelect } from '../ui/SpecSelect';

/** True while the element after `sentinel` is pinned at `top` px. */
function useStuck(top: number) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setOn(!e.isIntersecting && e.boundingClientRect.top < top),
      { rootMargin: `${-top}px 0px 0px 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [top]);

  return { sentinel, on };
}

/** Sticky inside the spec zone. Owns the spec and build pickers and the sweaty-tips toggle. */
export function SpecBar() {
  const { spec, setSpec, sweaty, toggleSweaty, isNarrow } = useHandbook();
  const { tone } = useTheme();
  const c = useSpecColor();
  // Under the 58px mobile bar below 1100px (the CSS below). Only the stuck shadow reads it.
  const stuck = useStuck(isNarrow ? 58 : 0);

  return (
    <>
      {/* Sits where the bar rests; once it scrolls past the bar's sticky line, the bar is stuck. */}
      <div ref={stuck.sentinel} aria-hidden="true" className="h-px -mb-px" />
      <div className="specbar sticky top-0 z-[30] py-[10px] max-rail:top-[58px]">
        <div
          className="flex flex-wrap items-center gap-[10px] rounded-[12px] border px-[12px] py-[10px] transition-[color,background-color,border-color,box-shadow] sm:px-[16px] sm:py-[11px]"
          style={{
            borderColor: c.line,
            boxShadow: `inset 3px 0 0 ${c.mark}${stuck.on ? ', var(--specbar-shadow)' : ''}`,
            background: 'var(--specbar-bg)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Phones get two dropdowns; wider screens, spec pills and a build dropdown. */}
          <div className="flex w-full gap-[8px] sm:hidden">
            <SpecSelect />
            <BuildSelect />
          </div>
          <div className="contents max-sm:hidden">
            <span className="t-eyebrow text-[10.5px] text-faint">
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

            <span aria-hidden="true" className="mx-[4px] h-[22px] w-px bg-line" />

            <span className="t-eyebrow text-[10.5px] text-faint">
              {specBar.buildLabel}
            </span>
            <BuildSelect size="rail" grow={false} />

            <span className="ml-auto" />
          </div>

          <button
            type="button"
            aria-pressed={sweaty}
            onClick={toggleSweaty}
            className="pill shrink-0 px-[14px] py-[10px] transition-colors sm:px-[13px] sm:py-[7px]"
            style={{
              borderColor: sweaty ? 'rgba(var(--sweat-rgb),.4)' : 'var(--line)',
              color: sweaty ? 'var(--sweat)' : 'var(--faint)',
            }}
          >
            <Droplet size={8} color={sweaty ? 'var(--sweat)' : 'var(--dim)'} title="" />
            {sweaty ? specBar.sweatyOn : specBar.sweatyOff}
          </button>
        </div>
      </div>
    </>
  );
}
