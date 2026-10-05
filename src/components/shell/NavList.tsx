import { nav } from '../../content/content';
import type { NavGroup } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { SpecSelect } from '../ui/SpecSelect';

/**
 * Grouped section nav. `size="touch"` is the drawer variant — bigger targets.
 * The spec-scoped group opens with the spec dropdown, and its items are drawn in the spec's colour.
 * Note: item counts were removed in a later design revision. Don't add them back.
 */
export function NavList({ size = 'rail' }: { size?: 'rail' | 'touch' }) {
  const { active, jump } = useHandbook();
  const c = useSpecColor();
  const touch = size === 'touch';

  const header = (group: NavGroup) =>
    group.scope === 'spec' ? (
      <div className="mb-[8px] px-[8px]">
        <div className="t-eyebrow mb-[7px] text-[10.5px] text-faint">{group.label}</div>
        <SpecSelect size={touch ? 'touch' : 'rail'} />
      </div>
    ) : (
      <div className="t-eyebrow mb-[7px] px-[8px] text-[10.5px] text-faint">{group.label}</div>
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
