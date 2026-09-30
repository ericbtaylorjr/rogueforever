import { useEffect, useId, useRef, type ReactNode } from 'react';

/**
 * Native <dialog> modal. showModal() gives us the top layer, focus trapping,
 * Esc-to-close and focus restore for free; we add backdrop-click and scroll lock.
 */
export function Modal({
  open,
  onClose,
  title,
  closeLabel,
  size = 'md',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel: string;
  size?: 'md' | 'xl';
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the dialog element itself (not its content) is a backdrop click.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className={`m-auto w-[calc(100%-32px)] animate-rise overflow-hidden rounded-[14px] border border-line p-0 text-ink backdrop:bg-[var(--scrim)] backdrop:backdrop-blur-[6px] ${
        size === 'xl' ? 'max-w-[1200px]' : 'max-w-[560px]'
      }`}
      style={{ background: 'var(--surface-pop)', boxShadow: 'var(--palette-shadow)' }}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-32px)] flex-col">
          <div className="flex items-center justify-between gap-[12px] border-b border-line px-[18px] py-[13px]">
            <h2 id={titleId} className="t-panel-label text-ink">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="key-chip t-num transition-colors hover:text-mute"
            >
              ESC
            </button>
          </div>
          <div className="overflow-y-auto">{children}</div>
        </div>
      )}
    </dialog>
  );
}
