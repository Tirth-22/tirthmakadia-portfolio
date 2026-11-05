import { linguistColor } from "./linguistColors";
import {
  bundledMetrics,
  type ContributionDay,
  type LanguageShare,
  type Metrics,
} from "./metrics";

const GH_USER = "Tirth-22";
const LC_USER = "Tirth_22";
const CACHE_KEY = "tm-metrics-live";
const LANG_CACHE_KEY = "tm-metrics-lang-bytes";
const GH = "https://api.github.com";

/** Snapshots older than this trigger a background refresh when the section mounts. */
export const STALE_AFTER_MS = 6 * 60 * 60 * 1000;
/** Per-request timeout so a sleeping proxy can't hang the refresh button. */
const FETCH_TIMEOUT_MS = 15000;

export type DashboardStatus = "live" | "cached" | "unavailable" | "loading";

function normalize(raw: Metrics): Metrics {
  const data = structuredClone(raw);
  const langs = (data.github.topLanguages || []).map((l) => {
    const row = l as LanguageShare & { count?: number };
    return {
      name: row.name,
      bytes: typeof row.bytes === "number" ? row.bytes : 0,
      color: row.color || linguistColor(row.name),
    };
  });
  data.github.topLanguages = langs.filter((l) => l.bytes > 0);
  data.github.languageTotalBytes =
    data.github.languageTotalBytes ||
    langs.reduce((n, l) => n + l.bytes, 0);
  data.github.publicRepos =
    data.github.publicRepos || data.github.repositories || 0;
  return data;
}

function cloneMetrics(src: Metrics): Metrics {
  return normalize(src);
}

function hasGithubData(m: Metrics): boolean {
  return (
    m.github.repositories > 0 ||
    m.github.commits > 0 ||
    m.github.contributions.length > 0
  );
}

function hasLeetCodeData(m: Metrics): boolean {
  return m.leetcode.totalSolved > 0 || m.leetcode.ranking > 0;
}

export function readCachedMetrics(): { data: Metrics; storedAt: string | null } {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return { data: cloneMetrics(bundledMetrics), storedAt: null };
    const parsed = JSON.parse(raw) as { data: Metrics; storedAt: string };
    const bundledAt = bundledMetrics.generatedAt
      ? Date.parse(bundledMetrics.generatedAt)
      : 0;
    const storedAt = parsed.storedAt ? Date.parse(parsed.storedAt) : 0;
    if (parsed.data && storedAt >= bundledAt) {
      return { data: parsed.data, storedAt: parsed.storedAt };
    }
  } catch {
    /* ignore */
  }
  return { data: cloneMetrics(bundledMetrics), storedAt: bundledMetrics.generatedAt };
}

function writeCache(data: Metrics, storedAt: string) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, storedAt }));
  } catch {
    /* private mode */
  }
}

