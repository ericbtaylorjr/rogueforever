import { useEffect, useMemo, useState } from 'react';
import { gathering as copy } from '../../content/copy';
import { track } from '../../lib/analytics';
import { SKILL_CAP, type GatherProfession } from '../../lib/gathering';
import { Modal } from '../ui/Modal';

type Data = typeof import('../../content/gathering.json');
type Zone = Data['zones'][number];
/** One profession's numbers in one zone. */
type Summary = NonNullable<Zone[GatherProfession]>;

const PROFESSIONS: GatherProfession[] = ['herbalism', 'mining', 'skinning'];
const name = (p: GatherProfession) => copy.professions[p];

/** One zone's numbers for the picked professions; `null` for a profession with no nodes there. */
const summarise = (zone: Zone, picked: GatherProfession[]) =>
  picked.map((p): { profession: GatherProfession; summary: Summary | null } => ({ profession: p, summary: zone[p] }));

/** How a zone reads in the list: "Barrens (Herbalism 1–185, Mining 1–125)". */
function zoneLabel(zone: Zone, picked: GatherProfession[]) {
  const parts = summarise(zone, picked).map(({ profession, summary }) =>
    summary ? `${name(profession)} ${summary.min}–${summary.max}` : copy.none(name(profession)),
  );
  return `${zone.name} (${parts.join(', ')})`;
}

/** Zones that have something for the picked professions, easiest first by the higher of the two maximums. */
function zonesFor(data: Data, picked: GatherProfession[]): Zone[] {
  const hardest = (z: Zone) => Math.max(0, ...summarise(z, picked).map((s) => s.summary?.max ?? 0));
  return data.zones
    .filter((z) => summarise(z, picked).some((s) => s.summary))
    .sort((a, b) => hardest(a) - hardest(b) || a.name.localeCompare(b.name));
}

/** A 0–300 track: solid where this zone reliably raises your skill, faint where a skill-up is still possible. */
function SkillBar({ summary, profession }: { summary: Summary; profession: GatherProfession }) {
  const pct = (n: number) => `${(n / SKILL_CAP) * 100}%`;
  return (
    <div className="mt-[14px]">
      <div
        role="img"
        aria-label={copy.barLabel(name(profession), summary.min, summary.levelsTo, summary.lastSkillUp)}
        className="relative h-[8px] rounded-full"
        style={{ background: 'var(--accent-dim)' }}
      >
        <span
          className="absolute inset-y-0 rounded-full"
          style={{ left: pct(summary.min), width: `calc(${pct(summary.lastSkillUp)} - ${pct(summary.min)})`, background: 'var(--accent)', opacity: 0.4 }}
        />
        <span
          className="absolute inset-y-0 rounded-full"
          style={{ left: pct(summary.min), width: `calc(${pct(summary.levelsTo)} - ${pct(summary.min)})`, background: 'var(--accent)' }}
        />
      </div>
      <div aria-hidden="true" className="t-num mt-[5px] flex justify-between text-[10.5px] text-mute">
        <span>0</span>
        <span>150</span>
        <span>{SKILL_CAP}</span>
      </div>
    </div>
  );
}

function ProfessionCard({ profession, summary }: { profession: GatherProfession; summary: Summary | null }) {
  return (
    <section className="rounded-[12px] border border-line p-[16px]" style={{ background: 'var(--accent-dim)' }}>
      <h3 className="t-card-title text-accent">{name(profession)}</h3>
      {summary ? (
        <>
          <dl className="mt-[12px] grid grid-cols-2 gap-[12px]">
            <div>
              <dt className="text-[11.5px] font-semibold text-mute">{copy.minimum}</dt>
              <dd className="t-num mt-[2px] text-[26px] leading-none font-semibold text-ink">{summary.min}</dd>
              <dd className="mt-[4px] text-[11.5px] text-mute">{profession === 'skinning' ? copy.minimumHintSkinning : copy.minimumHint}</dd>
            </div>
            <div>
              <dt className="text-[11.5px] font-semibold text-mute">{copy.maximum}</dt>
              <dd className="t-num mt-[2px] text-[26px] leading-none font-semibold text-ink">{summary.max}</dd>
              <dd className="mt-[4px] text-[11.5px] text-mute">
                {summary.common < summary.max ? copy.commonHint(summary.common)
                  : profession === 'skinning'
                    ? copy.maximumHintSkinning
                    : copy.maximumHint}
              </dd>
            </div>
          </dl>
          <SkillBar summary={summary} profession={profession} />
          <p className="mt-[12px] text-[13px] leading-[1.55] text-prose">
            {copy.levelsTo(name(profession), summary.levelsTo, SKILL_CAP)}
          </p>
          {summary.lastSkillUp > summary.levelsTo && (
            <p className="mt-[6px] text-[12px] leading-[1.5] text-mute">{copy.lastSkillUp(summary.lastSkillUp, SKILL_CAP)}</p>
          )}
          {profession === 'skinning' && <p className="mt-[8px] text-[11.5px] leading-[1.5] text-mute">{copy.skinningNote}</p>}
        </>
      ) : (
        <p className="mt-[10px] text-[13px] leading-[1.55] text-mute">{copy.noNodes(name(profession))}</p>
      )}
    </section>
  );
}

