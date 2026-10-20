import { useEffect, useMemo, useRef, useState } from 'react';
import { search } from '../../content/copy';
import { searchEntries } from '../../content/searchIndex';
import { track } from '../../lib/analytics';
import { useHandbook } from '../../state/HandbookProvider';

export function CommandPalette() {
  const { searchOpen, setSearchOpen, query, setQuery, jump } = useHandbook();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const [cursor, setCursor] = useState(0);

  const results = useMemo(() => searchEntries(query), [query]);

  /*
   * One GA4 `search` event per search that had a term, sent when the palette closes: what was
   * typed, how many results it found, and what was picked ('' if nothing was). GA reads
   * `search_term` into its built-in search terms report.
   */
  const searchRef = useRef({ term: '', results: 0, picked: '', position: 0 });
  searchRef.current.term = query.trim();
  searchRef.current.results = results.length;
  useEffect(() => {
    if (!searchOpen) return;
    searchRef.current.picked = '';
    searchRef.current.position = 0;
    return () => {
      const s = searchRef.current;
      if (!s.term) return;
      track('search', {
        search_term: s.term,
        results: s.results,
        picked: s.picked,
        ...(s.picked && { position: s.position }),
      });
    };
  }, [searchOpen]);
  const pick = (i: number) => {
    searchRef.current.picked = results[i].id;
    searchRef.current.position = i + 1;
    jump(results[i].id);
  };

  useEffect(() => setCursor(0), [query]);

  useEffect(() => {
    if (!searchOpen) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => {
      // Leave focus alone if a jump already moved it into the page.
      if (!document.activeElement || document.activeElement === document.body) {
        restoreTo.current?.focus?.();
      }
    };
  }, [searchOpen]);

  // Keep the highlighted row in view when arrowing through a long list.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-cursor="true"]')?.scrollIntoView({
      block: 'nearest',
    });
  }, [cursor]);

  const optionId = (i: number) => `rc-search-opt-${i}`;
  const status =
    results.length === 0
      ? search.empty
      : `${results.length} result${results.length === 1 ? '' : 's'}`;

  if (!searchOpen) return null;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter' && results[cursor]) {
      e.preventDefault();
      pick(cursor);
    } else if (e.key === 'Tab') {
      // Nothing else in here is focusable; keep focus on the input.
      e.preventDefault();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex justify-center px-[14px]"
      style={{
        background: 'var(--scrim)',
        backdropFilter: 'blur(6px)',
        paddingTop: 'min(9vh, 60px)',
      }}
      onClick={() => setSearchOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={search.placeholder}
        className="h-fit w-full max-w-[620px] animate-rise overflow-hidden rounded-[14px] border border-line"
        style={{ background: 'var(--surface-pop)', boxShadow: 'var(--palette-shadow)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-[10px] border-b border-line px-[16px] py-[13px] focus-within:shadow-[inset_0_-2px_0_var(--accent)]">
          <span aria-hidden="true" className="text-[15px] text-faint">⌕</span>
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls="rc-search-list"
            aria-autocomplete="list"
            aria-activedescendant={results[cursor] ? optionId(cursor) : undefined}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={search.placeholder}
            aria-label={search.placeholder}
            className="flex-1 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-dim"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="key-chip t-num transition-colors hover:text-mute"
          >
            ESC
          </button>
        </div>

        <div role="status" aria-live="polite" className="sr-only">
          {status}
        </div>

        <div
          ref={listRef}
          id="rc-search-list"
          role="listbox"
          aria-label={search.placeholder}
          className="overflow-y-auto"
          style={{ maxHeight: 'min(58vh, 440px)' }}
        >
          {results.length === 0 ? (
            <p aria-hidden="true" className="px-[16px] py-[22px] text-[13px] text-faint">
              {search.empty}
            </p>
          ) : (
            results.map((r, i) => (
              <a
                key={`${r.kind}-${r.label}-${i}`}
                id={optionId(i)}
                role="option"
                aria-selected={i === cursor}
                tabIndex={-1}
                href={`#${r.id}`}
                data-cursor={i === cursor}
                onMouseMove={() => setCursor(i)}
                onClick={(e) => {
                  e.preventDefault();
                  pick(i);
                }}
                className="flex items-center gap-[12px] px-[16px] py-[9px] transition-colors"
                style={{ background: i === cursor ? 'var(--panel2)' : 'transparent' }}
              >
                <span className="t-eyebrow w-[78px] shrink-0 text-[10.5px] text-faint">
                  {r.kind}
                </span>
                <span className="flex-1 truncate text-[13.5px] text-ink">{r.label}</span>
                <span className="shrink-0 text-[11px] text-faint">{r.section}</span>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
