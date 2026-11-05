import { useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";
import type { ContributionDay } from "../lib/metrics";

const CELL = 10;
const GAP = 3;
const PITCH = CELL + GAP;
const LABEL_W = 28;
const TOP = 20;
const HEIGHT = TOP + 7 * PITCH;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const WEEKDAYS = [
  { row: 1, label: "Mon" },
  { row: 3, label: "Wed" },
  { row: 5, label: "Fri" },
];

/* GitHub dark-mode contribution square colors */
const GH_LEVEL_COLORS = [
  "#161b22", // Level 0: empty
  "#0e4429", // Level 1
  "#006d32", // Level 2
  "#26a641", // Level 3
  "#39d353", // Level 4
];

type Cell = { date: string; level: number; count: number; week: number; row: number };

const parseUTC = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

function build(days: ContributionDay[]) {
  if (!days.length) return null;

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const firstT = parseUTC(sorted[0].date);
  const firstDate = new Date(firstT);
  const startT = firstT - firstDate.getUTCDay() * 86400000;

  const cells: Cell[] = sorted.map((d) => {
    const t = parseUTC(d.date);
    const dt = new Date(t);
    return {
      ...d,
      week: Math.round((t - startT) / 604800000),
      row: dt.getUTCDay(),
    };
  });

  const weeks = cells.reduce((n, c) => Math.max(n, c.week), 0) + 1;

  // Month labels — first week of each month, at least 4 weeks apart.
  const labels: { week: number; text: string }[] = [];
  let lastWeek = -99;
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const t = startT + w * 604800000;
    const dt = new Date(t);
    const month = dt.getUTCMonth();
    if (month !== lastMonth && w - lastWeek >= 3) {
      labels.push({ week: w, text: MONTHS[month] });
      lastWeek = w;
      lastMonth = month;
    }
  }

  return { cells, weeks, labels };
}

type Props = { days: ContributionDay[]; total: number };

export default function ContributionCalendar({ days, total }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(svgRef, { once: true, margin: "-60px" });
  const [hover, setHover] = useState<{
    day: Cell;
    x: number;
    y: number;
  } | null>(null);

  const grid = useMemo(() => build(days), [days]);
  if (!grid) {
    return (
      <p className="font-mono text-[12px] text-[#7d8590]">
        Contribution history unavailable.
      </p>
    );
  }

  const width = LABEL_W + grid.weeks * PITCH + 24; // right margin for the last month label

  const onEnter = (day: Cell, e: React.MouseEvent<SVGRectElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    setHover({ day, x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const fmt = (iso: string) =>
    new Date(parseUTC(iso)).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div ref={wrapRef} className="relative">
      <div className="overflow-x-auto pb-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          preserveAspectRatio="xMinYMin meet"
          className={`h-auto w-full min-w-[640px] ${inView ? "is-live" : ""}`}
          role="img"
          aria-label={`${total} contributions in the last year`}
        >
          {grid.labels.map((l) => (
            <text
              key={`m-${l.week}`}
              x={LABEL_W + l.week * PITCH}
              y={12}
              fontSize="9"
              style={{
                fill: "#7d8590",
                fontFamily: "var(--font-mono)",
              }}
            >
              {l.text}
            </text>
          ))}

          {WEEKDAYS.map((w) => (
            <text
              key={w.label}
              x={0}
              y={TOP + w.row * PITCH + CELL - 1.5}
              fontSize="8.5"
              style={{
                fill: "#7d8590",
                fontFamily: "var(--font-mono)",
              }}
            >
              {w.label}
            </text>
          ))}

          {grid.cells.map((c) => {
            const fill = GH_LEVEL_COLORS[c.level] ?? GH_LEVEL_COLORS[0];
            return (
              <rect
                key={c.date}
                className="cell"
                x={LABEL_W + c.week * PITCH}
                y={TOP + c.row * PITCH}
                width={CELL}
                height={CELL}
                rx={2}
                style={{
                  fill,
                  stroke: c.level === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
                  strokeWidth: 0.5,
                  animationDelay: `${c.week * 0.012 + c.row * 0.005}s`,
                }}
                onMouseEnter={(e) => onEnter(c, e)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </svg>
      </div>

      {/* GitHub standard legend */}
      <div className="mt-3 flex items-center justify-between gap-4 border-t border-[#30363d]/60 pt-3">
        <span className="font-mono text-[10px] tracking-[0.14em] text-[#7d8590]">
          {total.toLocaleString("en-US")} contributions in the last year
        </span>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#7d8590]">
          <span>Less</span>
          {GH_LEVEL_COLORS.map((color, i) => (
            <span
              key={i}
              className="size-[10px] rounded-[2px]"
              style={{
                backgroundColor: color,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-md border border-[#30363d] bg-[#161b22] px-3 py-1.5 shadow-xl text-center"
          style={{
            left: Math.min(Math.max(hover.x, 70), (wrapRef.current?.clientWidth ?? 300) - 70),
            top: hover.y,
          }}
        >
          <p className="font-mono text-[11px] font-medium text-white whitespace-nowrap">
            {hover.day.count} contribution{hover.day.count === 1 ? "" : "s"}
          </p>
          <p className="mt-0.5 font-mono text-[9.5px] whitespace-nowrap text-[#7d8590]">
            {fmt(hover.day.date)}
          </p>
        </div>
      )}
    </div>
  );
}
