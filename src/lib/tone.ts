/**
 * Content colours (spec hues, poison hues, item qualities…) are authored for the dark
 * theme: bright pastels that vanish on parchment. `readable()` keeps a colour's hue but
 * darkens it until it clears `min`:1 against the worst-case light surface, so a spec still
 * "looks like" its colour and text/bars stay legible. Dark theme passes colours through.
 */

/**
 * Light-theme surfaces text has to hold on: the darkest pixel the paper grain produces (measured,
 * see styles/index.css) and panel2. Panels are lighter, so they pass whenever these do.
 */
const LIGHT_SURFACES = ['#cbb386', '#eee1b9'];

const toRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex: string) => {
  const [r, g, b] = toRgb(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

export const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === rn
      ? (gn - bn) / d + (gn < bn ? 6 : 0)
      : max === gn
        ? (bn - rn) / d + 2
        : (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const cache = new Map<string, string>();

/** Darken `hex` (keeping its hue) until it reaches `min`:1 on every light surface. */
export function readableOnLight(hex: string, min = 4.5): string {
  if (!/^#[0-9a-f]{3,6}$/i.test(hex)) return hex; // var(--x) and friends are already themed
  const key = `${hex}|${min}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const ok = (c: string) => LIGHT_SURFACES.every((bg) => contrast(c, bg) >= min);
  let out = hex;
  if (!ok(hex)) {
    const [h, s0, l0] = rgbToHsl(toRgb(hex));
    // Whites and greys have no hue worth keeping — pull toward ink brown instead.
    const s = s0 < 0.08 ? 0.12 : s0;
    const hue = s0 < 0.08 ? 30 : h;
    for (let l = l0; l >= 0; l -= 0.01) {
      out = hslToHex(hue, s, l);
      if (ok(out)) break;
    }
  }
  cache.set(key, out);
  return out;
}
