/** Dagger-slash rule between sections. `plain` keeps the accent colour inside the spec zone. */
export function Divider({ plain = false }: { plain?: boolean }) {
  return <div className={plain ? 'divider divider-plain' : 'divider'} role="presentation" />;
}
