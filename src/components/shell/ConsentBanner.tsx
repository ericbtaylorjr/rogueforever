import { useEffect, useRef } from 'react';
import { config } from '../../config';
import { consent as copy } from '../../content/copy';
import { links } from '../../content/links';
import { closeConsentReview, setConsent, useConsent, type ConsentChoice } from '../../lib/analytics';
import { useHandbook } from '../../state/HandbookProvider';
import murloc from '../../assets/murloc.webp';
import { RogueMark } from '../ui/RogueMark';

/** Murloc art is 611×520, 2× its display size. */
const FIGURE = { width: 282, height: 240 };

const button =
  'min-h-[40px] flex-1 basis-[140px] rounded-[8px] border px-[14px] py-[9px] text-center text-[13px] font-semibold transition-colors';

/**
 * Cookie consent, styled as one of the Handbook's own cards: the panel surface, the dagger
 * slash from the section dividers, the Rogue mark. Not a modal — the page stays usable, and
 * nothing from Google loads until "Allow". Both answers get the same size and weight.
 * Reopened from the footer, it says what's currently chosen and takes focus.
 *
 * The murloc is flavour only: hidden from assistive tech, ignores the pointer, and laid out
 * so it never covers text or a button label. On desktop it stands in a right-hand gutter the
 * copy doesn't enter, its spear crossing only the end of "Allow" (the button row stops short
 * of it). Phones get no murloc: there's no room beside the copy, and standing on the card's
 * top edge it would cover the page text behind it.
 */
export function ConsentBanner() {
  const { choice, reviewing, open } = useConsent();
  const { setPrivacyOpen } = useHandbook();
  const card = useRef<HTMLElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  // A reopened banner was asked for, so it takes focus; a first-visit one doesn't steal it.
  useEffect(() => {
    if (!reviewing) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    card.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeConsentReview();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      returnTo.current?.focus();
    };
  }, [reviewing]);

  if (!open) return null;

  const railNav = config.navLayout === 'sidebar';
  const choose = (c: ConsentChoice) => () => setConsent(c);

  return (
    <section
      ref={card}
      tabIndex={-1}
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
      // Inset from the edges by the page gutter (see Shell); from 1100px it's a 720px card
      // beside the nav. Past phones, 180px on the right stays clear for the murloc.
      className={`consent-card panel fixed inset-x-[12px] bottom-[calc(12px+env(safe-area-inset-bottom,0px))] z-[50] px-[16px] pt-[18px] pb-[16px] outline-hidden animate-rise sm:inset-x-[22px] sm:bottom-[calc(24px+env(safe-area-inset-bottom,0px))] sm:pt-[20px] sm:pr-[180px] sm:pb-[18px] sm:pl-[22px] rail:right-auto ${
        railNav
          ? 'rail:left-[calc(var(--rail-w)+30px)] rail:w-[min(720px,calc(100vw-var(--rail-w)-60px))]'
          : 'rail:left-[30px] rail:w-[min(720px,calc(100vw-60px))]'
      }`}
    >
      {/* The section divider's dagger slash, so the card reads as part of the page. */}
      <span aria-hidden="true" className="consent-slash" />

      {/* Lazy, so a phone, where it's hidden, never downloads it. */}
      <img
        src={murloc}
        alt=""
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        width={FIGURE.width}
        height={FIGURE.height}
        className="consent-figure pointer-events-none absolute right-[6px] bottom-[8px] select-none max-sm:hidden"
      />

      <div className="flex items-start gap-[12px]">
        <RogueMark size={28} />
        <div className="min-w-0 flex-1">
          <h2
            id="consent-title"
            className="text-ink"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, lineHeight: 1.3 }}
          >
            {copy.title}
          </h2>
          <p id="consent-body" className="mt-[6px] text-[13px] leading-[1.6] text-prose">
            {copy.body}{' '}
            <a
              href={links.googleAnalyticsData}
              target="_blank"
              rel="noreferrer"
              className="text-mute underline decoration-line underline-offset-2 transition-colors hover:text-accent"
            >
              {copy.learnMore}
            </a>
            <span className="mx-[6px] text-dim" aria-hidden="true">
              ·
            </span>
            <a
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                setPrivacyOpen(true);
              }}
              className="text-mute underline decoration-line underline-offset-2 transition-colors hover:text-accent"
            >
              {copy.privacy}
            </a>
          </p>
          {reviewing && choice && <p className="mt-[8px] text-[12.5px] text-faint">{copy.current[choice]}</p>}
        </div>
        {reviewing && (
          <button
            type="button"
            onClick={closeConsentReview}
            aria-label={copy.close}
            title={copy.close}
            className="-mr-[6px] -mt-[4px] grid size-[32px] shrink-0 place-items-center rounded-[8px] text-faint transition-colors hover:text-accent"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {/* Stops short of the spear on desktop so it only crosses the end of "Allow", never its label. */}
      <div className="mt-[16px] flex flex-wrap gap-[10px] sm:max-w-[448px]">
        <button
          type="button"
          onClick={choose('denied')}
          aria-pressed={reviewing ? choice === 'denied' : undefined}
          className={`${button} border-line text-ink hover:border-accent hover:bg-accent-dim hover:text-accent`}
          style={{ background: 'var(--surface-deep)' }}
        >
          {copy.decline}
        </button>
        <button
          type="button"
          onClick={choose('granted')}
          aria-pressed={reviewing ? choice === 'granted' : undefined}
          className={`${button} border-accent bg-accent text-accent-ink hover:brightness-110`}
        >
          {copy.accept}
        </button>
      </div>
    </section>
  );
}
