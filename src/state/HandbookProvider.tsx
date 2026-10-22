import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { bp, config, scrollOffset } from '../config';
import { setTrackContext, track } from '../lib/analytics';
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
  foreverFilter: string;
  sweaty: boolean;
  openRaid: number;
  openFaq: number;
  searchOpen: boolean;
  query: string;
  active: string;
  copied: string;
  drawer: boolean;
  /** Privacy policy window. Also opened by landing on #privacy. */
  privacyOpen: boolean;
  vw: number;

  /* derived viewport flags */
  isPhone: boolean;
  isNarrow: boolean;
  isWide: boolean;

  /* actions */
  /** Switches spec and lands on its matching build (see `buildForSwitch`). */
  setSpec: (id: SpecId) => void;
  /** Switch to `spec` and make its build `id` active. `stay` skips settling on the section top. */
  pickBuild: (spec: SpecId, id: string, opts?: { stay?: boolean }) => void;
  setSimSet: (id: SimSetId) => void;
  toggleSort: (key: SortKey) => void;
  setGearSet: (id: GearSetId) => void;
  setConsumeFilter: (cat: string) => void;
  setForeverFilter: (cat: string) => void;
  toggleSweaty: () => void;
  toggleRaid: (i: number) => void;
  toggleFaq: (i: number) => void;
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

/** Where a section's top sits once scrolled to: just under the sticky header. */
const sectionOffset = () => (window.innerWidth < bp.rail ? scrollOffset.narrow : scrollOffset.desktop);

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
  const [foreverFilter, setForeverFilterState] = useState('All');
  const [sweaty, setSweaty] = useState(initial.sweaty);
  const [openRaid, setOpenRaid] = useState(0);
  const [openFaq, setOpenFaq] = useState(-1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(sectionIds[0]);
  const [copied, setCopied] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [privacyOpen, setPrivacyOpenState] = useState(
    () => typeof window !== 'undefined' && window.location.hash === PRIVACY_HASH,
  );
  const [vw, setVw] = useState(() => (typeof window === 'undefined' ? 1440 : window.innerWidth));

  const isNarrow = vw < bp.rail;
  const copyTimer = useRef<number | undefined>(undefined);

  /* ----- viewport ----- */
  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setVw(window.innerWidth);
      });
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        return;
      }
      if (e.key === 'Escape' && drawer) {
        setDrawer(false);
        return;
      }
      // No bare-key shortcuts (e.g. `/`): WCAG 2.1.4 — they collide with speech input and
      // can't be remapped here. Keep shortcuts behind a modifier.
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, drawer]);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  /* #privacy is a shareable link to the policy, so follow it on hash changes too. */
  useEffect(() => {
    const onHash = () => window.location.hash === PRIVACY_HASH && setPrivacyOpenState(true);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  /*
   * Switching spec or build adds and removes content above whatever you're reading, so
   * the page shifts by a different amount every time. Instead, settle on the top of the
   * section you were in once the new build has rendered, the same way every time.
   */
  const pendingSection = useRef<string | null>(null);
  const holdSection = () => {
    const line = sectionOffset() + 1;
    let current: string | null = null;
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    }
    pendingSection.current = current;
  };
  useEffect(() => {
    const id = pendingSection.current;
    pendingSection.current = null;
    const el = id && document.getElementById(id);
    // Only when you're into the section; at its top (or above it) there's nothing to fix.
    if (el && el.getBoundingClientRect().top < sectionOffset() - 1) scrollToSection(el);
  }, [spec, build.id]);

  /* ----- actions ----- */
  const jump = useCallback(
    (id: string) => {
      setDrawer(false);
      setSearchOpen(false);
      const el = document.getElementById(id);
      if (!el) return;
      scrollToSection(el);
      setActive(id);
      track('section_jump', { section: id });
      noteJump(id);
      window.history.replaceState(null, '', `#${id}`);
      // scrollTo() doesn't move keyboard focus, so a keyboard or screen-reader user would
      // be left behind in the nav. Park focus on the section without a second scroll.
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    },
    [],
  );

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

  const setSpec = useCallback(
    (id: SpecId) => {
      holdSection();
      setSpecState(id);
      setBuilds((b) => ({ ...b, [id]: buildForSwitch(id, build, b[id]).id }));
      track('spec_select', { spec: id });
    },
    [build],
  );
  const pickBuild = useCallback((id: SpecId, buildId: string, opts?: { stay?: boolean }) => {
    if (opts?.stay) pendingSection.current = null;
    else holdSection();
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
  const setForeverFilter = useCallback((cat: string) => {
    setForeverFilterState(cat);
    track('filter_select', { list: 'forever', filter: cat });
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
      foreverFilter,
      sweaty,
      openRaid,
      openFaq,
      searchOpen,
      query,
      active,
      copied,
      drawer,
      privacyOpen,
      vw,
      isPhone: vw < bp.phone,
      isNarrow,
      isWide: vw >= bp.wide,
      setSpec,
      pickBuild,
      setSimSet,
      toggleSort,
      setGearSet,
      setConsumeFilter,
      setForeverFilter,
      toggleSweaty: () => {
        setSweaty(!sweaty);
        track('sweaty_toggle', { enabled: !sweaty });
      },
      toggleRaid: (i) => setOpenRaid((o) => (o === i ? -1 : i)),
      toggleFaq: (i) => setOpenFaq((o) => (o === i ? -1 : i)),
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
      foreverFilter,
      sweaty,
      openRaid,
      openFaq,
      searchOpen,
      query,
      active,
      copied,
      drawer,
      privacyOpen,
      vw,
      isNarrow,
      setSpec,
      pickBuild,
      setPrivacyOpen,
      setGearSet,
      setSimSet,
      setConsumeFilter,
      setForeverFilter,
      toggleSort,
      copy,
      jump,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHandbook(): HandbookState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useHandbook must be used inside <HandbookProvider>');
  return ctx;
}
