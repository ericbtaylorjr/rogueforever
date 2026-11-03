import { staleBuild } from '../../content/copy';
import type { Build } from '../../content/types';
import { Callout } from './Callout';

/** A quiet "pre-rework" status line for a build that hasn't been redone yet (`stale` in types.ts). */
export function StaleNote({ build }: { build: Build }) {
  if (!build.stale) return null;
  return (
    <div className="mt-[12px]">
      <Callout tone="warn" quiet label={staleBuild.label}>
        {staleBuild.text}
      </Callout>
    </div>
  );
}
