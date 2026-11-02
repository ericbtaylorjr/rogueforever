/** e.g. "Oct 13, 2026, 11:13 AM EDT", always in US Eastern time. */
const formatUpdated = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  dateStyle: 'medium',
  timeStyle: 'short',
}).format;

export function easternLabel(iso: string) {
  const date = new Date(iso);
  // timeStyle can't be combined with timeZoneName, so take the EDT/EST label separately.
  const zone = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeZoneName: 'short' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')?.value;
  return `${formatUpdated(date)} ${zone ?? 'ET'}`;
}

/** e.g. "Nov 2, 2026", the date in US Eastern time. */
export const easternDate = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', dateStyle: 'medium' }).format;
