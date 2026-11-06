import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { GitHubIcon, LeetCodeIcon } from "./icons/BrandIcons";

const LEETCODE_CONCEPTS = [
  { label: "Dynamic\nProgramming", cx: 105, cy: 32, r: 26 },
  { label: "Bit\nManip.", cx: 189, cy: 28, r: 22 },
  { label: "String", cx: 290, cy: 32, r: 26 },
  { label: "Recursion", cx: 226, cy: 61, r: 18 },
  { label: "Monotonic\nStack", cx: 240, cy: 21, r: 15 },
  { label: "Heap\n(PQ)", cx: 99, cy: 88, r: 21 },
  { label: "Stack", cx: 151, cy: 64, r: 20 },
  { label: "Array", cx: 403, cy: 84, r: 28 },
  { label: "Linked\nList", cx: 346, cy: 96, r: 20 },
  { label: "Geometry", cx: 266, cy: 79, r: 17 },
  { label: "Counting", cx: 339, cy: 50, r: 16 },
  { label: "Sorting", cx: 97, cy: 141, r: 23 },
  { label: "Two\nPointers", cx: 143, cy: 114, r: 21 },
  { label: "Queue", cx: 226, cy: 104, r: 16 },
  { label: "Union-\nFind", cx: 186, cy: 93, r: 16 },
  { label: "Greedy", cx: 377, cy: 141, r: 24 },
  { label: "Tree", cx: 275, cy: 146, r: 22 },
  { label: "Number\nTheory", cx: 301, cy: 105, r: 17 },
  { label: "Binary\nTree", cx: 49, cy: 87, r: 19 },
  { label: "BFS", cx: 46, cy: 135, r: 19 },
  { label: "Hash\nTable", cx: 61, cy: 185, r: 24 },
  { label: "Matrix", cx: 113, cy: 190, r: 19 },
  { label: "Math", cx: 166, cy: 185, r: 24 },
  { label: "Sliding\nWindow", cx: 186, cy: 137, r: 18 },
  { label: "Prefix\nSum", cx: 325, cy: 143, r: 18 },
  { label: "Binary\nSearch", cx: 307, cy: 188, r: 21 },
  { label: "DFS", cx: 356, cy: 190, r: 19 },
  { label: "Design", cx: 258, cy: 192, r: 17 },
  { label: "Trie", cx: 228, cy: 146, r: 16 },
  { label: "Divide &\nConquer", cx: 215, cy: 186, r: 16 },
];

/* Profile badges earned on LeetCode — shown under the language list */
const LEETCODE_BADGES = [
  { days: 100, year: 2025 },
  { days: 50, year: 2025 },
];

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
          <span className="grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-ink/85">
            <Icon className="size-4" />
          </span>
          <span className="font-mono text-[9px] tracking-[0.14em] text-muted uppercase">
            {note}
          </span>
        </div>
        <div className="mt-5">
          <div className="font-sans text-[26px] leading-none font-semibold tracking-tighter text-ink">
            <Counter key={value} value={value} />
          </div>
          <div className="mt-1.5 font-mono text-[9.5px] tracking-[0.16em] text-muted uppercase">
            {label}
          </div>
        </div>
      </div>
    </TiltCard>
  );
}


