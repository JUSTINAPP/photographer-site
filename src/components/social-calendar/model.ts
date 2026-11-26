import { LayoutGrid, GalleryHorizontal, Film, BookOpen, Circle, Clock, CheckCircle2, AlertCircle, type LucideIcon } from 'lucide-react';
export type SocialChannel = 'instagram' | 'facebook' | 'tiktok' | 'event' | 'article' | 'linkedin';
export type SocialStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type PostFormat = 'grid' | 'carousel' | 'reel' | 'story';
export interface SocialPost { id: string; channel: SocialChannel; format?: PostFormat; title: string; caption: string; contentBrief?: string; scheduledDate: string; scheduledTime: string; imageUrl: string | null; imageUrls?: string[]; videoUrl?: string | null; status: SocialStatus; mediaIds?: string[]; likes?: number; comments?: number; reach?: number; }
export interface Media { id: string; name: string; kind: string; source_url: string; }
export const cn = (...values: (string | false | null | undefined)[]) => values.filter(Boolean).join(' ');
export const formatDate = (date: string) => date ? new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date + 'T12:00:00')) : 'Unscheduled';
export function formatTime(time: string) {
 const [h,m]=time.split(':').map(Number);
 if(!Number.isFinite(h)||!Number.isFinite(m))return 'Time not set';
 return `${h%12||12}:${String(m).padStart(2,'0')} ${h>=12?'PM':'AM'}`;
}
export const SUGGESTION_DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const;
export interface PostingSuggestion { day: typeof SUGGESTION_DAY_LABELS[number]; time: string; contentType: PostFormat; contentSuggestion: string; reason: string; }
export const CHANNEL_COLORS: Record<SocialChannel, { bg: string; border: string; text: string; dot: string }> = {
  linkedin: { bg: "#e3f0fb", border: "#a7cdf0", text: "#1e4f8a", dot: "#0a66c2" },
  instagram: { bg: "#fce4ec", border: "#f3a8c5", text: "#9d174d", dot: "#e1306c" },
  facebook: { bg: "#e3f0fb", border: "#a7cdf0", text: "#1e4f8a", dot: "#1877f2" },
  tiktok: { bg: "#efe6fb", border: "#c9aef0", text: "#5b21a6", dot: "#833ab4" },
  event: { bg: "#fef3e0", border: "#f6d896", text: "#92620a", dot: "#f5a623" },
  article: { bg: "#e6f5f0", border: "#a8ddc8", text: "#0f6848", dot: "#14b876" },
};

export const CHANNEL_LABELS: Record<SocialChannel, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  event: "Event",
  article: "Article",
};

export const FORMAT_META: Record<PostFormat, { label: string; icon: LucideIcon; color: string }> = {
  grid: { label: "Photo", icon: LayoutGrid, color: "#64748b" }, // slate — standard feed post
  carousel: { label: "Carousel", icon: GalleryHorizontal, color: "#0891b2" }, // cyan
  reel: { label: "Reel", icon: Film, color: "#7c3aed" }, // violet
  story: { label: "Story", icon: BookOpen, color: "#f59e0b" }, // amber — stands out; these run daily
};

export const STATUS_META: Record<
  SocialStatus,
  { label: string; icon: LucideIcon; border: string; text: string; bg: string; dot: string }
> = {
  draft: { label: "Draft", icon: Circle, border: "#9ca3af", text: "#4b5563", bg: "#f3f4f6", dot: "#9ca3af" },
  scheduled: { label: "Scheduled", icon: Clock, border: "#3b82f6", text: "#1d4ed8", bg: "#eff6ff", dot: "#3b82f6" },
  published: { label: "Published", icon: CheckCircle2, border: "#22c55e", text: "#15803d", bg: "#f0fdf4", dot: "#22c55e" },
  failed: { label: "Failed", icon: AlertCircle, border: "#ef4444", text: "#b91c1c", bg: "#fef2f2", dot: "#ef4444" },
};

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "Today" is the venues' calendar date (Melbourne), not the browser's or the
// server's, so the calendar highlight, the default date for new posts and the
// scheduled-post cron all agree on what day it is.
export function today(): Date {
  const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());
  const [y,m,day] = stamp.split('-').map(Number);
  const d = new Date(y,m-1,day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day; // week starts Monday
  return addDays(copy, diff);
}

export function getCurrentWeekDates(): string[] {
  const monday = startOfWeek(today());
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(monday, i)));
}

export function daysAgoISO(days: number): string {
  return toISODate(addDays(today(), -days));
}

export function daysFromNowISO(days: number): string {
  return toISODate(addDays(today(), days));
}

// Computed once when the page's JavaScript first loads, so it goes stale if a
// tab stays open past midnight. Fine for the mock data that uses it; anything
// the user looks at over a working day (the Social Calendar) should call
// todayISO() instead, which reads the clock each time it renders.
export const TODAY_ISO = toISODate(today());

/** Today's date as yyyy-MM-dd, read fresh on every call. */
export function todayISO(): string {
  return toISODate(today());
}

/** The seven yyyy-MM-dd dates (Monday to Sunday) of the week containing `anchor`. */
export function weekDatesFor(anchor: Date): string[] {
  const monday = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => toISODate(addDays(monday, i)));
}

/** The first of the month `months` away from `d` (negative for earlier months). */
export function addMonths(d: Date, months: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

export function getMonthGrid(reference: Date): { date: string; inMonth: boolean }[][] {
  const month = reference.getMonth();
  const firstOfMonth = new Date(reference.getFullYear(), month, 1);
  const gridStart = startOfWeek(firstOfMonth);

  const weeks: { date: string; inMonth: boolean }[][] = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w++) {
    const week: { date: string; inMonth: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({ date: toISODate(cursor), inMonth: cursor.getMonth() === month });
      cursor = addDays(cursor, 1);
    }
    weeks.push(week);
  }
  return weeks;
}
