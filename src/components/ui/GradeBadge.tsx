import { buildList as copy } from '../../content/copy';
import { qualityColor } from '../../content/gear';
import type { MetaGrade } from '../../content/types';
import { hexA } from '../../lib/color';
import { useTheme } from '../../state/ThemeProvider';

/** Grades borrow WoW item quality colours: S legendary down to D poor. */
const GRADE_COLOR: Record<MetaGrade, string> = {
  S: qualityColor.legendary,
  A: qualityColor.epic,
  B: qualityColor.rare,
  C: qualityColor.uncommon,
  D: '#9D9D9D',
};

/** Square meta grade badge. `null` is an ungraded entry and shows "?". */
export function GradeBadge({ grade }: { grade: MetaGrade | null }) {
  const { tone } = useTheme();
  return (
    <span
      className="t-num grid size-[30px] place-items-center rounded-[7px] text-[15px] font-bold"
      style={
        grade
          ? { color: tone(GRADE_COLOR[grade]), background: hexA(GRADE_COLOR[grade], 0.14) }
          : { color: 'var(--faint)', background: 'rgba(var(--fg-rgb),.06)' }
      }
    >
      <span className="sr-only">{grade ? copy.gradeLabel : copy.ungraded} </span>
      {grade ?? '?'}
    </span>
  );
}
