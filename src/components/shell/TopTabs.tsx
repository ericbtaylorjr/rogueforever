import { nav, specSectionIds } from '../../content/content';
import { useHandbook } from '../../state/HandbookProvider';
import { useSpecColor } from '../../state/useSpecColor';
import { SearchTrigger } from './SearchTrigger';
import { ThemeToggle } from './ThemeToggle';
import { Wordmark } from './Wordmark';

/**
 * `navLayout: 'topTabs'` variant, ≥1100px only — below that the shell always
 * falls back to the drawer. Not the recommended ship configuration.
 */
export function TopTabs() {
  const { active, jump } = useHandbook();
  const items = nav.flatMap((g) => g.items);
  const c = useSpecColor();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-[40] border-b border-line"
      style={{ background: 'var(--bar-bg)', backdropFilter: 'blur(14px)' }}
    >
      <div className="mx-auto flex max-w-[1420px] items-center gap-[18px] px-[30px] py-[12px]">
        <Wordmark size={28} />
        <nav aria-label="Sections" className="flex flex-1 gap-[2px] overflow-x-auto">
          {items.map((i) => {
            const on = active === i.id;
            const mine = specSectionIds.has(i.id);
            return (
              <a
                key={i.id}
                href={`#${i.id}`}
                aria-current={on ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  jump(i.id);
                }}
                className="flex items-center gap-[6px] whitespace-nowrap rounded-[7px] px-[10px] py-[7px] text-[13px] transition-colors"
                style={{
                  background: on ? (mine ? c.soft : 'rgba(var(--accent-rgb),.1)') : 'transparent',
                  color: on ? (mine ? c.text : 'var(--accent)') : 'var(--mute)',
                  fontWeight: on ? 600 : 400,
                }}
              >
                {mine && <span aria-hidden="true" className="size-[6px] rounded-full" style={{ background: c.mark }} />}
                {i.label}
              </a>
            );
          })}
        </nav>
        <div className="flex w-[264px] shrink-0 items-stretch gap-[8px]">
          <div className="min-w-0 flex-1">
            <SearchTrigger />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
