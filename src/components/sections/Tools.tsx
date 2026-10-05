import { macros, tools } from '../../content/content';
import { toolsCopy as copy } from '../../content/copy';
import { toolBodyLinks, toolHref } from '../../content/links';
import { CopyButton } from '../ui/CopyButton';
import { LinkedText } from '../ui/LinkedText';
import { SectionHeading } from '../ui/SectionHeading';
import { ComfyUiActions } from './ComfyUi';

/**
 * Two-column layout once the section is wide enough: Comfy's UI (the tall card)
 * sits on the right spanning both rows, the other two stack on the left.
 * Narrow containers fall back to one column in content order.
 */
const placement: Record<string, string> = {
  'Learn WoWSims': '@xl:col-start-1 @xl:row-start-1',
  'Rogue Classic Discord': '@xl:col-start-1 @xl:row-start-2',
  "Comfy's UI": '@xl:col-start-2 @xl:row-start-1 @xl:row-span-2',
};

export function Tools() {
  return (
    <section id="tools" aria-label="Tools and UI">
      <SectionHeading id="tools" />

      <div className="@container">
        <div className="grid gap-[12px] @xl:grid-cols-2">
          {tools.map((t) => (
            <article key={t.name} className={`panel flex flex-col p-[18px] ${placement[t.name] ?? ''}`}>
              <h3 className="t-card-title text-ink">{t.name}</h3>
              {/* Comfy's UI lets its screenshot absorb spare height instead of the body text. */}
              <p className={`mt-[10px] text-[12.5px] leading-[1.6] text-mute ${t.name === "Comfy's UI" ? '' : 'flex-1'}`}>
                <LinkedText text={t.body} links={toolBodyLinks[t.name]} />
              </p>
              {t.name === "Comfy's UI" ? (
                <ComfyUiActions />
              ) : t.disabled ? (
                <p className="mt-[14px] text-[12.5px] italic text-dim">{t.cta}</p>
              ) : (
                <a
                  href={toolHref[t.name] ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-[14px] rounded-[8px] border border-line px-[13px] py-[9px] text-center text-[12.5px] font-semibold text-mute transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
                >
                  {t.cta}
                </a>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="panel mt-[16px] p-[18px]">
        <span className="t-panel-label text-ink">{copy.macrosTitle}</span>

        <div className="mt-[14px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
          {macros.map((m, i) => (
            <div key={m.name} className="panel-inner p-[14px]">
              <div className="flex items-center justify-between gap-[10px]">
                <span className="text-[12.5px] font-semibold text-ink">{m.name}</span>
                <CopyButton
                  copyKey={`macro-${i}`}
                  text={m.code}
                  label={copy.copy}
                  copiedLabel={copy.copied}
                  variant="small"
                  name={m.name}
                />
              </div>
              <pre
                className="t-code mt-[10px] rounded-[8px] p-[11px] text-mute"
                style={{ background: 'var(--surface-deep)' }}
              >
                {m.code}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
