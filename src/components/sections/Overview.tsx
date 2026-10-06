import logo from '../../assets/logo-comfy-wizard.webp';
import { hero } from '../../content/copy';
import { links } from '../../content/links';
import { useHandbook } from '../../state/HandbookProvider';
import { Callout } from '../ui/Callout';
import { LinkedText } from '../ui/LinkedText';

/** Accent line that fades out to the right. The hero's poison drips hang from one. */
function TaperedRule({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-px w-full max-w-[520px] ${className}`}
      style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }}
    />
  );
}

function PoisonDrip() {
  return (
    <div className="relative mt-[22px] h-[18px] w-full max-w-[520px]" aria-hidden="true">
      <TaperedRule className="absolute left-0 top-0" />
      {[
        { left: '18%', cls: 'animate-drip' },
        { left: '56%', cls: 'animate-drip-slow' },
      ].map((d) => (
        <span
          key={d.left}
          className={`absolute top-0 ${d.cls}`}
          style={{
            left: d.left,
            width: 7,
            height: 8,
            background: 'var(--venom)',
            clipPath: 'polygon(50% 0%, 100% 62%, 78% 100%, 22% 100%, 0% 62%)',
          }}
        />
      ))}
    </div>
  );
}

/** A short signed note from the curator, so the page opens with a person, not a dashboard. */
function CuratorNote() {
  return (
    <aside className="panel self-start p-[20px]">
      <div className="flex items-center gap-[12px]">
        <img
          src={logo}
          alt=""
          width={44}
          height={44}
          className="size-[44px] shrink-0 rounded-[10px] border border-line object-contain p-[3px]"
        />
        <h2 className="t-card-sub text-ink">{hero.note.title}</h2>
      </div>
      <div className="mt-[14px] flex flex-col gap-[10px] text-[13.5px] leading-[1.65] text-prose">
        {hero.note.body.map((p) => (
          <p key={p}>
            <LinkedText text={p} links={{ 'Rank 1': links.rank1Logs }} />
          </p>
        ))}
      </div>
      <p className="mt-[14px] text-[13px] font-semibold text-mute">&ndash; {hero.note.sign}</p>
    </aside>
  );
}

export function Overview() {
  const { jump } = useHandbook();

  return (
    <section
      id="overview"
      aria-label="Overview"
      className="relative"
      style={{ padding: 'clamp(24px, 5.5vw, 58px) 0 10px' }}
    >
      <p className="relative text-[13.5px] text-faint">{hero.eyebrow}</p>

      <h1 className="relative mt-[18px]">
        <span className="t-h1 block text-ink">{hero.titleTop}</span>
        <span className="t-h1 block text-accent">
          {hero.titleBottom}
        </span>
      </h1>

      <div className="relative mt-[16px] max-w-[62ch]">
        <Callout tone="accent" label={hero.disclaimer.label}>
          {hero.disclaimer.before}
          <a
            href={links.discord}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-2"
          >
            {hero.disclaimer.link}
          </a>
          {hero.disclaimer.after}
        </Callout>
      </div>

      <PoisonDrip />

      <div className="mt-[26px] grid gap-[26px] hero:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div>
          <p className="t-lede text-lede">{hero.lede}</p>
          <p className="mt-[14px] max-w-[37em] text-[14.5px] leading-[1.6] text-mute">
            {hero.support.before}
            <a
              href={links.discord}
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              {hero.support.link}
            </a>
            {hero.support.after}
          </p>

          <div className="mt-[22px] flex flex-wrap gap-[10px]">
            <button
              type="button"
              onClick={() => jump('talents')}
              className="rounded-[8px] px-[16px] py-[11px] text-[13px] font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
            >
              {hero.ctaPrimary}
            </button>
            <button
              type="button"
              onClick={() => jump('forever')}
              className="rounded-[8px] border border-line px-[16px] py-[11px] text-[13px] font-semibold text-mute transition-colors hover:border-sky hover:text-sky"
            >
              {hero.ctaGhost}
            </button>
          </div>
        </div>

        <CuratorNote />
      </div>

      {/* Closes the overview before Meta Breakdown: same line as the hero's, no drips. */}
      <TaperedRule className="mt-[48px]" />
    </section>
  );
}
