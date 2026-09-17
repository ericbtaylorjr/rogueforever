import { useEffect, useRef } from 'react';
import { shell } from '../../content/copy';
import { useCompendium } from '../../state/CompendiumProvider';
import { NavList } from './NavList';
import { SweatyLegend, Wordmark } from './Wordmark';

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export function Drawer() {
  const { drawer, setDrawer } = useCompendium();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!drawer) return;
    restoreTo.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    // Focus trap.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panel) return;
      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      restoreTo.current?.focus?.();
    };
  }, [drawer]);

  if (!drawer) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[55]"
        style={{ background: 'rgba(4,4,6,.74)', backdropFilter: 'blur(4px)' }}
        onClick={() => setDrawer(false)}
        aria-hidden="true"
      />
      <div
        id="rc-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sections"
        className="fixed left-0 top-0 z-[56] flex h-full flex-col animate-slide-in"
        style={{
          width: 'min(86vw, 300px)',
          background: 'linear-gradient(180deg, #101015, #0A0A0C)',
          borderRight: '1px solid rgba(255,255,255,.09)',
        }}
      >
        <div className="flex items-center gap-[12px] border-b border-line px-[16px] py-[14px]">
          <div className="flex-1">
            <Wordmark size={28} />
          </div>
          <button
            type="button"
            aria-label={shell.closeNav}
            onClick={() => setDrawer(false)}
            className="grid size-[44px] place-items-center rounded-[10px] border border-line text-[15px] text-mute"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-[10px] py-[14px]">
          <NavList size="touch" />
        </div>

        <div className="border-t border-line px-[16px] py-[14px]">
          <SweatyLegend />
        </div>
      </div>
    </>
  );
}