function statusStyle(status: DashboardStatus) {
  if (status === "live")
    return { label: "LIVE", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" };
  if (status === "loading")
    return { label: "REFRESHING", className: "border-line bg-surface-2 text-ink/85" };
  if (status === "unavailable")
    return { label: "UNAVAILABLE", className: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400" };
  return { label: "CACHED", className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300" };
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
            <span className="font-mono text-[11px] text-muted">
              Updated {generated}
            </span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            data-cursor="link"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 font-mono text-[11px] tracking-[0.12em] text-ink/85 uppercase transition-all duration-200 hover:border-[var(--c-line-strong)] hover:text-ink disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-12">
          <div className="min-w-0 rounded-2xl border border-line bg-surface dark:border-[#30363d] dark:bg-[#0d1117] p-5 shadow-2xl md:p-6 lg:col-span-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line dark:border-[#30363d]/70 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-ink">
                  <GitHubIcon className="size-4.5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-[14.5px] font-semibold tracking-tight text-ink">
                      GitHub Activity
                    </p>
                    <span className="rounded-full border border-line bg-surface-2 px-2 py-0.5 font-mono text-[9px] text-[#57606a] dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#7d8590]">
                      Public
                    </span>
                  </div>
                  <a
                    href={gh.profileUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="open"
                    className="group flex items-center gap-1 font-mono text-[11px] text-[#0969da] hover:underline dark:text-[#58a6ff]"
                  >
                    @{gh.username}
                    <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-mono text-[10.5px]">
                <div className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1 text-ink/85">
                  <GitCommit className="size-3 text-[#1a7f37] dark:text-[#3fb950]" />
                  <span>Commits:</span>
                  <span className="font-semibold text-ink">{gh.commits}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1 text-ink/85">
                  <Boxes className="size-3 text-[#0969da] dark:text-[#58a6ff]" />
                  <span>Repos:</span>
                  <span className="font-semibold text-ink">{gh.repositories}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1 text-ink/85">
                  <Users className="size-3 text-[#8250df] dark:text-[#bc8cff]" />
                  <span>Followers:</span>
                  <span className="font-semibold text-ink">{gh.followers}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2.5 py-1 text-ink/85">
                  <Flame className="size-3 text-[#bc4c00] dark:text-[#f0883e]" />
                  <span>Streak:</span>
                  <span className="font-semibold text-ink">{streak}d</span>
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

          {/* --------------------------------- LeetCode Card (Performance + Image 1 Concepts) */}
          <div className="panel min-w-0 rounded-2xl border border-line bg-surface p-5 md:p-6 lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              {/* Card Header */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg border border-line bg-surface-2 text-[#FFA116]">
                    <LeetCodeIcon className="size-4.5" />
                  </span>
                  <div>
                    <p className="font-sans text-[14.5px] font-semibold tracking-tight text-ink">
                      LeetCode Performance
                    </p>
                    <a
                      href={lc.profileUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="open"
                      className="group flex items-center gap-1 font-mono text-[11px] text-muted transition-colors hover:text-[#9a5b00] dark:hover:text-[#FFA116]"
                    >
                      @{lc.username}
                      <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.14em] text-ink/85 uppercase">
                  <span className="status-dot scale-75" />
                  {lc.source === "live" ? "live data" : lc.source === "unavailable" ? "unavailable" : "cached"}
                </span>
              </div>

              {/* Total Solved + Beats 84.4% */}
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.16em] text-muted uppercase">
                    Total Solved
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-[#0369a1] dark:text-[#38bdf8]">
                      <Counter key={lc.totalSolved || 122} value={lc.totalSolved || 122} />
                    </span>
                    <span className="font-sans text-sm font-medium text-ink/85">
                      Problems
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 font-mono text-[11px] text-ink/85 shadow-sm">
                  <span>👋</span>
                  <span>Beats <strong className="text-ink">84.4%</strong></span>
                </div>
              </div>

              {/* Difficulty Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                <div className="flex items-center justify-between rounded-xl border border-[#2dd4bf]/25 bg-[#2dd4bf]/5 px-3 py-2">
                  <span className="font-mono text-[11.5px] font-semibold text-[#0f766e] dark:text-[#2dd4bf]">Easy</span>
                  <span className="font-mono text-[13px] font-bold text-ink">{lc.easy?.solved ?? 67}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/5 px-3 py-2">
                  <span className="font-mono text-[11.5px] font-semibold text-[#b45309] dark:text-[#f59e0b]">Med.</span>
                  <span className="font-mono text-[13px] font-bold text-ink">{lc.medium?.solved ?? 48}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/5 px-3 py-2">
                  <span className="font-mono text-[11.5px] font-semibold text-[#b91c1c] dark:text-[#ef4444]">Hard</span>
                  <span className="font-mono text-[13px] font-bold text-ink">{lc.hard?.solved ?? 7}</span>
                </div>
              </div>

              {/* Submissions & Acceptance Metric Boxes */}
              <div className="mt-3.5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-surface-2/60 p-3">
                  <span className="font-mono text-[9.5px] tracking-[0.14em] text-muted uppercase">
                    Submissions
                  </span>
                  <p className="mt-1 font-sans text-xl font-bold tracking-tight text-[#7e22ce] dark:text-[#c084fc]">
                    199
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface-2/60 p-3">
                  <span className="font-mono text-[9.5px] tracking-[0.14em] text-muted uppercase">
                    Acceptance
                  </span>
                  <p className="mt-1 font-sans text-xl font-bold tracking-tight text-[#15803d] dark:text-[#22c55e]">
                    77.9%
                  </p>
                </div>
              </div>

              {/* Concept Circles Cluster (LeetCode Topics) */}
              <div className="mt-4 overflow-hidden rounded-xl border border-line/60 bg-surface-2 dark:bg-[#0c1015] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[9.5px] tracking-[0.16em] text-muted uppercase">
                    DSA Topics & Concepts
                  </span>
                  <span className="font-mono text-[9px] text-[#15803d] dark:text-[#22c55e]">
                    ● Active mastery
                  </span>
                </div>
                <svg
                  viewBox="0 0 440 215"
                  className="w-full h-auto max-h-[175px]"
                  style={{ filter: "drop-shadow(0 2px 8px var(--bubble-shadow))" }}
                >
                  {LEETCODE_CONCEPTS.map((c, idx) => {
                    const dur = 3 + (idx % 5) * 0.7;
                    const dx = (idx % 2 === 0 ? 1 : -1) * (2 + (idx % 3));
                    const dy = (idx % 2 === 0 ? -1 : 1) * (1.5 + (idx % 4) * 0.5);
                    return (
                      <g
                        key={c.label + idx}
                        className="transition-transform duration-300 hover:scale-110 cursor-pointer"
                        style={{ transformOrigin: `${c.cx}px ${c.cy}px` }}
                      >
                        <animateTransform
                          attributeName="transform"
                          type="translate"
                          values={`0,0; ${dx},${dy}; 0,0; ${-dx},${-dy}; 0,0`}
                          dur={`${dur}s`}
                          repeatCount="indefinite"
                        />
                        <title>{c.label.replace("\n", " ")}</title>
                        <circle
                          cx={c.cx}
                          cy={c.cy}
                          r={c.r}
                          className="fill-surface dark:fill-[#161b22] stroke-line"
                          strokeWidth="1"
                        />
                        <path
                          d={`M ${c.cx - c.r * 0.65} ${c.cy + c.r * 0.65} Q ${c.cx} ${c.cy + c.r - 0.5} ${c.cx + c.r * 0.65} ${c.cy + c.r * 0.65}`}
                          stroke="var(--c-accent)"
                          strokeWidth={c.r > 23 ? 2.5 : 2}
                          strokeLinecap="round"
                          fill="none"
                        />
                        {c.label.includes("\n") ? (
                          <>
                            <text
                              x={c.cx}
                              y={c.cy - 1.5}
                              textAnchor="middle"
                              fontSize={c.r > 24 ? "7.5" : "6.5"}
                              className="fill-[var(--c-muted)]"
                              fontFamily="var(--font-mono)"
                              fontWeight="500"
                            >
                              {c.label.split("\n")[0]}
                            </text>
                            <text
                              x={c.cx}
                              y={c.cy + 7}
                              textAnchor="middle"
                              fontSize={c.r > 24 ? "7" : "6"}
                              className="fill-[var(--c-muted)]"
                              fontFamily="var(--font-mono)"
                              fontWeight="500"
                            >
                              {c.label.split("\n")[1]}
                            </text>
                          </>
                        ) : (
                          <text
                            x={c.cx}
                            y={c.cy + 2.5}
                            textAnchor="middle"
                            fontSize={c.r > 24 ? "7.5" : c.r > 19 ? "7" : "6"}
                            className="fill-[var(--c-muted)]"
                            fontFamily="var(--font-mono)"
                            fontWeight="500"
                          >
                            {c.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Bottom baseline row */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <div className="font-mono text-[11px] text-muted">
                Global Ranking{" "}
                <span className="font-semibold text-ink">
                  {lc.ranking ? `#${lc.ranking.toLocaleString("en-US")}` : "#1,445,006"}
                </span>
              </div>
              <a
                href={lc.profileUrl}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="open"
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3.5 py-1.5 font-mono text-[11px] font-medium text-ink transition-all duration-300 hover:border-[#FFA116] hover:text-[#9a5b00] dark:hover:text-[#FFA116]"
              >
                Solve alongside me
                <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>

          {/* --------------------------------- Repository Languages Card */}
          <div className="panel min-w-0 rounded-2xl border border-line bg-surface p-5 md:p-6 lg:col-span-5 flex flex-col h-full">
            <div className="flex flex-1 flex-col">
              <p className="mb-1.5 font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                Repository Languages
              </p>
              <p className="mb-5 font-mono text-[10px] text-faint">
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
                        <span className="font-medium text-ink">{l.name}</span>
                        <span className="text-muted">{pct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-line">
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
                  <p className="font-mono text-[12px] text-muted">
                    Language data unavailable.
                  </p>
                )}
              </div>

              {/* LeetCode Badges — fills remaining space */}
              <div className="mt-6 flex flex-1 flex-col border-t border-line pt-5">
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
                  LeetCode Badges
                </p>
                <div className="mt-3 grid flex-1 grid-cols-2 content-center items-center gap-3">
                  {LEETCODE_BADGES.map((b, idx) => (
                    <div key={b.days} className="flex items-center justify-center">
                      <img
                        src={`/badges/${b.days}-days.png`}
                        alt={`LeetCode ${b.days} Days Badge ${b.year}`}
                        width={312}
                        height={312}
                        loading="lazy"
                        decoding="async"
                        className="size-32 drop-shadow-[0_10px_22px_rgba(0,0,0,0.45)] sm:size-40"
                        style={{
                          animation: "badge-flip 2.4s linear infinite",
                          animationDelay: idx % 2 ? "-1.2s" : "0s",
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
