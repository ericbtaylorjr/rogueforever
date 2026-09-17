import { NavList } from './NavList';
import { SearchTrigger } from './SearchTrigger';
import { SweatyLegend, Wordmark } from './Wordmark';

/** Fixed 262px rail, ≥1100px only. */
export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-[40] flex h-full w-[262px] flex-col"
      style={{
        background: 'linear-gradient(180deg, #101015, #0A0A0C)',
        borderRight: '1px solid rgba(255,255,255,.09)',
      }}
    >
      <div className="border-b border-line px-[20px] pb-[16px] pt-[20px]">
        <Wordmark />
        <div className="mt-[14px]">
          <SearchTrigger />
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