function GatheringTool({ data }: { data: Data }) {
  const [picked, setPicked] = useState<GatherProfession[]>([]);
  const [zoneId, setZoneId] = useState('');

  const toggle = (p: GatherProfession) =>
    setPicked((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur.slice(-1), p]));

  const zones = useMemo(() => (picked.length ? zonesFor(data, picked) : []), [data, picked]);
  const zone = zones.find((z) => String(z.id) === zoneId);

  return (
    <div className="p-[18px]">
      <p className="max-w-[62ch] text-[13.5px] leading-[1.6] text-mute">{copy.intro}</p>

      <div role="group" aria-labelledby="gather-professions" className="mt-[16px]">
        <div id="gather-professions" className="t-eyebrow text-[10.5px] font-semibold text-faint">
          {copy.professionsLabel}
        </div>
        <div className="mt-[8px] flex flex-wrap gap-[8px]">
          {PROFESSIONS.map((p) => {
            const on = picked.includes(p);
            return (
              <button
                key={p}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  toggle(p);
                  setZoneId('');
                }}
                className="pill px-[14px] py-[7px] text-[12.5px] transition-colors"
                style={on ? { borderColor: 'var(--accent)', background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600 } : { color: 'var(--mute)' }}
              >
                {name(p)}
              </button>
            );
          })}
        </div>
        <p className="mt-[6px] text-[11.5px] text-faint">{copy.professionsHint}</p>
      </div>

      <div className="mt-[16px]">
        <label htmlFor="gather-zone" className="t-eyebrow block text-[10.5px] font-semibold text-faint">
          {copy.zoneLabel}
        </label>
        <select
          id="gather-zone"
          value={zone ? zoneId : ''}
          disabled={!picked.length}
          onChange={(e) => {
            setZoneId(e.target.value);
            if (e.target.value) track('gathering_zone', { zone: zones.find((z) => String(z.id) === e.target.value)?.name ?? '' });
          }}
          className="mt-[8px] w-full rounded-[8px] border border-line bg-panel px-[12px] py-[10px] text-[13px] text-ink disabled:text-faint"
        >
          <option value="">{picked.length ? copy.zonePlaceholder : copy.zoneLocked}</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {zoneLabel(z, picked)}
            </option>
          ))}
        </select>
        {picked.length > 0 && <p className="mt-[6px] text-[11.5px] text-faint">{copy.zoneHint}</p>}
      </div>

      <div className="mt-[18px]" aria-live="polite">
        {zone ? (
          <>
            <div className="grid gap-[12px] sm:grid-cols-2">
              {summarise(zone, picked).map(({ profession, summary }) => (
                <ProfessionCard key={profession} profession={profession} summary={summary} />
              ))}
            </div>
            <p className="mt-[12px] text-[11.5px] leading-[1.5] text-faint">{copy.estimateNote}</p>
          </>
        ) : (
          <p className="rounded-[10px] border border-dashed border-line px-[14px] py-[18px] text-center text-[13px] text-faint">{copy.empty}</p>
        )}
      </div>
    </div>
  );
}

/** The data is a few KB of node requirements; it loads when the modal first opens. */
function GatheringModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || data) return;
    import('../../content/gathering.json').then((m) => setData(m.default), () => setFailed(true));
  }, [open, data]);

  return (
    <Modal open={open} onClose={onClose} title={copy.title} closeLabel={copy.close} size="lg">
      {data ? (
        <GatheringTool data={data} />
      ) : (
        <p className="px-[18px] py-[24px] text-[13px] text-faint" role="status">
          {failed ? copy.failed : copy.loading}
        </p>
      )}
    </Modal>
  );
}

/** The button on the Gathering Reference Tool card. */
export function GatheringActions({ cta }: { cta: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          track('gathering_open');
        }}
        className="mt-[14px] rounded-[8px] border border-line px-[13px] py-[9px] text-center text-[12.5px] font-semibold text-mute transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
      >
        {cta}
      </button>
      <GatheringModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
