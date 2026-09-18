import { nav } from '../../content/content';
import { useCompendium } from '../../state/CompendiumProvider';
import { SearchTrigger } from './SearchTrigger';
import { Wordmark } from './Wordmark';

/**
 * `navLayout: 'topTabs'` variant, ≥1100px only — below that the shell always
 * falls back to the drawer. Not the recommended ship configuration.
 */
export function TopTabs() {
  const { active, jump } = useCompendium();
  const items = nav.flatMap((g) => g.items);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-[40] border-b border-line"
      style={{ background: 'rgba(10,10,12,.95)', backdropFilter: 'blur(14px)' }}
    >
      <div className="mx-auto flex max-w-[1420px] items-center gap-[18px] px-[30px] py-[12px]">
        <Wordmark size={28} />
        <nav aria-label="Sections" className="flex flex-1 gap-[2px] overflow-x-auto">
          {items.map((i) => {
            const on = active === i.id;
            return (
              <a
                key={i.id}
                href={`#${i.id}`}
                aria-current={on ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  jump(i.id);
                }}
                className="whitespace-nowrap rounded-[7px] px-[10px] py-[7px] text-[13px] transition-colors"
                style={{
                  background: on ? 'rgba(255,244,104,.1)' : 'transparent',
                  color: on ? 'var(--accent)' : 'var(--mute)',
                  fontWeight: on ? 600 : 400,
                }}
              >
                {i.label}
              </a>
            );
          })}
        </nav>
        <div className="w-[220px] shrink-0">
          <SearchTrigger />
        </div>
      </div>
    </header>
  );
}
