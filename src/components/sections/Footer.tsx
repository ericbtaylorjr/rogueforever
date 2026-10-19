import { footer as copy } from '../../content/copy';
import { links } from '../../content/links';
import { analyticsConfigured, reviewConsent } from '../../lib/analytics';
import { useHandbook } from '../../state/HandbookProvider';
import { RogueMark } from '../ui/RogueMark';

/**
 * A quiet sign-off. Who's behind the Handbook lives in Credits; the footer just
 * closes the page with thanks, a pointer back to Credits and the keyboard shortcuts.
 * The bottom bar carries the fan-project disclaimer and the privacy links.
 */
export function Footer() {
  const { jump, setPrivacyOpen } = useHandbook();
  const legalLink =
    'text-[12.5px] text-mute underline decoration-line underline-offset-2 transition-colors hover:text-accent';

  return (
    <footer className="mt-[52px] border-t border-line pt-[26px]">
      <div className="flex flex-wrap items-start justify-between gap-x-[40px] gap-y-[22px]">
        <div className="flex min-w-0 max-w-[64ch] flex-1 basis-[320px] items-start gap-[14px]">
          <RogueMark size={30} />
          <div className="min-w-0">
            <div
              className="text-ink"
              style={{ fontFamily: 'var(--font-brand)', fontWeight: 900, fontStretch: '74%', fontSize: 15, lineHeight: 1.2 }}
            >
              {copy.brand}
            </div>
            <p className="mt-[6px] text-[12.5px] leading-[1.65] text-faint">
              {copy.closing.before}
              <a
                href="#credits"
                onClick={(e) => {
                  e.preventDefault();
                  jump('credits');
                }}
                className="text-mute underline decoration-line underline-offset-2 transition-colors hover:text-accent"
              >
                {copy.closing.curator}
              </a>
              {copy.closing.after}
              {copy.tip.before}
              <a
                href={links.tip}
                target="_blank"
                rel="noreferrer"
                className="text-accent underline underline-offset-2"
              >
                {copy.tip.link}
              </a>
              {copy.tip.after}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <h2 className="text-[12.5px] font-semibold text-mute">{copy.shortcutsLabel}</h2>
          <ul className="mt-[10px] flex flex-col gap-[8px]">
            {copy.shortcuts.map((s) => (
              <li key={s.key} className="flex items-center gap-[10px] text-[12.5px] text-faint">
                <kbd className="key-chip">{s.key}</kbd>
                {s.what}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-[26px] flex flex-wrap items-end justify-between gap-x-[40px] gap-y-[14px] border-t border-line pt-[18px]">
        <div className="min-w-0 max-w-[80ch] flex-1 basis-[320px]">
          <p className="text-[13px] font-semibold leading-[1.55] text-mute">{copy.disclaimer}</p>
          <p className="mt-[4px] text-[11.5px] leading-[1.6] text-dim">{copy.trademark}</p>
        </div>
        <div className="flex shrink-0 items-center gap-[16px]">
          <a
            href="#privacy"
            onClick={(e) => {
              e.preventDefault();
              setPrivacyOpen(true);
            }}
            className={legalLink}
          >
            {copy.privacyPolicy}
          </a>
          {analyticsConfigured && (
            <button type="button" onClick={reviewConsent} className={legalLink}>
              {copy.cookieSettings}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