async function ghJson(path: string) {
  // Only CORS-safelisted headers: a custom X-GitHub-Api-Version header would
  // force a CORS preflight (OPTIONS) for every call, doubling the request
  // count against the unauthenticated rate limit.
  const res = await fetch(`${GH}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (res.status === 403 || res.status === 429) {
    throw new Error("GitHub rate limit");
  }
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
}

interface RepoRow {
  id: number;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  languages_url: string;
  pushed_at?: string;
}

async function fetchAllRepos(): Promise<RepoRow[]> {
  const repos: RepoRow[] = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await ghJson(
      `/users/${GH_USER}/repos?per_page=100&page=${page}&type=owner&sort=updated`,
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

/**
 * Per-repo language byte cache, keyed by repo id + last push.
 * Unchanged repos are never re-fetched, so a refresh costs a handful of
 * GitHub API calls instead of one per repository (rate-limit friendly).
 */
type LangCache = Record<string, Record<string, number>>;

function readLangCache(): LangCache {
  try {
    const raw = localStorage.getItem(LANG_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as LangCache;
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

function writeLangCache(cache: LangCache) {
  try {
    localStorage.setItem(LANG_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* private mode */
  }
}

async function aggregateLanguages(
  repos: RepoRow[],
): Promise<{ list: LanguageShare[]; total: number }> {
  const eligible = repos.filter((r) => !r.fork && !r.archived);
  const cache = readLangCache();
  const nextCache: LangCache = {};
  const byLang: Record<string, number> = {};
  const pending: { key: string; path: string }[] = [];

  const add = (entry: Record<string, number>) => {
    for (const [name, bytes] of Object.entries(entry)) {
      if (typeof bytes === "number" && bytes > 0) {
        byLang[name] = (byLang[name] || 0) + bytes;
      }
    }
  };

  for (const r of eligible) {
    const key = `${r.id}:${r.pushed_at || ""}`;
    const hit = cache[key];
    if (hit && typeof hit === "object") {
      nextCache[key] = hit;
      add(hit);
    } else {
      pending.push({ key, path: r.languages_url.replace(GH, "") });
    }
  }

  const workers = 3;
  let i = 0;
  let failed = 0;
  async function worker() {
    while (i < pending.length) {
      const { key, path } = pending[i++];
      try {
        const langs = (await ghJson(path)) as Record<string, number>;
        const entry: Record<string, number> = {};
        for (const [name, bytes] of Object.entries(langs)) {
          if (typeof bytes === "number" && bytes > 0) entry[name] = bytes;
        }
        nextCache[key] = entry; // repos with no detected languages cache as {}
        add(entry);
      } catch {
        failed += 1; // retried on the next refresh (never cached as a miss)
      }
    }
  }
  await Promise.all(Array.from({ length: workers }, worker));
  writeLangCache(nextCache); // only current repos are kept, so the cache self-prunes

  // A heavily truncated result (e.g. GitHub rate limit mid-way) must not
  // replace a complete snapshot — keep the previous distribution instead.
  const incomplete =
    failed > 0 && failed / Math.max(1, eligible.length) > 0.1;
  if (incomplete) throw new Error("language fetch incomplete");

  const total = Object.values(byLang).reduce((n, v) => n + v, 0);
  const list = Object.entries(byLang)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({
      name,
      bytes,
      color: linguistColor(name),
    }));
  return { list, total };
}

async function refreshGithub(data: Metrics): Promise<void> {
  const user = await ghJson(`/users/${GH_USER}`);
  data.github.followers = user.followers ?? data.github.followers;
  data.github.avatarUrl = user.avatar_url || data.github.avatarUrl;
  data.github.publicRepos = user.public_repos ?? data.github.publicRepos;

  const repos = await fetchAllRepos();
  if (!repos.length) throw new Error("GitHub returned no repositories");

  const owned = repos.filter((r) => !r.fork);
  const activePublic = owned.filter((r) => !r.archived);
  data.github.repositories = activePublic.length;
  data.github.stars = owned.reduce((n, r) => n + (r.stargazers_count || 0), 0);

  try {
    const langs = await aggregateLanguages(repos);
    if (langs.total > 0) {
      data.github.topLanguages = langs.list;
      data.github.languageTotalBytes = langs.total;
    }
  } catch {
    /* keep previous languages */
  }

  try {
    const search = await ghJson(
      `/search/issues?q=${encodeURIComponent(`author:${GH_USER} type:pr`)}&per_page=1`,
    );
    if (typeof search.total_count === "number") {
      data.github.pullRequests = search.total_count;
    }
  } catch {
    /* keep previous PRs */
  }

  data.github.source = "live";
}

/**
 * Contribution history for the last year (heatmap + commit count + streak).
 * GitHub's own endpoints are not CORS-enabled, so we use the public
 * github-contributions-api proxy, which mirrors GitHub's calendar exactly.
 * On failure the previous history is kept — nothing is ever fabricated.
 */
async function refreshContributions(data: Metrics): Promise<void> {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${GH_USER}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`contributions ${res.status}`);
  const json = (await res.json()) as {
    contributions?: Array<{ date?: unknown; count?: unknown; level?: unknown }>;
  };
  if (!Array.isArray(json.contributions)) throw new Error("bad contributions payload");

  const today = new Date().toISOString().slice(0, 10);
  const cutoff = new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10);
  const days = json.contributions
    .map((d) => ({
      date: String(d.date ?? ""),
      level: Math.min(4, Math.max(0, Number(d.level) || 0)),
      count: Math.max(0, Number(d.count) || 0),
    }))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && d.date >= cutoff && d.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  // GitHub's calendar covers ~366 days; anything much shorter is a bad payload.
  if (days.length < 300) throw new Error("incomplete contribution range");

  data.github.contributions = days;
  data.github.commits = days.reduce((n, d) => n + d.count, 0);
  data.github.contributionTotalSource = "api";
  data.github.source = "live";
}

/** Public CORS-enabled mirrors of LeetCode's GraphQL stats (in order of preference). */
const LC_ENDPOINTS = [
  `https://alfa-leetcode-api.onrender.com/${LC_USER}/profile`,
  `https://leetcode-stats-api.vercel.app/${LC_USER}`,
  `https://leetcode-api.fly.dev/${LC_USER}`,
];

function parseLeetCode(data: Metrics, payload: Record<string, unknown>): void {
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : NaN);

  const easySolved = num(payload.easySolved);
  const mediumSolved = num(payload.mediumSolved);
  const hardSolved = num(payload.hardSolved);
  const allSolved =
    Number.isFinite(easySolved) && Number.isFinite(mediumSolved) && Number.isFinite(hardSolved)
      ? easySolved + mediumSolved + hardSolved
      : num(payload.totalSolved);
  if (!Number.isFinite(allSolved) || allSolved <= 0) {
    throw new Error("leetcode payload missing stats");
  }

  data.leetcode.totalSolved = allSolved;
  if (Number.isFinite(easySolved)) {
    const total = num(payload.totalEasy);
    data.leetcode.easy = {
      solved: easySolved,
      total: total > 0 ? total : data.leetcode.easy.total,
    };
  }
  if (Number.isFinite(mediumSolved)) {
    const total = num(payload.totalMedium);
    data.leetcode.medium = {
      solved: mediumSolved,
      total: total > 0 ? total : data.leetcode.medium.total,
    };
  }
  if (Number.isFinite(hardSolved)) {
    const total = num(payload.totalHard);
    data.leetcode.hard = {
      solved: hardSolved,
      total: total > 0 ? total : data.leetcode.hard.total,
    };
  }

  const ranking = num(payload.ranking);
  if (ranking > 0) data.leetcode.ranking = ranking;

  const reputation = num(payload.reputation);
  if (Number.isFinite(reputation)) data.leetcode.reputation = reputation;

  // Contest rating only when a real rating is present — never invented.
  const ucr = payload.userContestRanking;
  const direct = num(payload.contestRating);
  const fromUcr =
    ucr && typeof ucr === "object" ? num((ucr as { rating?: unknown }).rating) : NaN;
  const rating = direct > 0 ? direct : fromUcr;
  if (rating > 0) data.leetcode.contestRating = rating;

  data.leetcode.source = "live";
}

