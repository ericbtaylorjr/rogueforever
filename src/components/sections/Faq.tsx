import { faqs } from '../../content/content';
import { useHandbook } from '../../state/HandbookProvider';
import { SectionHeading } from '../ui/SectionHeading';

/** One readable column of questions, separated by rules, the way a FAQ page reads. */
export function Faq() {
  const { openFaq, toggleFaq } = useHandbook();

  return (
    <section id="faq" aria-label="FAQ">
      <SectionHeading id="faq" />

      <div className="max-w-[80ch] border-b border-line">
        {faqs.map((f, i) => {
          const open = openFaq === i;
          const panelId = `faq-panel-${i}`;
          return (
            <div key={f.q} className="border-t border-line">
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggleFaq(i)}
                  className="group flex w-full items-baseline gap-[14px] py-[15px] text-left"
                >
                  <span className="flex-1 text-[15px] font-semibold text-ink transition-colors group-hover:text-accent">
                    {f.q}
                  </span>
                  <span aria-hidden="true" className="t-num shrink-0 text-[16px] text-faint">
                    {open ? '−' : '+'}
                  </span>
                </button>
              </h3>
              {open && (
                <p id={panelId} className="animate-rise pb-[18px] text-[14px] leading-[1.7] text-prose">
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
