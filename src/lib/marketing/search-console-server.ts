import 'server-only';
import { getGoogleAccessToken } from "@/lib/google/service-account";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

interface GSCRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleTotals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleBreakdownRow {
  label: string; // the query text, or the page URL, depending on which list this came from
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleServerData {
  startDate: string;
  endDate: string;
  totals: SearchConsoleTotals;
  topQueries: SearchConsoleBreakdownRow[];
  topPages: SearchConsoleBreakdownRow[];
}

export type SearchConsoleServerResult =
  | { ok: true; data: SearchConsoleServerData }
  | { ok: false; reason: "not-configured-venue" | "not-configured-env" | "error"; message: string; status: number };

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Search Console data typically has a 2-3 day reporting lag, so the window
// ends a few days back rather than "today" (which would just show zeros).
function last28DayRange(): { startDate: string; endDate: string } {
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - 27);
  return { startDate: isoDate(start), endDate: isoDate(end) };
}

/**
 * Shared by both /api/marketing/search-console (raw numbers for the page)
 * and /api/marketing/search-console/insights (feeds this same data to
 * Claude) — one place to fetch from Google rather than two copies of the
 * auth + query logic drifting apart.
 */
export async function fetchSearchConsoleServerData(config: { property: string } | undefined): Promise<SearchConsoleServerResult> {

  if (!config) {
    return {
      ok: false,
      reason: "not-configured-venue",
      message: `No Search Console property connected yet for this studio.`,
      status: 404,
    };
  }

  const accessToken = await getGoogleAccessToken([SCOPE]);
  if (!accessToken) {
    return {
      ok: false,
      reason: "not-configured-env",
      message:
        "Search Console isn't set up in this environment yet — GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL / GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY need to be configured.",
      status: 503,
    };
  }

  const { startDate, endDate } = last28DayRange();
  const siteUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.property)}/searchAnalytics/query`;

  async function query(body: Record<string, unknown>): Promise<GSCRow[] | null> {
    const res = await fetch(siteUrl, {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, endDate, ...body }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("Search Console API error:", res.status, errBody);
      return null;
    }
    const data: { rows?: GSCRow[] } = await res.json();
    return data.rows ?? [];
  }

  const [totalsRows, queryRows, pageRows] = await Promise.all([
    query({}),
    query({ dimensions: ["query"], rowLimit: 10 }),
    query({ dimensions: ["page"], rowLimit: 10 }),
  ]);

  if (totalsRows === null || queryRows === null || pageRows === null) {
    return {
      ok: false,
      reason: "error",
      message:
        "Google rejected the request — check the service account has been added as a user on this property in Search Console, and that the property identifier is exactly right.",
      status: 502,
    };
  }

  const totals = totalsRows[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  return {
    ok: true,
    data: {
      startDate,
      endDate,
      totals: {
        clicks: totals.clicks,
        impressions: totals.impressions,
        ctr: totals.ctr,
        position: totals.position,
      },
      topQueries: queryRows.map((r) => ({
        label: r.keys?.[0] ?? "",
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
      topPages: pageRows.map((r) => ({
        label: r.keys?.[0] ?? "",
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      })),
    },
  };
}