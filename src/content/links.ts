/**
 * Every external destination on the page, in one place.
 *
 * TODO: all of these are placeholders — swap in the real URLs.
 * Until then they render as disabled-looking links that go nowhere rather than
 * pretending to work.
 */
export const links = {
  wowsims: 'https://www.wowsims.com/forever/rogue/dps/',
  warcraftlogs: 'https://www.warcraftlogs.com',
  googleAnalyticsData: 'https://policies.google.com/technologies/partner-sites',
  googlePrivacy: 'https://policies.google.com/privacy',
  cloudflarePrivacy: 'https://www.cloudflare.com/privacypolicy/',
  wowheadPrivacy: 'https://www.wowhead.com/privacy',
  githubPrivacy: 'https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement',
  weakauras: '#', // TODO: Comfy's UI addon package
  discord: 'https://discord.gg/rKF9G7zusj',
  tip: 'https://streamelements.com/thecomfywizard-bba10/tip',
  youtube: 'https://youtube.com/@thecomfywizard',
  tiktok: 'https://www.tiktok.com/@thecomfywizard',
  twitch: 'https://www.twitch.tv/thecomfywizard',
  mail: 'mailto:TheComfyWizard@gmail.com',
  site: 'https://thecomfywizard.com',
  ellesmereui: 'https://www.curseforge.com/wow/addons/ellesmereui',
  wowheadRacials: 'https://www.wowhead.com/forever/guide/new-race-class-combinations',
  anhakRacials:
    'https://docs.google.com/spreadsheets/d/1UkeR_x3OsEWXG90JhOm59Lb3MpRPYfQVfd2x4Ok9NOY/edit?gid=1328799785#gid=1328799785',
  rank1Logs: 'https://sod.warcraftlogs.com/character/us/crusader-strike/comfyrogue',
} as const;

/** Phrases in the privacy policy that link out; pass to <LinkedText>. */
export const privacyLinks = {
  'TheComfyWizard@gmail.com': links.mail,
  'how Google uses this data': links.googleAnalyticsData,
  'Google Privacy Policy': links.googlePrivacy,
  "GitHub's privacy statement": links.githubPrivacy,
  "Cloudflare's privacy policy": links.cloudflarePrivacy,
  "Wowhead's privacy policy": links.wowheadPrivacy,
};

/** Every mention of WoWSims in copy links here; pass to <LinkedText>. */
export const wowsimsLink = { WoWSims: links.wowsims };

/** Map a tool card's CTA to its destination. Keyed by the tool name in content.json. */
export const toolHref: Record<string, string> = {
  'Learn WoWSims': links.wowsims,
  "Comfy's UI": links.weakauras,
  'Rogue Classic Discord': links.discord,
};

/** Phrases inside a tool card's body text that link out. Keyed by tool name, then phrase. */
export const toolBodyLinks: Record<string, Record<string, string>> = {
  'Learn WoWSims': wowsimsLink,
  "Comfy's UI": { EllesmereUI: links.ellesmereui },
};

export const isPlaceholder = (href: string) => href === '#';
