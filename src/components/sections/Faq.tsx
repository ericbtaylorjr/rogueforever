import { faqs } from '../../content/content';
import { useCompendium } from '../../state/CompendiumProvider';
import { SectionHeading } from '../ui/SectionHeading';

export function Faq() {
  const { openFaq, toggleFaq } = useCompendium();

  return (
    <section id="faq" aria-label="FAQ">
      <SectionHeading id="faq" />

      <div className="grid items-start gap-[12px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr))]">
        {faqs.map((f, i) => {
          const open = openFaq === i;
          const panelId = `faq-panel-${i}`;
          return (
            <article
              key={f.q}
              className="sheet overflow-hidden rounded-[12px]"
              style={{
                border: `1px solid ${open ? 'rgba(var(--accent-rgb),.3)' : 'var(--line)'}`,
                background: 'var(--panel)',
              }}
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggleFaq(i)}
                  className="flex w-full items-baseline gap-[12px] p-[15px] text-left"
                >
                  <span
                    className="flex-1 text-ink"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontStretch: '84%',
                      fontSize: 14.5,
                    }}
                  >
                    {f.q}
                  </span>
                  <span aria-hidden="true" className="t-num shrink-0 text-[15px] text-accent">
                    {open ? '−' : '+'}
                  </span>
                </button>
              </h3>
              {open && (
                <p
                  id={panelId}
                  className="animate-rise border-t border-line p-[15px] text-[13px] leading-[1.65] text-prose"
                >
                  {f.a}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
