import { macros } from '../../content/content';
import { macrosCopy as copy } from '../../content/copy';
import { CopyButton } from '../ui/CopyButton';
import { SectionHeading } from '../ui/SectionHeading';

export function Macros() {
  return (
    <section id="macros" aria-label="Macros">
      <SectionHeading id="macros" />

      <p className="max-w-[70ch] text-[14px] leading-[1.6] text-mute">{copy.intro}</p>

      <div className="mt-[16px] grid gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
        {macros.map((m, i) => (
          <div key={m.name} className="panel p-[14px]">
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
    </section>
  );
}
