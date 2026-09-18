import { NavList } from './NavList';
import { SearchTrigger } from './SearchTrigger';
import { ThemeToggle } from './ThemeToggle';
import { SweatyLegend, Wordmark } from './Wordmark';

/** Fixed 262px rail, ≥1100px only. */
export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-[40] flex h-full w-[262px] flex-col"
      style={{
        background: 'linear-gradient(180deg, var(--rail-a), var(--rail-b))',
        borderRight: '1px solid var(--line)',
      }}
    >
      <div className="border-b border-line px-[20px] pb-[16px] pt-[20px]">
        <Wordmark />
        <div className="mt-[14px] flex items-stretch gap-[8px]">
          <div className="min-w-0 flex-1">
            <SearchTrigger />
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-[12px] py-[16px]">
        <NavList />
      </div>

      <div className="border-t border-line px-[20px] py-[14px]">
        <SweatyLegend />
      </div>
    </aside>
  );
}
