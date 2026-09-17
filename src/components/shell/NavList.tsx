import { nav } from '../../content/content';
import { useCompendium } from '../../state/CompendiumProvider';

/**
 * Grouped section nav. `size="touch"` is the drawer variant — bigger targets.
 * Note: item counts were removed in a later design revision. Don't add them back.
 */
export function NavList({ size = 'rail' }: { size?: 'rail' | 'touch' }) {
  const { active, jump } = useCompendium();
  const touch = size === 'touch';

  return (
    <nav aria-label="Sections" className="flex flex-col gap-[18px]">
      {nav.map((group) => (
        <div key={group.label}>
          <div className="t-eyebrow mb-[7px] px-[8px] text-[9px] tracking-[.2em] text-faint">
            {group.label}
          </div>
          <ul className="flex flex-col gap-[2px]">
            {group.items.map((item) => {
              const on = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={on ? 'true' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      jump(item.id);
                    }}
                    className={`flex items-center gap-[9px] transition-colors ${
                      touch ? 'rounded-[8px] px-[11px] py-[12px] text-[14.5px]' : 'rounded-[7px] px-[8px] py-[7px] text-[13px]'
                    }`}
                    style={{
                      background: on ? 'rgba(255,244,104,.1)' : 'transparent',
                      color: on ? 'var(--accent)' : 'var(--mute)',
                      fontWeight: on ? 600 : 400,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 rounded-full"
                      style={{
                        width: 2,
                        height: 13,
                        background: on ? 'var(--accent)' : 'transparent',
                      }}
                    />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
