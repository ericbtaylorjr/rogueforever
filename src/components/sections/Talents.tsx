import { useEffect, useState } from 'react';
import { leveling, specById, specDetail } from '../../content/content';
import { talents as copy } from '../../content/copy';
import type { LevelingPath, SpecId, TalentVariant } from '../../content/types';
import { hexA } from '../../lib/color';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { SegmentedTabs } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';

const TOTAL_POINTS = 51;

/** Tab ids share the page's tab namespace, so prefix them. */
const tabId = (id: string) => `build-${id}`;

/**
 * Point split, key talents and a calculator link for one build. Used for both
 * the level 60 and the leveling card. `total` is the points available at the
 * build's level; bars default to the build's own total.
 */
function BuildCard({
  title,
  variant,
  total,
}: {
  title: string;
  variant: TalentVariant;
  total?: number;
}) {
  const { tone } = useTheme();
  const points = total ?? variant.talents.reduce((n, t) => n + t.pts, 0);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [variant]);

  const trees = variant.talents;

  return (
    <div className="panel flex flex-col p-[18px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{title}</span>
      </div>

      <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
        {trees.map((t) => (
          <div key={t.name}>
            <div
              className="t-num text-[26px] leading-none"
              style={{ color: tone(t.color) }}
            >
              {t.pts}
            </div>
            <div className="mt-[6px] text-[11px] text-faint">{t.name}</div>
            <div
              className="mt-[8px] h-[4px] overflow-hidden rounded-full"
              style={{ background: 'rgba(var(--fg-rgb),.06)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: grown && points ? `${(t.pts / points) * 100}%` : '0%',
                  background: tone(t.color, 3),
                  transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <>
          <p className="mt-[16px] border-t border-line pt-[14px] text-[12.5px] leading-[1.6] text-mute">
            {variant.talentNote}
          </p>
          <ul className="mt-[12px] flex flex-1 flex-col gap-[8px]">
            {variant.keyTalents.map((k) => (
              <li key={k} className="flex items-baseline gap-[9px] text-[12.5px] leading-[1.5] text-prose">
                <span
                  aria-hidden="true"
                  className="mt-[6px] size-[4px] shrink-0 rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
                {k}
              </li>
            ))}
          </ul>
          {variant.link && (
            <a
              href={variant.link}
              target="_blank"
              rel="noreferrer"
              className="mt-[14px] text-[12.5px] font-semibold text-accent underline underline-offset-2"
            >
              {copy.calculator}
            </a>
          )}
      </>
    </div>
  );
}

const SHARD = 'polygon(42% 0, 100% 0, 100% 100%, 0 100%)';

/**
 * Card banner. Always a dark surface with light text in both themes, so spec
 * colours are used raw: a hard-cut colour shard on the right and a spec-coloured
 * edge along the bottom.
 */
function Banner({ path, tall = false }: { path: LevelingPath; tall?: boolean }) {
  const { color, color2 } = specById[path.spec];

  return (
    <div
      className={`relative overflow-hidden ${tall ? 'min-h-[120px] stack:min-h-full' : 'h-[96px]'}`}
      style={{ background: 'var(--hue-end)' }}
    >
      {/* An offset copy of the shard peeking out behind it, so the two cuts stay parallel. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[44%]"
        style={{ clipPath: SHARD, background: hexA(color, 0.5), transform: 'translateX(-14px)' }}
      />
      {/* The shard: angled cut on the leading edge, spec gradient inside. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-[44%]"
        style={{ clipPath: SHARD, background: `linear-gradient(160deg, ${color}, ${color2})` }}
      />
      {/* Lit bottom edge. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[2px]"
        style={{ background: color }}
      />

      <div className="relative flex h-full flex-col justify-end p-[14px] pb-[13px]">
        <span className="t-eyebrow text-[10.5px]" style={{ color }}>
          {path.tree}
        </span>
        <h3 className="t-card-title mt-[4px]" style={{ color: 'var(--on-hue)' }}>
          {path.name}
        </h3>
      </div>
    </div>
  );
}

/**
 * The active spec's leveling build (level 30 beta for now): spec banner beside why it
 * works and the talent calculator link. Renders nothing for a spec without one.
 */
function LevelingCard() {
  const { spec } = useHandbook();
  const [open, setOpen] = useState(false);
  const path = leveling.find((l) => l.spec === spec);
  if (!path) return null;
  const detailsId = `leveling-details-${spec}`;

  return (
    // Compact by default so several builds stack without a wall of text. The banner
    // stretches with the card, so opening the details reveals more of the graphic.
    <div className="panel grid overflow-hidden stack:grid-cols-[minmax(0,28%)_minmax(0,1fr)]">
      <Banner path={path} tall />
      <div className="flex flex-col p-[18px]">
        <div className="flex flex-wrap items-baseline justify-between gap-[10px]">
          <span className="t-panel-label text-ink">{copy.levelingTitle}</span>
          <span className="text-[12px] text-faint">{copy.levelingTag}</span>
        </div>

        <div
          id={detailsId}
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
          inert={!open}
        >
          <div className="overflow-hidden">
            <p className="mt-[10px] text-[13.5px] leading-[1.6] text-prose">{path.body}</p>
            <p className="mt-[8px] text-[12.5px] leading-[1.55] text-mute">{copy.levelingNote}</p>
          </div>
        </div>

        <div className="mt-[14px] flex flex-wrap items-center gap-x-[16px] gap-y-[8px]">
          {path.href ? (
            <a
              href={path.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-[8px] border border-line px-[14px] py-[9px] text-[12.5px] font-semibold text-mute transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
            >
              {copy.levelingCta} ↗
            </a>
          ) : (
            <p className="text-[12.5px] italic text-dim">{copy.levelingComingSoon}</p>
          )}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-[6px] text-[12.5px] font-semibold text-mute transition-colors hover:text-accent"
          >
            {open ? copy.readLess : copy.readMore}
            <svg
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="transition-transform duration-300"
              style={{ transform: open ? 'rotate(180deg)' : 'none' }}
            >
              <path d="M2.5 4.5 6 8l3.5-3.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Build tabs for specs with more than one level 60 build. */
function BuildPicker({
  variants,
  active,
  onPick,
}: {
  variants: TalentVariant[];
  active: TalentVariant;
  onPick: (id: string) => void;
}) {
  const { spec } = useHandbook();

  return (
    <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[8px]">
      <SegmentedTabs
        tabs={variants.map((v) => ({ id: tabId(v.id), label: v.name }))}
        value={tabId(active.id)}
        onChange={(id) => onPick(id.slice(tabId('').length))}
        label={`${copy.buildsLabel}: ${specById[spec].name}`}
      />
      <p className="basis-full text-[12.5px] leading-[1.55] text-mute">{active.niche}</p>
    </div>
  );
}

export function Talents() {
  const { spec } = useHandbook();
  const { tone } = useTheme();
  const [introBefore, introAfter] = copy.intro.split('{spec}');
  const { talentVariants } = specDetail[spec];
  // Remember the chosen build per spec, so flipping specs and back keeps your place.
  const [picked, setPicked] = useState<Partial<Record<SpecId, string>>>({});
  const active = talentVariants.find((v) => v.id === picked[spec]) ?? talentVariants[0];

  return (
    <section id="talents" aria-label="Talents">
      <SectionHeading id="talents" scope="spec" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute" aria-live="polite">
        {introBefore}
        {/* Same colour as the spec's dot in the Active Spec bar. */}
        <span className="font-semibold" style={{ color: tone(specById[spec].color) }}>
          {specById[spec].name}
        </span>
        {introAfter}
      </p>

      <div className="mt-[16px]">
        <LevelingCard />
      </div>

      <h3 className="t-card-sub mt-[28px] text-ink">{copy.endgameTitle}</h3>
      {active ? (
        <>
          {talentVariants.length > 1 && (
            <div className="mt-[12px]">
              <BuildPicker
                variants={talentVariants}
                active={active}
                onPick={(id) => setPicked((p) => ({ ...p, [spec]: id }))}
              />
            </div>
          )}
          <div
            className="mt-[12px]"
            id={`panel-${tabId(active.id)}`}
            role="tabpanel"
            aria-labelledby={`tab-${tabId(active.id)}`}
          >
            <BuildCard title={copy.endgameTitle} variant={active} total={TOTAL_POINTS} />
          </div>
        </>
      ) : (
        <p className="mt-[6px] max-w-[70ch] text-[13.5px] leading-[1.6] text-mute">{copy.endgamePending}</p>
      )}
    </section>
  );
}
