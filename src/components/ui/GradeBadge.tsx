import { buildList as copy } from '../../content/copy';
import { qualityColor } from '../../content/gear';
import type { MetaGrade } from '../../content/types';
import { hexA } from '../../lib/color';
import { useTheme } from '../../state/ThemeProvider';

/** Grades borrow WoW item quality colours: S legendary down to D poor. `X` is a placeholder and stays neutral. */
const GRADE_COLOR: Record<Exclude<MetaGrade, 'X'>, string> = {
  S: qualityColor.legendary,
  A: qualityColor.epic,
  B: qualityColor.rare,
  C: qualityColor.uncommon,
  D: '#9D9D9D',
};

/** Square meta grade badge. `null` is an ungraded entry and shows "?"; `X` is a grade still to come. */
export function GradeBadge({ grade }: { grade: MetaGrade | null }) {
  const { tone } = useTheme();
  const color = grade && grade !== 'X' ? GRADE_COLOR[grade] : null;
  return (
    <span
      className="t-num grid size-[30px] place-items-center rounded-[7px] text-[15px] font-bold"
      style={
        color
          ? { color: tone(color), background: hexA(color, 0.14) }
          : { color: 'var(--faint)', background: 'rgba(var(--fg-rgb),.06)' }
      }
    >
      <span className="sr-only">{color ? copy.gradeLabel : copy.ungraded} </span>
      {grade ?? '?'}
    </span>
  );
}
