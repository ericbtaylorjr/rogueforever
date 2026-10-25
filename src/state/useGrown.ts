import { useEffect, useState } from 'react';

/**
 * Bar fills grow from zero on mount and whenever `dep` changes: false for one frame, then
 * true, so a width transition has a starting point to animate from.
 */
export function useGrown(dep: unknown): boolean {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    setGrown(false);
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, [dep]);
  return grown;
}
