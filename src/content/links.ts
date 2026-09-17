/**
 * Every external destination on the page, in one place.
 *
 * TODO: all of these are placeholders — swap in the real URLs.
 * Until then they render as disabled-looking links that go nowhere rather than
 * pretending to work.
 */
export const links = {
  wowsims: 'https://wowsims.github.io/classic/',
  weakauras: '#', // TODO: Comfy Rogue UI on Wago
  macroArchive: '#', // TODO: macro + aura archive
  discord: '#', // TODO: Rogue Classic Discord invite
  tip: '#', // TODO: tip / support page
  youtube: '#', // TODO
  tiktok: '#', // TODO
  mail: '#', // TODO: mailto:
  site: 'https://thecomfywizard.com',
} as const;

export const socialHref: Record<string, string> = {
  YT: links.youtube,
  TT: links.tiktok,
  MAIL: links.mail,
};

/** Map a tool card's CTA to its destination. Keyed by the tool name in content.json. */
export const toolHref: Record<string, string> = {
  'Learn to sim': links.wowsims,
  'Comfy Rogue UI': links.weakauras,
  'Macros & auras': links.macroArchive,
  'Rogue Classic Discord': links.discord,
};

export const isPlaceholder = (href: string) => href === '#';