async function refreshLeetCode(data: Metrics): Promise<void> {
  let payload: Record<string, unknown> | null = null;
  for (const url of LC_ENDPOINTS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
      if (!res.ok) continue;
      const json = await res.json();
      if (json && (typeof json.totalSolved === "number" || json.status === "success")) {
        payload = json;
        break;
      }
    } catch {
      /* try next endpoint */
    }
  }
  if (!payload) throw new Error("leetcode unavailable");
  parseLeetCode(data, payload);
}

export function dashboardStatus(data: Metrics, fromLiveRefresh: boolean): DashboardStatus {
  const ghOk = hasGithubData(data);
  const lcOk = hasLeetCodeData(data);
  if (!ghOk && !lcOk) return "unavailable";
  if (fromLiveRefresh && (data.github.source === "live" || data.leetcode.source === "live")) {
    return "live";
  }
  return "cached";
}

export async function refreshMetrics(current: Metrics): Promise<{
  data: Metrics;
  ok: boolean;
  github: boolean;
  leetcode: boolean;
}> {
  const next = cloneMetrics(current);
  let github = false;
  let leetcode = false;

  try {
    await refreshGithub(next);
    github = true;
  } catch {
    next.github.source = hasGithubData(next) ? "cached" : "unavailable";
  }

  try {
    await refreshContributions(next);
    github = true;
  } catch {
    /* keep previous contribution history */
  }

  try {
    await refreshLeetCode(next);
    leetcode = true;
  } catch {
    next.leetcode.source = hasLeetCodeData(next) ? "cached" : "unavailable";
  }

  const ok = github || leetcode;
  if (ok) {
    const stamp = new Date().toISOString();
    next.generatedAt = stamp;
    writeCache(next, stamp);
  }

  return { data: next, ok, github, leetcode };
}

export function initialDashboard(): {
  data: Metrics;
  status: DashboardStatus;
  updatedAt: string | null;
} {
  const { data, storedAt } = readCachedMetrics();
  if (!hasGithubData(data) && !hasLeetCodeData(data)) {
    return { data, status: "unavailable", updatedAt: storedAt };
  }
  return { data, status: "cached", updatedAt: storedAt || data.generatedAt };
}

export function languagePercent(bytes: number, total: number): number {
  if (!total) return 0;
  return (bytes / total) * 100;
}

export function formatLanguagePercent(bytes: number, total: number): string {
  const pct = languagePercent(bytes, total);
  if (pct > 0 && pct < 1) return "<1";
  return String(Math.round(pct));
}

export type { ContributionDay, Metrics };
