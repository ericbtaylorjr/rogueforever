import { pvpCopy as copy } from '../../content/copy';
import { SectionHeading } from '../ui/SectionHeading';

/** Deliberately brief: basics and pointers to better PvP resources will follow. */
export function Pvp() {
  return (
    <section id="pvp" aria-label="PvP">
      <SectionHeading id="pvp" />
      <div className="flex max-w-[70ch] flex-col gap-[10px] text-[14px] leading-[1.6] text-mute">
        {copy.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </section>
  );
}
