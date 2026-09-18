import { useEffect, useState } from 'react';
import { specById, specDetail } from '../../content/content';
import { talents as copy } from '../../content/copy';
import { useCompendium } from '../../state/CompendiumProvider';
import { Callout } from '../ui/Callout';
import { Droplet } from '../ui/Droplet';
import { SectionHeading } from '../ui/SectionHeading';

const TOTAL_POINTS = 51;

function TalentSplit() {
  const { spec } = useCompendium();
  const d = specDetail[spec];
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [spec]);

  return (
    <div className="panel flex flex-col p-[18px]">
      <span className="t-panel-label text-ink">{copy.splitTitle}</span>

      <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
        {d.talents.map((t) => (
          <div key={t.name}>
            <div className="t-num text-[26px] leading-none" style={{ color: t.color }}>
              {t.pts}
            </div>
            <div className="mt-[6px] text-[11px] text-faint">{t.name}</div>
            <div
              className="mt-[8px] h-[4px] overflow-hidden rounded-full"
              style={{ background: 'rgba(255,255,255,.06)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: grown ? `${(t.pts / TOTAL_POINTS) * 100}%` : '0%',
                  background: t.color,
                  transition: 'width .6s cubic-bezier(.2,.8,.2,1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-[16px] border-t border-line pt-[14px] text-[12.5px] leading-[1.6] text-mute">
        {d.talentNote}
      </p>

      <ul className="mt-[12px] flex flex-1 flex-col gap-[8px]">
        {d.keyTalents.map((k) => (
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
    </div>
  );
}

function WeaponCard() {
  const { spec, sweaty } = useCompendium();
  const d = specDetail[spec];

  return (
    <div className="panel flex flex-col p-[18px]">
      <div className="flex items-baseline justify-between gap-[10px]">
        <span className="t-panel-label text-ink">{copy.weaponsTitle}</span>
        <span className="t-eyebrow text-[9px] text-faint">{copy.skillCap}</span>
      </div>

      <div className="mt-[14px] flex flex-col">
        {d.weapons.map((w) => (
          <div key={w.slot} className="border-t border-line py-[12px] first:border-0 first:pt-0">
            <div className="t-eyebrow text-[9px] tracking-[.14em] text-faint">{w.slot}</div>
            <div className="mt-[5px] flex items-center gap-[8px]">
              <span className="text-[13.5px] font-semibold text-ink">{w.name}</span>
              {w.sweaty && sweaty && <Droplet />}
            </div>
            <div className="mt-[3px] text-[11.5px] leading-[1.5] text-faint">{w.why}</div>
          </div>
        ))}
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

export function Talents() {
  const { spec } = useCompendium();

  return (
    <section id="talents" aria-label="Talents and weapons">
      <SectionHeading id="talents" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute" aria-live="polite">
        {copy.intro.replace('{spec}', specById[spec].name)}
      </p>

      <div className="mt-[16px]">
        <Callout tone="accent" dashed label={copy.todoLabel}>
          {copy.todo.before}
          <strong className="font-semibold text-accent">{copy.todo.strong}</strong>
          {copy.todo.after}
        </Callout>
      </div>

      <div className="mt-[18px] grid gap-[14px] stack:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
        <TalentSplit />
        <WeaponCard />
      </div>
    </section>
  );
}
