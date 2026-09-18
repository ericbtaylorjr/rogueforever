import { search } from '../../content/copy';
import { useCompendium } from '../../state/CompendiumProvider';

export function SearchTrigger() {
  const { setSearchOpen, setQuery } = useCompendium();
  return (
    <button
      type="button"
      onClick={() => {
        setQuery('');
        setSearchOpen(true);
      }}
      className="group flex w-full items-center gap-[9px] rounded-[8px] border border-line px-[10px] py-[8px] text-[12.5px] text-faint transition-colors hover:text-mute"
      style={{ background: 'var(--surface-deep)' }}
    >
      <span aria-hidden="true" className="text-[13px]">⌕</span>
      <span className="flex-1 text-left">{search.trigger}</span>
      <span className="key-chip t-num">⌘K</span>
    </button>
  );
}
