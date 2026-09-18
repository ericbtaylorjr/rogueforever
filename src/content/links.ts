/**
 * Every external destination on the page, in one place.
 *
 * TODO: all of these are placeholders — swap in the real URLs.
 * Until then they render as disabled-looking links that go nowhere rather than
 * pretending to work.
 */
export const links = {
  wowsims: 'https://wowsims.github.io/classic/',
  weakauras: '#', // TODO: Comfy's UI addon package
  discord: 'https://discord.gg/rKF9G7zusj',
  tip: 'https://streamelements.com/thecomfywizard-bba10/tip',
  youtube: 'https://youtube.com/@thecomfywizard',
  tiktok: 'https://www.tiktok.com/@thecomfywizard',
  twitch: 'https://www.twitch.tv/thecomfywizard',
  mail: 'mailto:TheComfyWizard@gmail.com',
  site: 'https://thecomfywizard.com',
} as const;

export const socialHref: Record<string, string> = {
  YT: links.youtube,
  TT: links.tiktok,
  TWITCH: links.twitch,
  MAIL: links.mail,
};

/** Map a tool card's CTA to its destination. Keyed by the tool name in content.json. */
export const toolHref: Record<string, string> = {
  'Learn to sim': links.wowsims,
  "Comfy's UI": links.weakauras,
  'Rogue Classic Discord': links.discord,
};

export const isPlaceholder = (href: string) => href === '#';
