import 'server-only';
import { getGoogleAccessToken } from "@/lib/google/service-account";

// Same service account as Search Console (vsb-dashboard@vsb-group-dashboard.iam.gserviceaccount.com),
// just a different scope and a different Google API — no separate credentials needed.
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

interface GA4Row {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}

interface GA4Response {
  rows?: GA4Row[];
}

export interface WebsiteAnalyticsTotals {
  sessions: number;
  activeUsers: number;
  pageViews: number;
  engagementRate: number; // 0-1
}

export interface WebsiteAnalyticsBreakdownRow {
  label: string;
  sessions: number;
  activeUsers: number;
}

export interface WebsiteAnalyticsServerData {
  startDate: string;
  endDate: string;
  totals: WebsiteAnalyticsTotals;
  topPages: WebsiteAnalyticsBreakdownRow[];
  channels: WebsiteAnalyticsBreakdownRow[];
}

export type WebsiteAnalyticsServerResult =
  | { ok: true; data: WebsiteAnalyticsServerData }
  | { ok: false; reason: "not-configured-venue" | "not-configured-env" | "error"; message: string; status: number };

function num(row: GA4Row | undefined, index: number): number {
  const raw = row?.metricValues?.[index]?.value;
  return raw ? Number(raw) : 0;
}

/**
 * Mirrors lib/marketing/search-console-server.ts: shared fetch logic used by
 * the /api/marketing/website-analytics route (and available later for an AI
 * insights feature the same way Search Console has one). GA4's Data API
 * (analyticsdata.googleapis.com) is a different service to Search Console's
 * but authenticates the exact same way — same service account, just added
 * as a Viewer under the GA4 property instead of in Search Console.
 */
export async function fetchWebsiteAnalyticsServerData(config: { propertyId: string } | undefined): Promise<WebsiteAnalyticsServerResult> {

  if (!config) {
    return {
      ok: false,
      reason: "not-configured-venue",
      message: `No GA4 property connected yet for this studio.`,
      status: 404,
    };
  }

  const accessToken = await getGoogleAccessToken([SCOPE]);
  if (!accessToken) {
    return {
      ok: false,
      reason: "not-configured-env",
      message:
        "Website Analytics isn't set up in this environment yet — GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL / GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY need to be configured (same service account used for Search Console).",
      status: 503,
    };
  }

  const runReportUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;
  // GA4 accepts relative date keywords directly, no need to compute calendar
  // dates ourselves the way Search Console's absolute-date API required.
  const dateRanges = [{ startDate: "28daysAgo", endDate: "yesterday" }];

  let lastError: string | null = null;

  async function query(body: Record<string, unknown>): Promise<GA4Row[] | null> {
    const res = await fetch(runReportUrl, {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ dateRanges, ...body }),
    });
    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("GA4 Data API error:", res.status, errBody);
      // Surface Google's actual reason rather than a generic guess — this is
      // a brand-new API integration (unlike Search Console, which was
      // already verified working), so the real message matters for getting
      // it right on the first try rather than guessing at causes.
      let detail = errBody;
      try {
        const parsed = JSON.parse(errBody);
        detail = parsed?.error?.message ?? errBody;
      } catch {
        // leave detail as the raw body
      }
      lastError = `Google returned ${res.status}: ${detail}`;
      return null;
    }
    const data: GA4Response = await res.json();
    return data.rows ?? [];
  }

  const [totalsRows, pageRows, channelRows] = await Promise.all([
    query({ metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "screenPageViews" }, { name: "engagementRate" }] }),
    query({
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
    query({
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 10,
    }),
  ]);

  if (totalsRows === null || pageRows === null || channelRows === null) {
    return {
      ok: false,
      reason: "error",
      message: lastError
        ? `${lastError} — check the service account has been added as a Viewer on this GA4 property, the Google Analytics Data API is enabled in the vsb-group-dashboard Cloud project, and the property ID is exactly right.`
        : "Google rejected the request — check the service account has been added as a Viewer on this GA4 property, and that the property ID is exactly right.",
      status: 502,
    };
  }

  const totalsRow = totalsRows[0];

  return {
    ok: true,
    data: {
      startDate: dateRanges[0].startDate,
      endDate: dateRanges[0].endDate,
      totals: {
        sessions: num(totalsRow, 0),
        activeUsers: num(totalsRow, 1),
        pageViews: num(totalsRow, 2),
        engagementRate: num(totalsRow, 3),
      },
      topPages: pageRows.map((r) => ({
        label: r.dimensionValues?.[0]?.value ?? "",
        sessions: num(r, 0),
        activeUsers: num(r, 1),
      })),
      channels: channelRows.map((r) => ({
        label: r.dimensionValues?.[0]?.value ?? "",
        sessions: num(r, 0),
        activeUsers: num(r, 1),
      })),
    },
  };
}