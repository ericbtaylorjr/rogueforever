import {
  createContext,
  useCallback,
  useContext,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { bp, config } from '../config';
import { setTrackContext, track } from '../lib/analytics';
import { holdPlace, sectionOffset } from '../lib/keepPlace';
import { noteJump, useSectionViews } from '../lib/sectionViews';
import { buildForSwitch, defaultBuild, findBuild } from '../content/builds';
import { sectionIds, specs } from '../content/content';
import type { Build, GearSetId, SimSetId, SpecId } from '../content/types';

export type SortKey = 'rank' | 'name' | 'weapon' | 'idx' | 'delta';
export interface Sort {
  key: SortKey;
  dir: 'asc' | 'desc';
}

interface HandbookState {
  /* state */
  spec: SpecId;
  /** The active spec's build. Talents, Stats, Gear and Rotation all show this. */
  build: Build;
  simSet: SimSetId;
  sort: Sort;
  gearSet: GearSetId;
  consumeFilter: string;
  guideFilter: string;
  sweaty: boolean;
  openRaid: number;
  searchOpen: boolean;
  query: string;
  active: string;
  copied: string;
  drawer: boolean;
  /** Privacy policy window. Also opened by landing on #privacy. */
  privacyOpen: boolean;

  /**
   * Below the 1100px nav breakpoint. Layout comes from CSS breakpoints, so the page renders
   * the same before any script runs; this is for behaviour only (the drawer, sticky offsets).
   */
  isNarrow: boolean;

  /* actions */
  /** Switches spec and lands on its matching build (see `buildForSwitch`). */
  setSpec: (id: SpecId) => void;
  /** Switch to `spec` and make its build `id` active. */
  pickBuild: (spec: SpecId, id: string) => void;
  setSimSet: (id: SimSetId) => void;
  toggleSort: (key: SortKey) => void;
  setGearSet: (id: GearSetId) => void;
  setConsumeFilter: (cat: string) => void;
  setGuideFilter: (cat: string) => void;
  toggleSweaty: () => void;
  toggleRaid: (i: number) => void;
  setSearchOpen: (open: boolean) => void;
  setQuery: (q: string) => void;
  setDrawer: (open: boolean) => void;
  setPrivacyOpen: (open: boolean) => void;
  /** Resolves true once the clipboard accepted the text. */
  copy: (key: string, text: string) => Promise<boolean>;
  jump: (id: string) => void;
}

const Ctx = createContext<HandbookState | null>(null);

const COPY_RESET_MS = 1600;
const STORE_KEY = 'rc:prefs';
const PRIVACY_HASH = '#privacy';

const isSpecId = (v: string | null): v is SpecId =>
  !!v && specs.some((s) => s.id === (v as SpecId));

/** Spec ids before the rename to tree names. Old shared links and saved prefs still resolve. */
const LEGACY_SPEC: Record<string, SpecId> = {
  mutilate: 'assassination',
  sinister: 'combat',
  backstab: 'subtlety',
};

const toSpecId = (v: string | null | undefined): SpecId | null => {
  if (!v) return null;
  const id = LEGACY_SPEC[v] ?? v;
  return isSpecId(id) ? id : null;
};

function readInitial(): { spec: SpecId; build?: string; sweaty: boolean } {
  const fallback = { spec: config.defaultSpec, sweaty: config.showSweaty };
  if (typeof window === 'undefined') return fallback;

  // URL wins (shared links land on their spec and build), then last visit's, then the default.
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get('spec');
  let stored: { spec?: string; build?: string; sweaty?: boolean } = {};
  try {
    // Storage is user-editable, so treat it as untrusted: anything that isn't a plain object is ignored.
    const parsed: unknown = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) stored = parsed;
  } catch {
    /* ignore — preferences are a nicety, not a requirement */
  }

  const urlSpec = toSpecId(fromUrl);
  const spec = urlSpec ?? toSpecId(stored.spec) ?? fallback.spec;
  // A build only counts for the spec it came with; findBuild drops anything that isn't one.
  const wanted = urlSpec ? params.get('build') : spec === toSpecId(stored.spec) ? stored.build : null;
  return {
    spec,
    build: findBuild(spec, typeof wanted === 'string' ? wanted : null)?.id,
    sweaty: typeof stored.sweaty === 'boolean' ? stored.sweaty : fallback.sweaty,
  };
}

/**
 * The section a shared link points at (`?spec=combat&build=backstab#talents`), read once
 * before anything renders. Left to itself, the browser races React for it: sometimes the
 * section isn't drawn yet and the page stays at the top, sometimes it jumps there with no
 * animation. So the hash is held back here and the deep-link effect does the scrolling.
 */
