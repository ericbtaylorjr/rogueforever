import { useEffect, useState } from 'react';
import { specById, specDetail } from '../../content/content';
import { talents as copy } from '../../content/copy';
import type { SpecId, TalentVariant } from '../../content/types';
import { useHandbook } from '../../state/HandbookProvider';
import { useTheme } from '../../state/ThemeProvider';
import { Callout } from '../ui/Callout';
import { Droplet } from '../ui/Droplet';
import { SegmentedTabs } from '../ui/Pill';
import { SectionHeading } from '../ui/SectionHeading';

const TOTAL_POINTS = 51;

/** Tab ids share the page's tab namespace, so prefix them. */
const tabId = (id: string) => `build-${id}`;

/** Grey stand-in bar used by every "coming soon" state in this section. */
function GhostBar({ width = '100%' }: { width?: string }) {
  return (
    <div
      aria-hidden="true"
      className="h-[10px] rounded-full"
      style={{
        width,
        background:
          'repeating-linear-gradient(135deg, rgba(var(--fg-rgb),.07) 0 2px, transparent 2px 6px)',
      }}
    />
  );
}

function TalentSplit({ variant }: { variant: TalentVariant | undefined }) {
  const { tone } = useTheme();
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [variant]);

  // Until a build exists, show the three trees with no points so the intent reads.
  const trees = variant?.talents ?? copy.trees.map((name) => ({ name, pts: 0, color: '' }));

  return (
    <div className="panel flex flex-col p-[18px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{copy.splitTitle}</span>
        {!variant && <span className="t-eyebrow text-[9px] text-faint">{copy.tbd}</span>}
      </div>

      <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
        {trees.map((t) => (
          <div key={t.name}>
            <div
              className="t-num text-[26px] leading-none"
              style={{ color: variant ? tone(t.color) : 'var(--dim)' }}
            >
              {variant ? t.pts : '—'}
            </div>
            <div className="mt-[6px] text-[11px] text-faint">{t.name}</div>
            <div
              className="mt-[8px] h-[4px] overflow-hidden rounded-full"
              style={{ background: 'rgba(var(--fg-rgb),.06)' }}
            >
              {variant && (
                <div
                  className="h-full rounded-full"
                  style={{
                    width: grown ? `${(t.pts / TOTAL_POINTS) * 100}%` : '0%',
                    background: tone(t.color, 3),
                    transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {variant ? (
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
      ) : (
        <div className="mt-[16px] flex flex-1 flex-col gap-[10px] border-t border-line pt-[14px]">
          <p className="text-[12.5px] italic text-dim">{copy.keyTalentsPending}</p>
          <GhostBar width="82%" />
          <GhostBar width="64%" />
          <GhostBar width="73%" />
        </div>
      )}
    </div>
  );
}

function WeaponCard() {
  const { spec, sweaty } = useHandbook();
  const { weapons } = specDetail[spec];

  return (
    <div className="panel flex flex-col p-[18px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{copy.weaponsTitle}</span>
        {!weapons.length && <span className="t-eyebrow text-[9px] text-faint">{copy.tbd}</span>}
      </div>

      <div className="mt-[14px] flex flex-col">
        {weapons.length
          ? weapons.map((w) => (
              <div key={w.slot} className="border-t border-line py-[12px] first:border-0 first:pt-0">
                <div className="t-eyebrow text-[9px] tracking-[.14em] text-faint">{w.slot}</div>
                <div className="mt-[5px] flex items-center gap-[8px]">
                  <span className="text-[13.5px] font-semibold text-ink">{w.name}</span>
                  {w.sweaty && sweaty && <Droplet />}
                </div>
                <div className="mt-[3px] text-[11.5px] leading-[1.5] text-faint">{w.why}</div>
              </div>
            ))
          : copy.weaponSlots.map((slot) => (
              <div key={slot} className="border-t border-line py-[12px] first:border-0 first:pt-0">
                <div className="t-eyebrow text-[9px] tracking-[.14em] text-faint">{slot}</div>
                <div className="mt-[8px]">
                  <GhostBar width="58%" />
                </div>
              </div>
            ))}
        {!weapons.length && <p className="mt-[4px] text-[12px] italic text-dim">{copy.weaponsPending}</p>}
      </div>

      <div className="mt-auto pt-[14px]">
        <Callout tone="sky">
          {copy.foreverCallout.before}
          <strong className="font-semibold text-sky">{copy.foreverCallout.strong}</strong>
          {copy.foreverCallout.after}
        </Callout>
      </div>
    </div>
  );
}

/** Build tabs, or a disabled stand-in showing where they will go. */
function BuildPicker({
  variants,
  active,
  onPick,
}: {
  variants: TalentVariant[];
  active: TalentVariant | undefined;
  onPick: (id: string) => void;
}) {
  const { tone } = useTheme();
  const { spec } = useHandbook();

  return (
    <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[8px]">
      <span className="t-eyebrow text-[9.5px] tracking-[.18em] text-faint">{copy.buildsLabel}</span>
      {variants.length ? (
        <SegmentedTabs
          tabs={variants.map((v) => ({ id: tabId(v.id), label: v.name }))}
          value={tabId(active!.id)}
          onChange={(id) => onPick(id.slice(tabId('').length))}
          label={`${copy.buildsLabel}: ${specById[spec].name}`}
        />
      ) : (
        <span
          className="flex items-center gap-[8px] rounded-[10px] border border-dashed border-line px-[14px] py-[9px] text-[12.5px] font-semibold text-dim"
        >
          <span
            aria-hidden="true"
            className="size-[7px] rounded-full"
            style={{ background: tone(specById[spec].color, 3) }}
          />
          {copy.buildsPending}
        </span>
      )}
      <p className="basis-full text-[12.5px] leading-[1.55] text-mute">
        {active ? active.niche : copy.buildsPendingNote}
      </p>
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
      <SectionHeading id="talents" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute" aria-live="polite">
        {introBefore}
        {/* Same colour as the spec's dot in the Active Spec bar. */}
        <span className="font-semibold" style={{ color: tone(specById[spec].color) }}>
          {specById[spec].name}
        </span>
        {introAfter}
      </p>

      <div className="mt-[16px]">
        <Callout tone="accent" dashed label={copy.todoLabel}>
          {copy.todo}
        </Callout>
      </div>

      <div className="mt-[18px]">
        <BuildPicker
          variants={talentVariants}
          active={active}
          onPick={(id) => setPicked((p) => ({ ...p, [spec]: id }))}
        />
      </div>

      <div
        className="mt-[14px] grid gap-[14px] stack:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]"
        {...(active
          ? { id: `panel-${tabId(active.id)}`, role: 'tabpanel', 'aria-labelledby': `tab-${tabId(active.id)}` }
          : {})}
      >
        <TalentSplit variant={active} />
        <WeaponCard />
      </div>
    </section>
  );
}
