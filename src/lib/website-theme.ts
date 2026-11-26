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
  layout?: "campaign" | "gallery";
  fonts: FontPair;
  palette: PaletteKey;
  bg: string; // used when palette is "custom"
  ink: string;
  header: HeaderStyle;
  hero: HeroStyle;
  social: SocialPlacement;
  headerAppearance: 'tinted' | 'transparent' | 'solid';
  headerLogo: 'auto' | 'dark' | 'light';
  scrolledHeaderLogo: 'auto' | 'dark' | 'light';
  headerBorder: boolean;
  columns: number;
  gap: number;
  heroFit: "cover" | "contain";
};

export const PRESETS = {
  gallery: {label:"Toby · Image journal",image:"/images/fashion.jpg",description:"A quiet white header and rotating images, inspired by Toby’s current website",theme:{layout:"gallery",fonts:"swiss",palette:"white",header:"left",hero:"framed",heroFit:"contain"}},
  cinematic: {label:"Cinema",image:"/images/sailing.jpg",description:"A cinematic full-screen opening with a discreet menu",theme:{layout:"campaign",fonts:"swiss",palette:"dark",header:"left",hero:"full"}},
  contact: {label:"Contact sheet",image:"/images/lifestyle.jpg",description:"A clean grid that leads straight into projects",theme:{fonts:"mono",palette:"white",header:"stacked",hero:"text"}},
  atelier: {label:"Atelier",image:"/images/fashion.jpg",description:"Large type and a considered split introduction",theme:{fonts:"editorial",palette:"stone",header:"left",hero:"split"}},
  campaign: { label: "Campaign Stories", image: "", description: "Full-screen film and campaign stories", theme: { layout: "campaign", fonts: "swiss", palette: "white", header: "left", hero: "full" } },
  classic: { label: "Campaign", image: "/images/fashion.jpg", description: "Full-bleed fashion and commercial work", theme: { fonts: "classic", palette: "white", header: "left", hero: "full" } },
  whitecube: { label: "Print Portfolio", image: "/images/lifestyle.jpg", description: "Quiet, framed lifestyle and portrait work", theme: { fonts: "swiss", palette: "white", header: "centered", hero: "framed" } },
  editorial: { label: "Editorial", image: "/images/sailing.jpg", description: "Split introduction for fashion and sailing stories", theme: { fonts: "editorial", palette: "paper", header: "stacked", hero: "split" } },
  darkroom: { label: "Motion", image: "/images/sports.jpg", description: "Dark, full-width opening for sport and action", theme: { fonts: "contemporary", palette: "dark", header: "left", hero: "full" } },
} as const;

export const DEFAULT_THEME: SiteTheme = { fonts: "classic", palette: "white", bg: "#ffffff", ink: "#1c1b19", header: "left", hero: "full", social: "footer", headerAppearance: "tinted", headerLogo: "auto", scrolledHeaderLogo: "auto", headerBorder: false, columns: 2, gap: 24, heroFit: "cover" };

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
    ...((x.layout === "campaign" || x.layout === "gallery") ? { layout: x.layout as "campaign" | "gallery" } : {}),
    headerAppearance: oneOf(x.headerAppearance, ['tinted','transparent','solid'] as const, 'tinted'),
    headerLogo: oneOf(x.headerLogo, ['auto','dark','light'] as const, 'auto'),
    scrolledHeaderLogo: oneOf(x.scrolledHeaderLogo, ['auto','dark','light'] as const, 'auto'),
    headerBorder: x.headerBorder === true,
    columns: typeof x.columns === "number" && Number.isFinite(x.columns) ? Math.round(Math.max(1, Math.min(4, x.columns))) : 2,
    gap: typeof x.gap === "number" && Number.isFinite(x.gap) ? Math.round(Math.max(0, Math.min(80, x.gap))) : 24,
    heroFit: x.heroFit === "contain" ? "contain" : "cover",
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
    "--portfolio-columns": String(t.columns),
    "--portfolio-gap": t.gap+"px",
    "--portfolio-fit": t.heroFit,
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
