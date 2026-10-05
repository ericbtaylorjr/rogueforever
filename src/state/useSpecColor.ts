import { specById } from '../content/content';
import type { SpecId } from '../content/types';
import { hexA } from '../lib/color';
import { useHandbook } from './HandbookProvider';
import { useTheme } from './ThemeProvider';

/**
 * The colours anything tied to a spec should use. Defaults to the active spec.
 * `text` meets text contrast, `mark` is for dots and rules, `soft`/`line` are
 * tinted fills and borders.
 */
export function useSpecColor(id?: SpecId) {
  const { spec } = useHandbook();
  const { tone } = useTheme();
  const s = specById[id ?? spec];
  return {
    spec: s,
    text: tone(s.color),
    mark: tone(s.color, 3),
    soft: hexA(s.color, 0.12),
    line: hexA(s.color, 0.42),
  };
}
