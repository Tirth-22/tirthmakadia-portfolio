import raw from "../data/metrics.json";

export interface ContributionDay {
  date: string;
  level: number;
  count: number;
}

export interface LanguageShare {
  name: string;
  bytes: number;
  color: string;
}

export type MetricSource = "live" | "cached" | "fallback" | "unavailable";

export interface Metrics {
  generatedAt: string | null;
  github: {
    username: string;
    profileUrl: string;
    avatarUrl: string;
    repositories: number;
    publicRepos: number;
    commits: number;
    pullRequests: number;
    stars: number;
    followers: number;
    topLanguages: LanguageShare[];
    languageTotalBytes: number;
    contributions: ContributionDay[];
    contributionTotalSource?: string;
    source: MetricSource;
  };
  leetcode: {
    username: string;
    profileUrl: string;
    totalSolved: number;
    ranking: number;
    reputation: number;
    contestRating?: number | null;
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
    source: MetricSource;
  };
}

export const bundledMetrics = raw as unknown as Metrics;
/** @deprecated use bundledMetrics — kept for ResumeModal */
export const metrics = bundledMetrics;

export const isLive = (source: string) => source === "live";

/** Current streak: consecutive days with contributions, walking back from today (UTC). */
export function contributionStreak(days: ContributionDay[] | undefined): number {
  if (!days?.length) return 0;
  const byDate = new Map(days.map((d) => [d.date, d.count]));
  const utc = new Date();
  const iso = (dt: Date) => dt.toISOString().slice(0, 10);
  const shift = (isoDate: string, delta: number) => {
    const t = Date.parse(`${isoDate}T00:00:00Z`) + delta * 86400000;
    return new Date(t).toISOString().slice(0, 10);
  };

  let cursor = iso(utc);
  if ((byDate.get(cursor) ?? 0) === 0) {
    cursor = shift(cursor, -1);
  }

  let streak = 0;
  while ((byDate.get(cursor) ?? 0) > 0) {
    streak += 1;
    cursor = shift(cursor, -1);
  }
  return streak;
}
