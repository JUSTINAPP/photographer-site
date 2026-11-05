/**
 * Website design: a small set of dials (typography, colours, header, homepage top) that every portfolio
 * is built from, plus named presets as starting points. Safe for client and server.
 * Everything is validated through normaliseTheme, so a stored or previewed theme can only ever hold known values.
 */

export const FONT_PAIRS = {
  classic: {
    label: "Classic",
    display: '"Editorial", "Iowan Old Style", Georgia, serif',
    text: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
  editorial: {
    label: "Editorial",
    display: '"Editorial", Georgia, serif',
    text: '"Instrument", "Helvetica Neue", Arial, sans-serif',
  },
  swiss: {
    label: "Swiss",
    display: '"Instrument", "Helvetica Neue", Arial, sans-serif',
    text: '"Instrument", "Helvetica Neue", Arial, sans-serif',
  },
  garamond: {
    label: "Old style",
    display: '"Editorial", Garamond, Georgia, serif',
    text: '"Instrument", "Helvetica Neue", Arial, sans-serif',
  },
  contemporary: {
    label: "Contemporary",
    display: '"Instrument", "Helvetica Neue", Arial, sans-serif',
    text: '"Instrument", "Helvetica Neue", Arial, sans-serif',
  },
  mono: {
    label: "Archive",
    display: '"Instrument", "Helvetica Neue", Arial, sans-serif',
    text: 'ui-monospace, Menlo, monospace',
  },
} as const;
export type FontPair = keyof typeof FONT_PAIRS;

type Colours = { site: string; ink: string; muted: string; line: string; paper: string };
export const PALETTES = {
  white: { label: "White", site: "#ffffff", ink: "#1c1b19", muted: "#6f6b64", line: "#e4e1db", paper: "#faf9f7" },
  paper: { label: "Paper", site: "#f6f3ec", ink: "#22201c", muted: "#6c665c", line: "#e0d9cb", paper: "#efeadf" },
  stone: { label: "Stone", site: "#ecebe8", ink: "#1a1a1a", muted: "#64625e", line: "#d6d4cf", paper: "#e3e1dd" },
  dark: { label: "Dark", site: "#121212", ink: "#ecebe7", muted: "#9b988f", line: "#2c2b29", paper: "#1b1b1a" },
} as const;
export type PaletteKey = keyof typeof PALETTES | "custom";

export const HEADERS = ["left", "centered", "stacked"] as const;
export const HEROES = ["full", "split", "framed", "text"] as const;
export const SOCIAL_PLACEMENTS = ["footer", "header", "both"] as const;
export type SocialPlacement = (typeof SOCIAL_PLACEMENTS)[number];
export type HeaderStyle = (typeof HEADERS)[number];
export type HeroStyle = (typeof HEROES)[number];

export type SiteTheme = {
  fonts: FontPair;
  palette: PaletteKey;
  bg: string; // used when palette is "custom"
  ink: string;
  header: HeaderStyle;
  hero: HeroStyle;
  social: SocialPlacement;
};

export const PRESETS = {
  classic: { label: "Classic", theme: { fonts: "classic", palette: "white", header: "left", hero: "full" } },
  whitecube: { label: "White cube", theme: { fonts: "swiss", palette: "white", header: "centered", hero: "framed" } },
  editorial: { label: "Editorial", theme: { fonts: "editorial", palette: "paper", header: "stacked", hero: "split" } },
  darkroom: { label: "Dark room", theme: { fonts: "contemporary", palette: "dark", header: "left", hero: "full" } },
} as const;

export const DEFAULT_THEME: SiteTheme = { fonts: "classic", palette: "white", bg: "#ffffff", ink: "#1c1b19", header: "left", hero: "full", social: "footer" };

const HEX = /^#[0-9a-f]{6}$/i;
const oneOf = <T extends string>(v: unknown, list: readonly T[], fallback: T): T => (typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback);

/** Only known keys and values survive; anything else falls back to the default look. */
export function normaliseTheme(input: unknown): SiteTheme {
  const x = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const bg = typeof x.bg === "string" && HEX.test(x.bg) ? x.bg.toLowerCase() : DEFAULT_THEME.bg;
  const ink = typeof x.ink === "string" && HEX.test(x.ink) ? x.ink.toLowerCase() : DEFAULT_THEME.ink;
  let palette = oneOf<PaletteKey>(x.palette, [...(Object.keys(PALETTES) as (keyof typeof PALETTES)[]), "custom"], "white");
  if (palette === "custom" && contrast(bg, ink) < 4.5) palette = "white";
  return {
    fonts: oneOf<FontPair>(x.fonts, Object.keys(FONT_PAIRS) as FontPair[], "classic"),
    palette,
    bg,
    ink,
    header: oneOf(x.header, HEADERS, "left"),
    hero: oneOf(x.hero, HEROES, "full"),
    social: oneOf(x.social, SOCIAL_PLACEMENTS, "footer"),
  };
}

function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** WCAG contrast ratio between two #rrggbb colours (4.5 is the minimum for body text). */
export function contrast(a: string, b: string) {
  if (!HEX.test(a) || !HEX.test(b)) return 1;
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

export function themeColours(t: SiteTheme): Colours {
  if (t.palette !== "custom") return PALETTES[t.palette];
  // Derived from the two chosen colours, so any pair stays coherent.
  return {
    site: t.bg,
    ink: t.ink,
    muted: `color-mix(in srgb, ${t.ink} 58%, ${t.bg})`,
    line: `color-mix(in srgb, ${t.ink} 14%, ${t.bg})`,
    paper: `color-mix(in srgb, ${t.ink} 4%, ${t.bg})`,
  };
}

export const isDark = (t: SiteTheme) => luminance(t.palette === "custom" ? t.bg : PALETTES[t.palette].site) < 0.18;

/** CSS variables for a site wrapper: the portfolio colours and typography, scoped to the site. */
export function themeVars(t: SiteTheme): Record<string, string> {
  const c = themeColours(t);
  const f = FONT_PAIRS[t.fonts];
  return {
    "--color-site": c.site,
    "--color-ink": c.ink,
    "--color-muted": c.muted,
    "--color-line": c.line,
    "--color-paper": c.paper,
    "--font-serif": f.display,
    "--font-sans": f.text,
    colorScheme: isDark(t) ? "dark" : "light",
  };
}
