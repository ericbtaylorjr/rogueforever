import { footer as copy } from '../../content/copy';
import { links } from '../../content/links';
import { useHandbook } from '../../state/HandbookProvider';
import { RogueMark } from '../ui/RogueMark';

/**
 * A quiet sign-off. Who's behind the Handbook lives in Credits; the footer just
 * closes the page with thanks and a pointer back to Credits.
 */
export function Footer() {
  const { jump } = useHandbook();

  return (
    <footer className="mt-[52px] flex flex-wrap items-start justify-between gap-x-[40px] gap-y-[22px] border-t border-line pt-[26px]">
      <div className="flex min-w-0 max-w-[64ch] flex-1 basis-[320px] items-start gap-[14px]">
        <RogueMark size={30} />
        <div className="min-w-0">
          <div
            className="text-ink"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontStretch: '74%', fontSize: 15, lineHeight: 1.2 }}
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

    </footer>
  );
}
