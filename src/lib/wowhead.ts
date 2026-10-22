/**
 * Live Wowhead tooltips. The tooltip box (components/ui/Tooltip) stays ours, for
 * keyboard, touch and theming; what goes inside it comes from Wowhead's tooltip
 * API, so item and spell data tracks Wowhead as Forever's numbers change.
 *
 * Forever data only. Anything Wowhead hasn't listed for Forever shows our own note
 * instead. Wowhead's markup is third-party HTML, so it's rebuilt through an
 * allowlist (`sanitize`) before it reaches the page.
 */

export type WowheadKind = 'item' | 'spell';

export interface WowheadRef {
  kind: WowheadKind;
  id: number;
}

export interface WowheadTip {
  /** Sanitized tooltip markup, safe to set as innerHTML. */
  html: string;
}

const API = 'https://nether.wowhead.com';

export const wowheadKey = (ref: WowheadRef) => `${ref.kind}:${ref.id}`;

/** One request per entity per page load; failures resolve to `null` and are retried next load. */
const cache = new Map<string, Promise<WowheadTip | null>>();

export function loadWowheadTip(ref: WowheadRef): Promise<WowheadTip | null> {
  const key = wowheadKey(ref);
  let hit = cache.get(key);
  if (!hit) {
    hit = fetchTip(ref);
    cache.set(key, hit);
  }
  return hit;
}

async function fetchTip({ kind, id }: WowheadRef): Promise<WowheadTip | null> {
  try {
    const res = await fetch(`${API}/forever/tooltip/${kind}/${id}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { tooltip?: string; error?: string };
    return data.tooltip && !data.error ? { html: sanitize(data.tooltip) } : null;
  } catch {
    return null; // Offline or blocked: the tooltip keeps our own note.
  }
}

/** Tags Wowhead's tooltips use for layout and text. Anything else is unwrapped to its children. */
const ALLOWED_TAGS = new Set(['TABLE', 'TBODY', 'TR', 'TD', 'TH', 'B', 'I', 'SPAN', 'BR', 'DIV', 'SMALL', 'UL', 'LI']);
/** The tooltip is display only, so Wowhead's links become plain text that keeps its colour class. */
const AS_SPAN = new Set(['A']);
/** Dropped along with everything inside them, rather than unwrapped. */
const DROPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'TEXTAREA', 'SELECT']);
/** Class names are only ever hooks for styles/index.css (`.wh-tip …`). */
const SAFE_CLASS = /^[\w-]+$/;

function sanitize(html: string): string {
  // DOMParser builds an inert document: nothing in it runs or loads.
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const out = document.createElement('div');
  copyChildren(doc.body, out);
  return out.innerHTML;
}

function copyChildren(from: Node, to: Node) {
  for (const node of Array.from(from.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      to.appendChild(document.createTextNode(node.textContent ?? ''));
      continue;
    }
    if (!(node instanceof Element)) continue; // comments, processing instructions
    if (DROPPED_TAGS.has(node.tagName.toUpperCase())) continue;
    if (!ALLOWED_TAGS.has(node.tagName) && !AS_SPAN.has(node.tagName)) {
      copyChildren(node, to);
      continue;
    }

    const el = document.createElement(AS_SPAN.has(node.tagName) ? 'span' : node.tagName.toLowerCase());
    const classes = (node.getAttribute('class') ?? '').split(/\s+/).filter((c) => SAFE_CLASS.test(c));
    if (classes.length) el.className = classes.join(' ');

    copyChildren(node, el);
    to.appendChild(el);
  }
}
