import { footer as copy } from '../../content/copy';
import { links, socialHref } from '../../content/links';

export function Footer() {
  return (
    <footer className="mt-[52px] grid gap-[26px] border-t border-line pt-[28px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,232px),1fr))]">
      <div>
        <div
          className="text-ink"
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontStretch: '74%',
            fontSize: 17,
          }}
        >
          {copy.brand}
        </div>
        <p className="mt-[10px] max-w-[42ch] text-[12.5px] leading-[1.6] text-faint">
          {copy.adFree.before}
          <a href={links.tip} className="text-accent underline underline-offset-2">
            {copy.adFree.link}
          </a>
          {copy.adFree.after}
        </p>
        <div className="mt-[14px] flex gap-[8px]">
          {copy.socials.map((s) => (
            <a
              key={s}
              href={socialHref[s]}
              aria-label={s}
              className="t-eyebrow grid size-[34px] place-items-center rounded-[8px] border border-line text-[9px] text-mute transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </a>
          ))}
        </div>
      </div>

      <div>
        <div className="t-eyebrow text-[9.5px] tracking-[.18em] text-faint">
          {copy.builtWithLabel}
        </div>
        <p className="mt-[10px] max-w-[42ch] text-[12.5px] leading-[1.6] text-faint">
          {copy.builtWith.before}
          <a href={links.discord} className="text-accent underline underline-offset-2">
            {copy.builtWith.link}
          </a>
          {copy.builtWith.after}
        </p>
      </div>

      <div>
        <div className="t-eyebrow text-[9.5px] tracking-[.18em] text-faint">
          {copy.shortcutsLabel}
        </div>
        <ul className="mt-[10px] flex flex-col gap-[8px]">
          {copy.shortcuts.map((s) => (
            <li key={s.key} className="flex items-center gap-[10px] text-[12px] text-faint">
              <span className="key-chip t-num">{s.key}</span>
              {s.what}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
