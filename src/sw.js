/**
 * Service worker: repeat visits load the app from the device instead of asking GitHub Pages,
 * which serves every file with a 10-minute `max-age` and can't be told otherwise. Built into
 * dist/sw.js by the `service-worker` plugin in vite.config.ts, which fills in BUILD below.
 *
 * - The page itself always comes from the network (so a deploy shows straight away), with
 *   the last copy kept for when there's no connection.
 * - Hashed build files (/assets/) never change, so they're served from the cache. Each
 *   deploy's worker drops the ones its build no longer has.
 * - Other site files (talent art, icons, favicons) can change under the same name, so
 *   they're served from the cache and refreshed behind it.
 * - Anything from another site (Wowhead tooltips, analytics) is left alone.
 */
/* global BUILD */

const ASSETS = 'assets';
const FILES = 'files';
const PAGE = 'page';
const HOME = '/';

const here = (path) => new URL(path, self.location.origin).href;

self.addEventListener('install', (event) => {
  // The scripts, styles and fonts the page starts with, which the first visit just
  // downloaded: they come from the browser's HTTP cache, not the network.
  event.waitUntil(
    caches
      .open(ASSETS)
      .then((cache) => cache.addAll(BUILD.shell))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.registration.navigationPreload?.enable();
      await prune(ASSETS, BUILD.assets);
      await prune(FILES, BUILD.files);
      await self.clients.claim();
    })(),
  );
});

/** Drop cached files this build doesn't have. */
async function prune(name, paths) {
  const keep = new Set(paths.map(here));
  const cache = await caches.open(name);
  for (const request of await cache.keys()) {
    if (!keep.has(request.url)) await cache.delete(request);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    if (url.pathname === HOME) event.respondWith(page(event));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cached(request));
  } else if (BUILD.files.includes(url.pathname)) {
    event.respondWith(refreshed(event));
  }
});

/** Network first; the last good copy when offline. */
async function page(event) {
  try {
    const response = (await event.preloadResponse) ?? (await fetch(event.request));
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(PAGE).then((cache) => cache.put(HOME, copy)));
    }
    return response;
  } catch (error) {
    const saved = await caches.match(HOME, { cacheName: PAGE });
    if (saved) return saved;
    throw error;
  }
}

/** Cache first: a hashed file is the same file for as long as its name exists. */
async function cached(request) {
  const cache = await caches.open(ASSETS);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

/** Cache first, then fetched again in the background for next time. */
async function refreshed(event) {
  const cache = await caches.open(FILES);
  const hit = await cache.match(event.request);
  const update = fetch(event.request).then(async (response) => {
    if (response.ok) await cache.put(event.request, response.clone());
    return response;
  });
  if (!hit) return update;
  event.waitUntil(update.catch(() => {}));
  return hit;
}
