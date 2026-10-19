import { privacy as copy } from '../../content/copy';
import { privacyLinks } from '../../content/links';
import { useHandbook } from '../../state/HandbookProvider';
import { LinkedText } from '../ui/LinkedText';
import { Modal } from '../ui/Modal';

/** The privacy policy, in the same window style as the rest of the Handbook's dialogs. */
export function PrivacyPolicy() {
  const { privacyOpen, setPrivacyOpen } = useHandbook();

  return (
    <Modal open={privacyOpen} onClose={() => setPrivacyOpen(false)} title={copy.title} closeLabel={copy.close} size="lg">
      <div className="px-[22px] pt-[18px] pb-[24px]">
        <p className="text-[12.5px] text-faint">{copy.updated}</p>
        <p className="mt-[10px] text-[14px] leading-[1.65] text-lede">{copy.intro}</p>

        {copy.sections.map((s) => (
          <section key={s.heading} className="mt-[22px] border-t border-line pt-[16px]">
            <h3
              className="text-ink"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}
            >
              {s.heading}
            </h3>
            {s.body.map((para) => (
              <p key={para} className="mt-[8px] text-[13.5px] leading-[1.65] text-prose">
                <LinkedText text={para} links={privacyLinks} />
              </p>
            ))}
          </section>
        ))}
      </div>
    </Modal>
  );
}
