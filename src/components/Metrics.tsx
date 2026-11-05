import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ArrowUpRight,
  Boxes,
  Flame,
  GitBranch,
  GitCommit,
  GitPullRequest,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";
import SectionHeading from "./SectionHeading";
import TiltCard from "./TiltCard";
import Counter from "./Counter";
import ContributionCalendar from "./ContributionCalendar";
import { contributionStreak } from "../lib/metrics";
import {
  dashboardStatus,
  formatLanguagePercent,
  initialDashboard,
  refreshMetrics,
  STALE_AFTER_MS,
  type DashboardStatus,
  type Metrics,
} from "../lib/liveMetrics";
import { linguistColor } from "../lib/linguistColors";
import { EASE } from "../lib/motion";
import { GitHubIcon, LeetCodeIcon } from "./icons/BrandIcons";

const RINGS = [
  { key: "easy", label: "Easy", color: "#A3E635" },
  { key: "medium", label: "Medium", color: "#F59E0B" },
  { key: "hard", label: "Hard", color: "#EF4444" },
] as const;

function StatCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Boxes;
  label: string;
  value: number;
  note: string;
}) {
  return (
    <TiltCard className="group h-full" max={8}>
      <div className="panel flex h-full flex-col justify-between rounded-2xl border border-line p-4 transition-colors duration-300 hover:border-[var(--c-line-strong)]">
        <div className="flex items-start justify-between gap-2">
          <span className="grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-slate-300">
            <Icon className="size-4" />
          </span>
          <span className="font-mono text-[9px] tracking-[0.14em] text-slate-400 uppercase">
            {note}
          </span>
        </div>
        <div className="mt-5">
          <div className="font-sans text-[26px] leading-none font-semibold tracking-tighter text-white">
            <Counter key={value} value={value} />
          </div>
          <div className="mt-1.5 font-mono text-[9.5px] tracking-[0.16em] text-slate-400 uppercase">
            {label}
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

function Ring({
  label,
  color,
  value,
  total,
  delay,
}: {
  label: string;
  color: string;
  value: number;
  total: number;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const r = 30;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, value / total) : 0;

  return (
    <div ref={ref} className="flex flex-col items-center gap-2.5">
      <div className="relative">
        <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90">
          <circle
            cx="38"
            cy="38"
            r={r}
            fill="none"
            stroke="var(--c-line-strong)"
            strokeWidth="6"
          />
          <motion.circle
            cx="38"
            cy="38"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: inView ? c * (1 - pct) : c }}
            transition={{ duration: 1.4, delay, ease: EASE }}
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-lg font-semibold tracking-tight">
            <Counter key={value} value={value} duration={1200} />
          </span>
        </div>
      </div>
      <span className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
        {label}
      </span>
      <span className="font-mono text-[9.5px] text-faint">
        of {total || "—"}
      </span>
    </div>
  );
}

