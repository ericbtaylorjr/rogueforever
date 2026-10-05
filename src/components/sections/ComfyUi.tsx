import { useEffect, useState } from 'react';
import preview from '../../assets/comfy-ui-preview.webp';
import thumb from '../../assets/comfy-ui-thumb.webp';
import { comfyUi as copy, type ComfyProfileId } from '../../content/copy';
import { useHandbook } from '../../state/HandbookProvider';
import { Modal } from '../ui/Modal';

/** Import strings are large, so they load only when their modal opens. */
const loadString: Record<ComfyProfileId, () => Promise<{ default: string }>> = {
  ellesmere: () => import('../../content/imports/ellesmere.txt?raw'),
  editmode: () => import('../../content/imports/editmode.txt?raw'),
};

type CopyState = 'idle' | 'copied' | 'failed';

function ProfileModal({ id, onClose }: { id: ComfyProfileId | null; onClose: () => void }) {
  const { copy: copyText } = useHandbook();
  const profile = copy.profiles.find((p) => p.id === id);
  const [text, setText] = useState<string | null>(null);
  const [state, setState] = useState<CopyState>('idle');

  useEffect(() => {
    setText(null);
    setState('idle');
    if (!id) return;
    let live = true;
    loadString[id]().then((m) => live && setText(m.default.trim()));
    return () => {
      live = false;
    };
  }, [id]);

  const onCopy = async () => {
    if (!text || !id) return;
    setState((await copyText(`profile-${id}`, text)) ? 'copied' : 'failed');
  };

  return (
    <Modal open={!!profile} onClose={onClose} title={profile?.title ?? ''} closeLabel={copy.close}>
      {profile && (
        <div className="flex flex-col gap-[16px] p-[18px]">
          <p className="text-[13px] leading-[1.65] text-prose">{profile.intro}</p>

          <div>
            <h3 className="t-eyebrow text-[10.5px] text-faint">{copy.stepsTitle}</h3>
            <ol className="mt-[10px] flex flex-col gap-[8px]">
              {profile.steps.map((step, i) => (
                <li key={step} className="flex gap-[10px] text-[13px] leading-[1.55] text-prose">
                  <span
                    aria-hidden="true"
                    className="t-num grid size-[20px] shrink-0 place-items-center rounded-full text-[10.5px]"
                    style={{ background: 'rgba(var(--accent-rgb),.13)', color: 'var(--accent)' }}
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {state === 'failed' && text && (
            <textarea
              readOnly
              value={text}
              aria-label={profile.title}
              onFocus={(e) => e.currentTarget.select()}
              className="t-code h-[110px] w-full resize-none rounded-[8px] border border-line p-[10px] text-mute"
              style={{ background: 'var(--surface-deep)' }}
            />
          )}

          <button
            type="button"
            onClick={onCopy}
            disabled={!text}
            className="w-full rounded-[10px] px-[16px] py-[14px] text-[14px] font-bold transition-colors disabled:cursor-wait disabled:opacity-60"
            style={
              state === 'copied'
                ? {
                    border: '1px solid rgba(var(--venom-rgb),.45)',
                    background: 'rgba(var(--venom-rgb),.12)',
                    color: 'var(--venom)',
                  }
                : { background: 'var(--accent)', color: 'var(--accent-ink)' }
            }
          >
            {text ? copy.copyCta : copy.copying}
          </button>

          <p
            role="status"
            className="-mt-[6px] min-h-[1.5em] text-center text-[12.5px]"
            style={{ color: state === 'failed' ? 'var(--warn)' : 'var(--venom)' }}
          >
            {state === 'copied' && `✓ ${copy.copiedMsg}`}
            {state === 'failed' && copy.failedMsg}
          </p>
        </div>
      )}
    </Modal>
  );
}

/** Thumbnail + profile buttons for the Comfy's UI tool card. */
export function ComfyUiActions() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [profile, setProfile] = useState<ComfyProfileId | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        aria-label={copy.preview.open}
        // aspect-video is the minimum; flex-1 lets it grow when the card is stretched, cropping to fill.
        className="group relative mt-[14px] block aspect-video flex-1 overflow-hidden rounded-[8px] border border-line transition-colors hover:border-accent"
      >
        <img
          src={thumb}
          alt=""
          width={640}
          height={360}
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span
          aria-hidden="true"
          className="absolute right-[8px] bottom-[8px] rounded-[6px] px-[7px] py-[3px] text-[12px] opacity-80 transition-opacity group-hover:opacity-100"
          style={{ background: 'var(--scrim)', color: 'var(--on-hue)' }}
        >
          ⤢
        </span>
      </button>

      <div className="mt-[14px] flex flex-col gap-[8px]">
        {copy.profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProfile(p.id)}
            className="rounded-[8px] border border-line px-[13px] py-[9px] text-center text-[12.5px] font-semibold text-mute transition-colors hover:border-accent hover:bg-accent-dim hover:text-accent"
          >
            {p.label}
          </button>
        ))}
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={copy.preview.title}
        closeLabel={copy.close}
        size="xl"
      >
        <img src={preview} alt={copy.preview.alt} width={2000} height={1125} className="block h-auto w-full" />
      </Modal>

      <ProfileModal id={profile} onClose={() => setProfile(null)} />
    </>
  );
}
