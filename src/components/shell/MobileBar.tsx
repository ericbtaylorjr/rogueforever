import { shell } from '../../content/copy';
import { useCompendium } from '../../state/CompendiumProvider';
import { Wordmark } from './Wordmark';

/** Fixed 58px top bar, <1100px. */
export function MobileBar() {
  const { setDrawer, setSearchOpen, setQuery, drawer } = useCompendium();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-[45] flex h-[58px] items-center gap-[12px] border-b border-line px-[15px]"
      style={{ background: 'rgba(10,10,12,.95)', backdropFilter: 'blur(14px)' }}
    >
      <button
        type="button"
        aria-label={shell.openNav}
        aria-expanded={drawer}
        aria-controls="rc-drawer"
        onClick={() => setDrawer(true)}
        className="grid size-[44px] place-items-center rounded-[10px] border border-line text-mute"
      >
        <svg width="17" height="13" viewBox="0 0 17 13" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M1 1.5h15M1 6.5h15M1 11.5h11" />
          </g>
        </svg>
      </button>

      <div className="flex-1">
        <Wordmark size={28} />
      </div>

      <button
        type="button"
        aria-label={shell.openSearch}
        onClick={() => {
          setQuery('');
          setSearchOpen(true);
        }}
        className="grid size-[44px] place-items-center rounded-[10px] border border-line text-[16px] text-mute"
      >
        <span aria-hidden="true">⌕</span>
      </button>
    </header>
  );
}
