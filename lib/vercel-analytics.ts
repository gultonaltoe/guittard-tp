const VERCEL_API_BASE = "https://api.vercel.com";
const DEFAULT_PROJECT_ID = "prj_mBUyMlCWiDLQMNrOZvMhgIatl7Ur";
const DEFAULT_TEAM_ID = "team_T79Q8bIAc9dYLg8Ttk3OTLsu";

export type TrafficStats =
  | { status: "not_configured" }
  | { status: "not_enabled" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      visitors: number;
      pageviews: number;
      topPages: { path: string; views: number }[];
      topReferrers: { source: string; views: number }[];
    };

interface CountResponseBody {
  data: { pageviews: number; visitors: number };
}

interface AggregateRow {
  route?: string;
  referrerHostname?: string;
  pageviews: number;
  visitors: number;
}

interface AggregateResponseBody {
  data: AggregateRow[];
}

function getVercelConfig() {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return null;
  return {
    token,
    projectId: process.env.VERCEL_PROJECT_ID || DEFAULT_PROJECT_ID,
    teamId: process.env.VERCEL_TEAM_ID || DEFAULT_TEAM_ID,
  };
}

async function vercelAnalyticsFetch(
  path: string,
  params: Record<string, string>,
  token: string
) {
  const url = new URL(`${VERCEL_API_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
}

/** Récupère les statistiques de trafic (visiteurs, pages vues, pages et provenances) via l'API Vercel Web Analytics. */
export async function getTrafficStats(periodDays: 7 | 30 | 90): Promise<TrafficStats> {
  const config = getVercelConfig();
  if (!config) return { status: "not_configured" };
  const { token, projectId, teamId } = config;

  const until = new Date();
  const since = new Date(until.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const range = { projectId, teamId, since: since.toISOString(), until: until.toISOString() };

  try {
    const [countRes, pagesRes, referrersRes] = await Promise.all([
      vercelAnalyticsFetch("/v1/query/web-analytics/visits/count", range, token),
      vercelAnalyticsFetch(
        "/v1/query/web-analytics/visits/aggregate",
        { ...range, by: "route", limit: "5" },
        token
      ),
      vercelAnalyticsFetch(
        "/v1/query/web-analytics/visits/aggregate",
        { ...range, by: "referrerHostname", limit: "5" },
        token
      ),
    ]);

    if (countRes.status === 404) return { status: "not_enabled" };
    if (!countRes.ok) {
      return { status: "error", message: `Erreur API Vercel (${countRes.status}).` };
    }

    const countBody: CountResponseBody = await countRes.json();
    const pagesBody: AggregateResponseBody = pagesRes.ok
      ? await pagesRes.json()
      : { data: [] };
    const referrersBody: AggregateResponseBody = referrersRes.ok
      ? await referrersRes.json()
      : { data: [] };

    return {
      status: "ok",
      visitors: countBody.data?.visitors ?? 0,
      pageviews: countBody.data?.pageviews ?? 0,
      topPages: pagesBody.data.map((row) => ({
        path: row.route || "/",
        views: row.pageviews ?? 0,
      })),
      topReferrers: referrersBody.data.map((row) => ({
        source: row.referrerHostname || "Accès direct",
        views: row.pageviews ?? 0,
      })),
    };
  } catch (err) {
    return {
      status: "error",
      message: err instanceof Error ? err.message : "Erreur inattendue.",
    };
  }
}