const linkedSection = (() => {
  if (typeof window === 'undefined') return null;
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!sectionIds.includes(id)) return null;
  window.history.replaceState(null, '', window.location.pathname + window.location.search);
  return id;
})();

/**
 * scrollTo() doesn't move keyboard focus, so a keyboard or screen-reader user would be left
 * where they were. Park focus on the section without a second scroll.
 */
function focusSection(el: HTMLElement) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/**
 * A media query's match, as React state. It only changes when the viewport crosses the
 * breakpoint, so resizing doesn't re-render the page on every frame. Without a window
 * (prerendering), it reads as the desktop layout.
 */
function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function scrollToSection(el: HTMLElement) {
  const top = el.getBoundingClientRect().top + window.scrollY - sectionOffset();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
}

export function HandbookProvider({ children }: { children: ReactNode }) {
  const initial = useRef(readInitial()).current;

  const [spec, setSpecState] = useState<SpecId>(initial.spec);
  /** Build picked per spec. A spec with none (or a stale id) shows its best-ranked build. */
  const [builds, setBuilds] = useState<Partial<Record<SpecId, string>>>(
    initial.build ? { [initial.spec]: initial.build } : {},
  );
  const build = findBuild(spec, builds[spec]) ?? defaultBuild(spec);
  const [simSet, setSimSetState] = useState<SimSetId>('st');
  const [sort, setSort] = useState<Sort>({ key: 'idx', dir: 'desc' });
  const [gearSet, setGearSetState] = useState<GearSetId>('prebis');
  const [consumeFilter, setConsumeFilterState] = useState('All');
  const [guideFilter, setGuideFilterState] = useState('All');
  const [sweaty, setSweaty] = useState(initial.sweaty);
  const [openRaid, setOpenRaid] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(sectionIds[0]);
  const [copied, setCopied] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [privacyOpen, setPrivacyOpenState] = useState(
    () => typeof window !== 'undefined' && window.location.hash === PRIVACY_HASH,
  );
  const isNarrow = useMedia(`(width < ${bp.rail}px)`);
  const copyTimer = useRef<number | undefined>(undefined);

  /* Drawer belongs to narrow viewports only. */
  useEffect(() => {
    if (!isNarrow && drawer) setDrawer(false);
  }, [isNarrow, drawer]);

  /* Lock body scroll behind the drawer and the palette. */
  useEffect(() => {
    const lock = drawer || searchOpen;
    const prev = document.body.style.overflow;
    if (lock) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawer, searchOpen]);

  /* ----- persistence ----- */
  useEffect(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ spec, build: build.id, sweaty }));
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    // Always explicit, so every link (default included) names its spec and build.
    url.searchParams.set('spec', spec);
    url.searchParams.set('build', build.id);
    window.history.replaceState(null, '', url);
  }, [spec, build.id, sweaty]);

  /* ----- analytics ----- */
  useEffect(
    () => setTrackContext({ active_spec: spec, active_build: build.id, sweaty_mode: sweaty }),
    [spec, build.id, sweaty],
  );
  useSectionViews(sectionIds);

  /* Search opens from a button, the mobile bar or Ctrl K; count every way in here. */
  useEffect(() => {
    if (searchOpen) track('search_open');
  }, [searchOpen]);

  /* ----- scroll spy ----- */
  useEffect(() => {
    const nodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => !!n);
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -62% 0px', threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  /* ----- keyboard ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuery('');
        setSearchOpen((o) => !o);
        return;
      }
      // Esc is the drawer's and search's own: they're native dialogs.
      // No bare-key shortcuts (e.g. `/`): WCAG 2.1.4 — they collide with speech input and
      // can't be remapped here. Keep shortcuts behind a modifier.
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  /* #privacy is a shareable link to the policy, so follow it on hash changes too. */
  useEffect(() => {
    const onHash = () => window.location.hash === PRIVACY_HASH && setPrivacyOpenState(true);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /* ----- actions ----- */
  const jump = useCallback(
    (id: string) => {
      // Close the drawer or search first: while a modal dialog is open the page is inert and
      // can't take focus, and closing one hands focus back to whatever opened it.
      flushSync(() => {
        setDrawer(false);
        setSearchOpen(false);
      });
      const el = document.getElementById(id);
      if (!el) return;
      scrollToSection(el);
      setActive(id);
      track('section_jump', { section: id });
      noteJump(id);
      window.history.replaceState(null, '', `#${id}`);
      focusSection(el);
    },
    [],
  );

  /*
   * A shared link to a section scrolls there once the page has loaded and its fonts have
   * settled. Until then the section goes without its id: Chrome remembers the link's
   * fragment and re-applies it (instantly) on every layout until the page has loaded,
   * which would cut the animated scroll short. Runs before the first paint, so the
   * browser never sees the id early.
   */
  useLayoutEffect(() => {
    const id = linkedSection;
    const el = id && document.getElementById(id);
    if (!id || !el) return;
    el.removeAttribute('id');
    let live = true;
    const loaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise((done) => window.addEventListener('load', done, { once: true }));
    Promise.all([loaded, document.fonts.ready]).then(() => {
      if (!live) return;
      el.id = id;
      requestAnimationFrame(() => {
        scrollToSection(el);
        setActive(id);
        focusSection(el);
        window.history.replaceState(null, '', `#${id}`);
      });
    });
    return () => {
      live = false;
      el.id = id;
    };
  }, []);

  const copy = useCallback((key: string, text: string) => {
    // Only confirm once the clipboard actually accepted the text.
    if (!navigator.clipboard) return Promise.resolve(false);
    return navigator.clipboard.writeText(text).then(
      () => {
        setCopied(key);
        track('copy', { item: key });
        window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopied(''), COPY_RESET_MS);
        return true;
      },
      // Clipboard can be blocked; callers decide how to fall back.
      () => false,
    );
  }, []);

  /** Opening names it in the URL so it can be shared; closing drops the hash again. */
  const setPrivacyOpen = useCallback((open: boolean) => {
    setPrivacyOpenState(open);
    const url = new URL(window.location.href);
    if (open) url.hash = PRIVACY_HASH;
    else if (url.hash === PRIVACY_HASH) url.hash = '';
    window.history.replaceState(null, '', url);
  }, []);

  // Both keep the section you're reading where it is on screen (lib/keepPlace).
  const setSpec = useCallback(
    (id: SpecId) => {
      const next = buildForSwitch(id, build, builds[id]).id;
      holdPlace(`${id}/${next}`);
      setSpecState(id);
      setBuilds((b) => ({ ...b, [id]: next }));
      track('spec_select', { spec: id });
    },
    [build, builds],
  );
  const pickBuild = useCallback((id: SpecId, buildId: string) => {
    holdPlace(`${id}/${buildId}`);
    setSpecState(id);
    setBuilds((b) => ({ ...b, [id]: buildId }));
    track('build_select', { spec: id, build: buildId });
  }, []);

  const setGearSet = useCallback((id: GearSetId) => {
    setGearSetState(id);
    track('gear_tab', { tab: id });
  }, []);
  const setSimSet = useCallback((id: SimSetId) => {
    setSimSetState(id);
    track('sim_set', { set: id });
  }, []);
  const setConsumeFilter = useCallback((cat: string) => {
    setConsumeFilterState(cat);
    track('filter_select', { list: 'consumables', filter: cat });
  }, []);
  const setGuideFilter = useCallback((cat: string) => {
    setGuideFilterState(cat);
    track('filter_select', { list: 'guide', filter: cat });
  }, []);

  const toggleSort = useCallback((key: SortKey) => {
    track('table_sort', { column: key });
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  }, []);

  const value = useMemo<HandbookState>(
    () => ({
      spec,
      build,
      simSet,
      sort,
      gearSet,
      consumeFilter,
      guideFilter,
      sweaty,
      openRaid,
      searchOpen,
      query,
      active,
      copied,
      drawer,
      privacyOpen,
      isNarrow,
      setSpec,
      pickBuild,
      setSimSet,
      toggleSort,
      setGearSet,
      setConsumeFilter,
      setGuideFilter,
      toggleSweaty: () => {
        setSweaty(!sweaty);
        track('sweaty_toggle', { enabled: !sweaty });
      },
      toggleRaid: (i) => setOpenRaid((o) => (o === i ? -1 : i)),
      setSearchOpen,
      setQuery,
      setDrawer,
      setPrivacyOpen,
      copy,
      jump,
    }),
    [
      spec,
      build,
      simSet,
      sort,
      gearSet,
      consumeFilter,
      guideFilter,
      sweaty,
      openRaid,
      searchOpen,
      query,
      active,
      copied,
      drawer,
      privacyOpen,
      isNarrow,
      setSpec,
      pickBuild,
      setPrivacyOpen,
      setGearSet,
      setSimSet,
      setConsumeFilter,
      setGuideFilter,
      toggleSort,
      copy,
      jump,
    ],
  );

  return <Ctx value={value}>{children}</Ctx>;
}

export function useHandbook(): HandbookState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHandbook must be used inside <HandbookProvider>');
  return ctx;
}

/**
 * The active build, for what a pick changes beyond the build lists themselves: the Talents
 * card, the Meta Breakdown's phase, Stats, Gear and Rotation. A pick first repaints the
 * lists, then this catches up in a render React can interrupt, so the click answers with
 * one small paint, not a page-sized one (INP).
 */
export function useShownBuild(): Build {
  return useDeferredValue(useHandbook().build);
}
