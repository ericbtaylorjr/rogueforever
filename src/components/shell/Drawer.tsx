import { useLayoutEffect, useRef } from 'react';
import { shell } from '../../content/copy';
import { useHandbook } from '../../state/HandbookProvider';
import { NavList } from './NavList';
import { SweatyLegend, Wordmark } from './Wordmark';

/**
 * The section nav below 1100px, as a native modal <dialog>: showModal() puts it in the top
 * layer, makes the page behind it inert, closes on Esc and hands focus back on close. Its
 * contents only render while it's open, so the nav isn't in the page twice.
 */
export function Drawer() {
  const { drawer, setDrawer } = useHandbook();
  const ref = useRef<HTMLDialogElement>(null);

  // A layout effect, so a nav jump that closes the drawer has it closed before focus moves.
  useLayoutEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (drawer && !d.open) d.showModal();
    if (!drawer && d.open) d.close();
  }, [drawer]);

  return (
    <dialog
      ref={ref}
      id="rc-drawer"
      aria-label="Sections"
      onClose={() => setDrawer(false)}
      // A click on the dialog element itself (not its content) is a backdrop click.
      onClick={(e) => e.target === e.currentTarget && setDrawer(false)}
      className="fixed inset-y-0 left-0 m-0 h-full max-h-none w-[min(86vw,300px)] max-w-none animate-slide-in flex-col overflow-hidden border-0 border-r border-line p-0 text-ink open:flex backdrop:bg-[var(--scrim-soft)] backdrop:backdrop-blur-[4px]"
      style={{ background: 'linear-gradient(180deg, var(--rail-a), var(--rail-b))' }}
    >
      {drawer && (
        <>
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
        </>
      )}
    </dialog>
  );
}
