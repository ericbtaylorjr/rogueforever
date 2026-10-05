import { nav, specs } from '../../content/content';
import { scope } from '../../content/copy';
import type { NavGroup } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { useSpecColor } from '../../state/useSpecColor';

/** Compact spec switcher for the spec group header: one dot per spec. */
function SpecDots({ touch }: { touch: boolean }) {
  const { spec, setSpec } = useHandbook();
  const { tone } = useTheme();
  return (
    <div role="group" aria-label={scope.navSwitch} className="ml-auto flex gap-[2px]">
      {specs.map((s) => {
        const on = s.id === spec;
        return (
          <button
            key={s.id}
            type="button"
            aria-label={s.name}
            aria-pressed={on}
            title={s.name}
            onClick={() => setSpec(s.id)}
            className={`grid place-items-center rounded-full ${touch ? 'size-[36px]' : 'size-[22px]'}`}
          >
            <span
              aria-hidden="true"
              className="rounded-full transition-all"
              style={{
                width: on ? 10 : 7,
                height: on ? 10 : 7,
                background: tone(s.color, 3),
                opacity: on ? 1 : 0.45,
                boxShadow: on ? `0 0 0 2px var(--bg), 0 0 0 3px ${tone(s.color, 3)}` : undefined,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Grouped section nav. `size="touch"` is the drawer variant — bigger targets.
 * The spec-scoped group is labelled with the active spec and drawn in its colour.
 * Note: item counts were removed in a later design revision. Don't add them back.
 */
export function NavList({ size = 'rail' }: { size?: 'rail' | 'touch' }) {
  const { active, jump } = useHandbook();
  const c = useSpecColor();
  const touch = size === 'touch';

  const header = (group: NavGroup) =>
    group.scope === 'spec' ? (
      <div className="mb-[6px] pl-[8px]">
        <div className="flex items-center">
          <span className="t-eyebrow text-[9px] tracking-[.2em] text-faint">{group.label}</span>
          <SpecDots touch={touch} />
        </div>
        <div
          className={`flex items-center gap-[7px] font-semibold ${touch ? 'text-[14px]' : 'text-[12.5px]'}`}
          style={{ color: c.text }}
        >
          <span aria-hidden="true" className="size-[7px] rounded-full" style={{ background: c.mark }} />
          {c.spec.name}
        </div>
      </div>
    ) : (
      <div className="t-eyebrow mb-[7px] px-[8px] text-[9px] tracking-[.2em] text-faint">{group.label}</div>
    );

  return (
    <nav aria-label="Sections" className="flex flex-col gap-[18px]">
      {nav.map((group) => {
        const specGroup = group.scope === 'spec';
        return (
          <div key={group.label}>
            {header(group)}
            <ul className="flex flex-col gap-[2px]">
              {group.items.map((item) => {
                const on = active === item.id;
                const ink = specGroup ? c.text : 'var(--accent)';
                const fill = specGroup ? c.soft : 'rgba(var(--accent-rgb),.1)';
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={on ? 'location' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        jump(item.id);
                      }}
                      className={`flex items-center gap-[9px] transition-colors ${
                        touch ? 'rounded-[8px] px-[11px] py-[12px] text-[14.5px]' : 'rounded-[7px] px-[8px] py-[7px] text-[13px]'
                      }`}
                      style={{
                        background: on ? fill : 'transparent',
                        color: on ? ink : 'var(--mute)',
                        fontWeight: on ? 600 : 400,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className="shrink-0 rounded-full"
                        style={{
                          width: 2,
                          height: 13,
                          // Spec items always show a faint spec-coloured marker.
                          background: on ? (specGroup ? c.mark : 'var(--accent)') : specGroup ? c.line : 'transparent',
                        }}
                      />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