function statusStyle(status: DashboardStatus) {
  if (status === "live")
    return { label: "LIVE", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" };
  if (status === "loading")
    return { label: "REFRESHING", className: "border-white/15 bg-white/5 text-slate-300" };
  if (status === "unavailable")
    return { label: "UNAVAILABLE", className: "border-red-500/30 bg-red-500/10 text-red-400" };
  return { label: "CACHED", className: "border-amber-500/30 bg-amber-500/10 text-amber-300" };
}

export default function Metrics() {
  const boot = useMemo(() => initialDashboard(), []);
  const [data, setData] = useState<Metrics>(boot.data);
  const [status, setStatus] = useState<DashboardStatus>(boot.status);
  const [updatedAt, setUpdatedAt] = useState<string | null>(boot.updatedAt);
  const [refreshing, setRefreshing] = useState(false);
  const inflight = useRef(false);

  const gh = data.github;
  const lc = data.leetcode;
  const streak = contributionStreak(gh.contributions);
  const displayedLangs = gh.topLanguages.slice(0, 5);
  const langTotal = gh.languageTotalBytes || 0;

  const generated = updatedAt
    ? new Date(updatedAt).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const onRefresh = useCallback(async () => {
    if (inflight.current) return;
    inflight.current = true;
    setRefreshing(true);
    setStatus("loading");
    try {
      const result = await refreshMetrics(data);
      setData(result.data);
      setStatus(dashboardStatus(result.data, result.ok));
      if (result.ok && result.data.generatedAt) {
        setUpdatedAt(result.data.generatedAt);
      }
    } catch {
      setStatus(dashboardStatus(data, false));
    } finally {
      inflight.current = false;
      setRefreshing(false);
    }
  }, [data]);

  const pill = statusStyle(status);

  // Background refresh for stale snapshots, so the dashboard stays genuinely
  // live without waiting for a manual refresh. Guarded against duplicate runs
  // (StrictMode double-mount) and against firing while data is fresh.
  const bootedRef = useRef(false);
  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    const age = updatedAt ? Date.now() - Date.parse(updatedAt) : Number.NaN;
    if (!Number.isFinite(age) || age >= STALE_AFTER_MS) void onRefresh();
  }, [onRefresh, updatedAt]);

  return (
    <section id="metrics" className="relative scroll-mt-24 py-24 md:py-32">
      <div className="shell">
        <SectionHeading
          index="05"
          label="Live Metrics · Proof of Work"
          title={
            <>
              Work I`ve done , <span className="text-gradient">pulled live</span>.
            </>
          }
          description="Real contribution history from GitHub and problem-solving stats from LeetCode — refresh to pull the latest public data."
        />

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.16em] uppercase ${pill.className}`}
            >
              <span className="status-dot scale-75" />
              {pill.label}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Updated {generated}
            </span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            data-cursor="link"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 font-mono text-[11px] tracking-[0.12em] text-slate-300 uppercase transition-all duration-200 hover:border-white/30 hover:text-white disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="min-w-0 rounded-2xl border border-[#30363d] bg-[#0d1117] p-5 shadow-2xl md:p-6 lg:col-span-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#30363d]/70 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg border border-[#30363d] bg-[#161b22] text-white">
                  <GitHubIcon className="size-4.5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-[14.5px] font-semibold tracking-tight text-white">
                      GitHub Activity
                    </p>
                    <span className="rounded-full border border-[#30363d] bg-[#21262d] px-2 py-0.5 font-mono text-[9px] text-[#7d8590]">
                      Public
                    </span>
                  </div>
                  <a
                    href={gh.profileUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="open"
                    className="group flex items-center gap-1 font-mono text-[11px] text-[#58a6ff] hover:underline"
                  >
                    @{gh.username}
                    <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-[10.5px]">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-2.5 py-1 text-slate-300">
                  <GitCommit className="size-3 text-[#3fb950]" />
                  <span>Commits:</span>
                  <span className="font-semibold text-white">{gh.commits}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-2.5 py-1 text-slate-300">
                  <Boxes className="size-3 text-[#58a6ff]" />
                  <span>Repos:</span>
                  <span className="font-semibold text-white">{gh.repositories}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-2.5 py-1 text-slate-300">
                  <Users className="size-3 text-[#bc8cff]" />
                  <span>Followers:</span>
                  <span className="font-semibold text-white">{gh.followers}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-[#30363d] bg-[#161b22] px-2.5 py-1 text-slate-300">
                  <Flame className="size-3 text-[#f0883e]" />
                  <span>Streak:</span>
                  <span className="font-semibold text-white">{streak}d</span>
                </div>
              </div>
            </div>

            <ContributionCalendar days={gh.contributions} total={gh.commits} />
          </div>

          <div className="min-w-0 grid gap-5 sm:grid-cols-2 lg:col-span-4">
            <StatCard
              icon={Boxes}
              label="Active public repos"
              value={gh.repositories}
              note="public"
            />
            <StatCard
              icon={GitBranch}
              label="Commits / year"
              value={gh.commits}
              note="12 mo"
            />
            <StatCard
              icon={GitPullRequest}
              label="Authored pull requests"
              value={gh.pullRequests}
              note="authored"
            />
            <StatCard
              icon={Star}
              label="Total stars earned"
              value={gh.stars}
              note="total"
            />
          </div>

          <div className="panel min-w-0 rounded-2xl border border-line bg-surface p-5 md:p-6 lg:col-span-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-[#FFA116]">
                  <LeetCodeIcon className="size-4.5" />
                </span>
                <div>
                  <p className="font-sans text-[14.5px] font-semibold tracking-tight text-white">
                    LeetCode Performance
                  </p>
                  <a
                    href={lc.profileUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="open"
                    className="group flex items-center gap-1 font-mono text-[11px] text-slate-400 transition-colors hover:text-[#FFA116]"
                  >
                    @{lc.username}
                    <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.14em] text-slate-300 uppercase">
                <span className="status-dot scale-75" />
                {lc.source === "live" ? "live data" : lc.source === "unavailable" ? "unavailable" : "cached"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex gap-4 sm:gap-7">
                {RINGS.map((r, i) => (
                  <Ring
                    key={r.key}
                    label={r.label}
                    color={r.color}
                    value={lc[r.key].solved}
                    total={lc[r.key].total}
                    delay={i * 0.15}
                  />
                ))}
              </div>

              <div className="min-w-[160px] flex-1 space-y-2.5">
                <div className="flex items-baseline justify-between border-b border-line pb-2.5">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-slate-400 uppercase">
                    Total solved
                  </span>
                  <span className="font-sans text-xl font-semibold tracking-tighter text-white">
                    <Counter key={lc.totalSolved} value={lc.totalSolved} />
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-b border-line pb-2.5">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-slate-400 uppercase">
                    Ranking
                  </span>
                  <span className="font-mono text-[13px] font-medium text-slate-200">
                    {lc.ranking ? `#${lc.ranking.toLocaleString("en-US")}` : "—"}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] tracking-[0.14em] text-slate-400 uppercase">
                    Contest rating
                  </span>
                  <span className="font-mono text-[13px] font-medium text-slate-200">
                    {lc.contestRating ? Math.round(lc.contestRating) : "—"}
                  </span>
                </div>
                <a
                  href={lc.profileUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="open"
                  className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-surface-2 px-4 py-2.5 text-[12.5px] font-medium text-slate-200 transition-all duration-300 hover:border-[#FFA116] hover:text-[#FFA116]"
                >
                  Solve alongside me
                  <ArrowUpRight className="size-3.5" />
                </a>
              </div>
            </div>
          </div>

          <div className="panel min-w-0 rounded-2xl border border-line bg-surface p-5 md:p-6 lg:col-span-5">
            <p className="mb-1.5 font-mono text-[10px] tracking-[0.18em] text-slate-400 uppercase">
              Repository Languages
            </p>
            <p className="mb-5 font-mono text-[10px] text-slate-500">
              Top languages by source bytes across active public, non-fork repos
            </p>

            <div className="space-y-4">
              {displayedLangs.map((l) => {
                const pct = formatLanguagePercent(l.bytes, langTotal);
                const width = langTotal ? Math.max(2, (l.bytes / langTotal) * 100) : 0;
                const color = l.color || linguistColor(l.name);
                return (
                  <div key={l.name}>
                    <div className="mb-1.5 flex justify-between font-mono text-[11px]">
                      <span className="font-medium text-slate-200">{l.name}</span>
                      <span className="text-slate-400">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${width}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {displayedLangs.length === 0 && (
                <p className="font-mono text-[12px] text-slate-400">
                  Language data unavailable.
                </p>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-5">
              <div>
                <p className="font-mono text-[9.5px] tracking-[0.14em] text-slate-400 uppercase">
                  Followers
                </p>
                <p className="mt-1 font-sans text-lg font-semibold tracking-tighter text-white">
                  <Counter key={gh.followers} value={gh.followers} />
                </p>
              </div>
              <div>
                <p className="font-mono text-[9.5px] tracking-[0.14em] text-slate-400 uppercase">
                  Snapshot
                </p>
                <p className="mt-1 font-mono text-[13px] font-medium text-slate-300">
                  {generated}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
