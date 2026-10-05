import logo from '../../assets/logo-comfy-wizard.webp';
import { contributors, credits as copy, socialMeta } from '../../content/copy';
import { isPlaceholder, links } from '../../content/links';
import { MailIcon, PhoneIcon, TvIcon, VideoIcon } from '../ui/SocialIcons';
import { SectionHeading } from '../ui/SectionHeading';
import { useTooltip } from '../ui/Tooltip';

const socialIcon = { YT: VideoIcon, TT: PhoneIcon, TWITCH: TvIcon, MAIL: MailIcon } as const;

type Contributor = (typeof contributors)[number];

/** The community block: who the Handbook is credited to, and a way in. */
function Community() {
  return (
    <div className="panel p-[20px] sm:p-[24px]">
      <h3 className="t-card-title text-ink">{copy.community.title}</h3>
      <div className="mt-[12px] flex max-w-[72ch] flex-col gap-[10px]">
        {copy.community.body.map((p) => (
          <p key={p} className="text-[13.5px] leading-[1.65] text-prose">
            {p}
          </p>
        ))}
      </div>
      <a
        href={links.discord}
        target="_blank"
        rel="noreferrer"
        className="mt-[18px] inline-flex items-center gap-[9px] rounded-[8px] px-[18px] py-[11px] text-[13px] font-semibold transition-opacity hover:opacity-90"
        style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 01-11.8 7L4 20l1.1-4.6A8 8 0 1121 12z" />
        </svg>
        {copy.community.cta}
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

/** Logo for the curator, initials on a tinted tile for everyone else (placeholders for now). */
function Avatar({ c }: { c: Contributor }) {
  if (c.logo) {
    return (
      <span className="grid size-[56px] shrink-0 place-items-center rounded-[12px] border border-line">
        <img src={logo} alt="" width={46} height={46} loading="lazy" className="size-[46px] object-contain" />
      </span>
    );
  }
  const initials = c.name.replace(/^The/, '').trim().slice(0, 2).toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="grid size-[56px] shrink-0 place-items-center rounded-[12px] border border-line text-[17px] text-mute"
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        background: 'linear-gradient(150deg, rgba(var(--fg-rgb),.07), rgba(var(--fg-rgb),.02))',
      }}
    >
      {initials}
    </span>
  );
}

function ContributorCard({ c }: { c: Contributor }) {
  const { bind } = useTooltip();
  return (
    <article className="panel flex flex-col p-[16px]">
      <div className="flex items-center gap-[13px]">
        <Avatar c={c} />
        <div className="min-w-0">
          <h4
            className="truncate text-ink"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}
          >
            {c.name}
          </h4>
          <span className="t-eyebrow mt-[3px] block text-[10.5px] text-faint">{c.role}</span>
        </div>
      </div>

      <p className="mt-[12px] flex-1 text-[12.5px] leading-[1.6] text-mute">
        {c.bio}
      </p>

      <div className="mt-[14px] flex gap-[8px]">
        {c.socials.map((s) => {
          const Icon = socialIcon[s.kind];
          const name = socialMeta[s.kind].name;
          // Email reads better as the address itself than "X on Email".
          const label = s.href.startsWith('mailto:') ? `Email ${s.href.slice('mailto:'.length)}` : `${c.name} on ${name}`;
          return isPlaceholder(s.href) ? (
            <span
              key={s.kind}
              role="img"
              aria-label={`${label}: ${copy.linkPending}`}
              className="grid size-[34px] place-items-center rounded-[8px] border border-dashed border-line text-dim"
              {...bind({ name, note: copy.linkPending })}
            >
              <Icon size={16} />
            </span>
          ) : (
            <a
              key={s.kind}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="grid size-[34px] place-items-center rounded-[8px] border border-line text-mute transition-colors hover:border-accent hover:text-accent"
              {...bind({ name, note: label })}
            >
              <Icon size={16} />
            </a>
          );
        })}
      </div>
    </article>
  );
}

export function Credits() {
  return (
    <section id="credits" aria-label="Credits">
      <SectionHeading id="credits" />

      <Community />

      <h3 className="t-card-title mt-[30px] text-ink">{copy.contributorsTitle}</h3>
      <p className="mt-[6px] text-[13px] text-mute">{copy.contributorsIntro}</p>
      <div className="mt-[14px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr))]">
        {contributors.map((c) => (
          <ContributorCard key={c.name} c={c} />
        ))}
      </div>
    </section>
  );
}
