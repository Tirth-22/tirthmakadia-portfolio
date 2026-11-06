import type { CSSProperties } from "react";
import type { Project } from "../data/projects";

const ACCENT: Record<string, string> = {
  emerald: "#10B981",
  lime: "#10B981",
  green: "#059669",
  chartreuse: "#34D399",
  orange: "#F59E0B",
  olive: "#10B981",
  amber: "#F59E0B",
  cyan: "#06B6D4",
  blue: "#3B82F6",
  violet: "#A855F7",
};

const INK = "var(--c-ink)";
const MUTED = "var(--c-muted)";
const FAINT = "var(--c-faint)";
const CARD = "var(--c-node)";
const LINE = "var(--c-line)";
const LINE_SOFT = "color-mix(in srgb, var(--c-ink) 7%, transparent)";

/**
 * Accent-coloured SVG text. The project accent is tuned for the dark canvas —
 * on the light canvas it is mixed toward ink so it stays legible.
 */
const accentText = (c: string) =>
  ({
    className: "accent-fill",
    style: { "--accent-text": c } as CSSProperties,
  }) as const;

/** Shared backdrop: deep obsidian/slate canvas + hairline grid + subtle emerald bloom. */
function Backdrop({ c }: { c: string }) {
  return (
    <>
      <rect width="400" height="240" fill="var(--c-stage)" />
      <g opacity="0.55">
        {Array.from({ length: 17 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 25}
            y1="0"
            x2={i * 25}
            y2="240"
            stroke={LINE_SOFT}
          />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 25}
            x2="400"
            y2={i * 25}
            stroke={LINE_SOFT}
          />
        ))}
      </g>
      {/* Restrained 8% atmospheric bloom */}
      <ellipse cx="200" cy="34" rx="210" ry="96" fill={c} opacity="0.08" />
    </>
  );
}

/** 01 — Client → Gateway → domain services → Kafka → notifications. */
function Exchange({ c }: { c: string }) {
  const services = [
    { y: 28, label: "auth-svc" },
    { y: 70, label: "user-svc" },
    { y: 112, label: "request-svc" },
    { y: 154, label: "provider-svc" },
  ];
  const flows = [
    "M86 120 H132",
    "M208 120 C228 120 228 45 250 45",
    "M208 120 C228 120 228 87 250 87",
    "M208 120 C228 120 228 129 250 129",
    "M208 120 C228 120 228 171 250 171",
  ];

  return (
    <g>
      {flows.map((d, i) => (
        <g key={d}>
          <path d={d} className="dash-flow" fill="none" stroke={c} strokeWidth="1.4" opacity={0.75} />
          <circle r="3" fill={c}>
            <animateMotion dur={`${2.2 + i * 0.25}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" path={d} />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur={`${2.2 + i * 0.25}s`}
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}

      <rect x="22" y="100" width="64" height="40" rx="9" fill={CARD} stroke={LINE} />
      <text x="54" y="118" textAnchor="middle" fontSize="10.5" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
        Client
      </text>
      <text x="54" y="131" textAnchor="middle" fontSize="8" fill={MUTED} fontFamily="var(--font-mono)">
        browser
      </text>

      <rect x="132" y="98" width="76" height="44" rx="9" fill={CARD} stroke={c} strokeWidth="1.2" />
      <text x="170" y="117" textAnchor="middle" fontSize="10.5" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
        Gateway
      </text>
      <text x="170" y="131" textAnchor="middle" fontSize="8" fill={MUTED} fontFamily="var(--font-mono)">
        jwt · route
      </text>

      {services.map((s) => (
        <g key={s.label}>
          <rect x="250" y={s.y} width="96" height="32" rx="8" fill={CARD} stroke={LINE} />
          <circle cx="262" cy={s.y + 16} r="3" fill={c} />
          <text x="272" y={s.y + 20} fontSize="10" fill={INK} fontFamily="var(--font-mono)">
            {s.label}
          </text>
        </g>
      ))}

      <path d="M298 186 V198" stroke={c} strokeWidth="1.2" fill="none" opacity="0.7" />
      <rect x="22" y="198" width="148" height="28" rx="8" fill={CARD} stroke={c} opacity="0.95" />
      <text x="96" y="216" textAnchor="middle" fontSize="10" {...accentText(c)} fontFamily="var(--font-mono)">
        kafka
      </text>
      <path d="M170 212 H210" stroke={c} strokeWidth="1.2" fill="none" className="dash-flow" />
      <rect x="210" y="198" width="166" height="28" rx="8" fill={CARD} stroke={LINE} />
      <text x="293" y="216" textAnchor="middle" fontSize="10" fill={INK} fontFamily="var(--font-mono)">
        notification-svc
      </text>
    </g>
  );
}

/** 02 — GitHub analysis → IAM-validated AWS deploy → monitor / cost. */
function CloudWise({ c }: { c: string }) {
  const stages = [
    { x: 22, label: "GitHub", sub: "repository" },
    { x: 118, label: "Analyze", sub: "config scan" },
    { x: 214, label: "Estimate", sub: "resources" },
    { x: 310, label: "IAM Role", sub: "no access keys" },
  ];

  return (
    <g>
      {stages.map((s, i) => (
        <g key={s.label}>
          {i < stages.length - 1 && (
            <g>
              <path
                d={`M${s.x + 84} 78 H${s.x + 96}`}
                stroke={c}
                strokeWidth="1.3"
                fill="none"
                className="dash-flow"
              />
              <circle r="2.5" fill={c}>
                <animateMotion dur="1.8s" begin={`${i * 0.35}s`} repeatCount="indefinite" path={`M${s.x + 84} 78 H${s.x + 96}`} />
              </circle>
            </g>
          )}
          <rect x={s.x} y="48" width="84" height="60" rx="10" fill={CARD} stroke={i === 0 ? c : LINE} strokeWidth={i === 0 ? 1.2 : 1} />
          <text x={s.x + 42} y="74" textAnchor="middle" fontSize="10.5" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
            {s.label}
          </text>
          <text x={s.x + 42} y="90" textAnchor="middle" fontSize="8" fill={MUTED} fontFamily="var(--font-mono)">
            {s.sub}
          </text>
        </g>
      ))}

      <path d="M352 108 V128" stroke={c} strokeWidth="1.3" fill="none" className="dash-flow" />

      <rect x="22" y="136" width="170" height="72" rx="10" fill={CARD} stroke={c} strokeWidth="1.2" />
      <text x="107" y="162" textAnchor="middle" fontSize="11" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
        AWS Deployment
      </text>
      <text x="107" y="180" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="var(--font-mono)">
        user-owned account
      </text>
      <text x="107" y="194" textAnchor="middle" fontSize="9" {...accentText(c)} fontFamily="var(--font-mono)">
        Docker · CI/CD
      </text>

      <path d="M192 172 H218" stroke={c} strokeWidth="1.3" fill="none" className="dash-flow" />

      <rect x="218" y="136" width="160" height="72" rx="10" fill={CARD} stroke={LINE} />
      <text x="298" y="162" textAnchor="middle" fontSize="11" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
        Monitor / Cost
      </text>
      <text x="298" y="180" textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="var(--font-mono)">
        recommendations
      </text>
      <text x="298" y="194" textAnchor="middle" fontSize="9" {...accentText(c)} fontFamily="var(--font-mono)">
        CloudWatch
      </text>
    </g>
  );
}

/** Department leaves for the Stream grouping pipeline — shared with the demo controls. */
export const STREAM_DEPARTMENTS = [
  { label: "ENG", x: 60, fillWidth: 42, trackWidth: 54, val: "74" },
  { label: "OPS", x: 140, fillWidth: 20, trackWidth: 54, val: "32" },
  { label: "SALES", x: 220, fillWidth: 50, trackWidth: 54, val: "88" },
  { label: "HR", x: 300, fillWidth: 16, trackWidth: 54, val: "26" },
];

/** 03 — StreamAPI Grouping Utility: .stream() → groupingBy(dept) & collectingAndThen() → leaves with animated metrics. */
function Stream({
  c,
  interactive = false,
  selected = null,
  onSelect,
}: {
  c: string;
  interactive?: boolean;
  selected?: string | null;
  onSelect?: (label: string | null) => void;
}) {
  const categories = STREAM_DEPARTMENTS;
  const inspected = categories.find((d) => d.label === selected) ?? null;
  const isDim = (label: string) => interactive && !!selected && selected !== label;
  const isSel = (label: string) => interactive && selected === label;

  return (
    <g>
      {/* Cyan / emerald elliptical bloom behind .stream() */}
      <ellipse
        cx="200"
        cy="92"
        rx="176"
        ry="62"
        fill={c}
        opacity="0.14"
      />

      {/* Top Root: .stream() */}
      <g>
        <rect
          x="152"
          y="50"
          width="96"
          height="32"
          rx="9"
          fill={CARD}
          stroke={c}
          strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 10px ${c}55)` }}
        />
        <text
          x="200"
          y="70"
          textAnchor="middle"
          fontSize="12"
          {...accentText(c)}
          fontWeight="600"
          fontFamily="var(--font-mono)"
          letterSpacing="0.5"
        >
          ..stream()
        </text>
      </g>

      {/* Connection from .stream() to downstream collectors */}
      <path
        d="M200 82 V97 M120 97 H280 M120 97 V108 M280 97 V108"
        stroke={c}
        strokeWidth="1.2"
        strokeOpacity="0.7"
        fill="none"
        strokeDasharray="3 3"
      />

      {/* Moving particle down to collectors */}
      <circle r="2.5" fill={c}>
        <animateMotion
          dur="2s"
          repeatCount="indefinite"
          path="M200 82 V97 M120 97 V108"
        />
      </circle>
      <circle r="2.5" fill={c}>
        <animateMotion
          dur="2s"
          begin="0.5s"
          repeatCount="indefinite"
          path="M200 82 V97 M280 97 V108"
        />
      </circle>

      {/* Mid Layer: groupingBy(dept) & collectingAndThen() */}
      <g>
        <rect
          x="60"
          y="108"
          width="120"
          height="30"
          rx="8"
          fill={CARD}
          stroke={LINE}
          strokeWidth="1"
        />
        <text
          x="120"
          y="127"
          textAnchor="middle"
          fontSize="10.5"
          fill={INK}
          fontWeight="500"
          fontFamily="var(--font-mono)"
        >
          groupingBy(dept)
        </text>
      </g>

      <g>
        <rect
          x="218"
          y="108"
          width="132"
          height="30"
          rx="8"
          fill={CARD}
          stroke={LINE}
          strokeWidth="1"
        />
        <text
          x="284"
          y="127"
          textAnchor="middle"
          fontSize="10.5"
          fill={INK}
          fontWeight="500"
          fontFamily="var(--font-mono)"
        >
          collectingAndThen()
        </text>
      </g>

      {/* Connecting rail from mid layer down to category leaves */}
      <path
        d="M60 148 H340 M87 138 V158 M167 138 V158 M247 138 V158 M327 138 V158"
        stroke={LINE}
        strokeWidth="1"
        fill="none"
      />

      {/* 4 Category Leaves + Progress / Volume Bars */}
      {categories.map((cat, idx) => {
        const cx = cat.x + 27;
        const selectedHere = isSel(cat.label);
        const dimmed = isDim(cat.label);
        return (
          <g
            key={cat.label}
            data-cursor={interactive ? "link" : undefined}
            style={{
              cursor: interactive ? "pointer" : undefined,
              opacity: dimmed ? 0.28 : 1,
              transition: "opacity 300ms ease",
            }}
            onClick={
              interactive && onSelect
                ? () => onSelect(selected === cat.label ? null : cat.label)
                : undefined
            }
          >
            {/* Pulsing inspection ring on the selected department */}
            {selectedHere && (
              <rect
                x={cat.x - 4}
                y="154"
                width="62"
                height="46"
                rx="10"
                fill="none"
                stroke={c}
                strokeWidth="1"
                strokeDasharray="3 3"
              >
                <animate
                  attributeName="opacity"
                  values="0.3;1;0.3"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              </rect>
            )}

            {/* Category Card */}
            <rect
              x={cat.x}
              y="158"
              width="54"
              height="24"
              rx="7"
              fill={CARD}
              stroke={selectedHere ? c : LINE}
              strokeWidth={selectedHere ? 1.5 : 1}
              style={selectedHere ? { filter: `drop-shadow(0 0 8px ${c}66)` } : undefined}
            />
            <text
              x={cx}
              y="173"
              textAnchor="middle"
              fontSize="10"
              fill={INK}
              fontWeight="600"
              fontFamily="var(--font-mono)"
            >
              {cat.label}
            </text>

            {/* Background Track */}
            <rect
              x={cat.x}
              y="190"
              width={cat.trackWidth}
              height="7"
              rx="3.5"
              fill="var(--c-line)"
            />

            {/* Glowing Metric Bar */}
            <rect
              x={cat.x}
              y="190"
              width={cat.fillWidth}
              height="7"
              rx="3.5"
              fill={c}
              fillOpacity={selectedHere ? 1 : 0.85}
              style={{ filter: `drop-shadow(0 0 4px ${c}88)` }}
            >
              <animate
                attributeName="opacity"
                values="0.75;1;0.75"
                dur={`${2 + idx * 0.4}s`}
                repeatCount="indefinite"
              />
            </rect>

            {/* Metric Value */}
            <text
              x={cat.x + cat.trackWidth + 6}
              y="196"
              fontSize="9"
              fill={selectedHere ? c : MUTED}
              fontWeight={selectedHere ? 600 : 400}
              fontFamily="var(--font-mono)"
            >
              {cat.val}
            </text>
          </g>
        );
      })}

      {/* Live demo readout — hint at rest, grouped result while inspecting */}
      {interactive && (
        <text
          x="200"
          y="224"
          textAnchor="middle"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="1"
          fill={inspected ? undefined : FAINT}
          className={inspected ? "accent-fill" : undefined}
          style={inspected ? ({ "--accent-text": c } as CSSProperties) : undefined}
        >
          {inspected
            ? `groupingBy(dept).get("${inspected.label}") → ${inspected.val} records`
            : "SELECT A DEPARTMENT TO INSPECT ITS GROUP"}
        </text>
      )}
    </g>
  );
}

/** 04 — Football Formation & Tactical Squad Grouping visual */
function Formation({ c }: { c: string }) {
  const players = [
    { x: 42, y: 120, role: "GK", num: "1" },
    { x: 86, y: 52, role: "LB", num: "3" },
    { x: 78, y: 96, role: "CB", num: "4" },
    { x: 78, y: 144, role: "CB", num: "5" },
    { x: 86, y: 188, role: "RB", num: "2" },
    { x: 140, y: 72, role: "LCM", num: "8" },
    { x: 124, y: 120, role: "CDM", num: "6" },
    { x: 140, y: 168, role: "RCM", num: "10" },
    { x: 204, y: 56, role: "LW", num: "11" },
    { x: 228, y: 120, role: "ST", num: "9" },
    { x: 204, y: 184, role: "RW", num: "7" },
  ];

  const passFlows = [
    "M42 120 L78 96 L124 120 L140 72 L204 56 L228 120",
    "M124 120 L140 168 L204 184 L228 120",
  ];

  const groups = [
    { label: "FWD", count: 3, names: "ST · LW · RW" },
    { label: "MID", count: 3, names: "CDM · LCM · RCM" },
    { label: "DEF", count: 4, names: "CB · CB · LB · RB" },
    { label: "GK", count: 1, names: "position group" },
  ];

  return (
    <g>
      {/* Pitch Boundary */}
      <rect
        x="24"
        y="24"
        width="248"
        height="192"
        rx="10"
        fill="rgba(16,185,129,.04)"
        stroke={LINE}
        strokeWidth="1.2"
      />

      {/* Halfway line & center circle */}
      <line x1="148" y1="24" x2="148" y2="216" stroke={LINE} strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="148" cy="120" r="28" fill="none" stroke={LINE} strokeWidth="1" />
      <circle cx="148" cy="120" r="2" fill={c} opacity="0.8" />

      {/* Penalty boxes */}
      <rect x="24" y="68" width="42" height="104" rx="3" fill="none" stroke={LINE} />
      <rect x="24" y="88" width="16" height="64" rx="2" fill="none" stroke={LINE_SOFT} />
      <circle cx="50" cy="120" r="1.5" fill="var(--c-faint)" />

      <rect x="230" y="68" width="42" height="104" rx="3" fill="none" stroke={LINE} />
      <rect x="256" y="88" width="16" height="64" rx="2" fill="none" stroke={LINE_SOFT} />
      <circle cx="248" cy="120" r="1.5" fill="var(--c-faint)" />

      {/* Tactical Pass Flow Vectors */}
      {passFlows.map((d, i) => (
        <g key={d}>
          <path
            d={d}
            fill="none"
            stroke={c}
            strokeWidth="1.2"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <circle r="3" fill={c}>
            <animateMotion
              dur={`${3.2 + i * 0.8}s`}
              begin={`${i * 0.9}s`}
              repeatCount="indefinite"
              path={d}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0"
              dur={`${3.2 + i * 0.8}s`}
              begin={`${i * 0.9}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}

      {/* Player Formation Nodes */}
      {players.map((p) => (
        <g key={p.role + p.num}>
          {/* Node glow halo */}
          <circle cx={p.x} cy={p.y} r="8" fill={CARD} stroke={c} strokeWidth="1.2" />
          <circle cx={p.x} cy={p.y} r="3" fill={c} opacity="0.9">
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur="2.4s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Role text */}
          <text
            x={p.x}
            y={p.y + 14}
            textAnchor="middle"
            fontSize="8"
            fill={INK}
            fontFamily="var(--font-mono)"
            fontWeight="600"
          >
            {p.role}
          </text>
        </g>
      ))}

      {/* Pitch Top HUD Pill */}
      <rect x="34" y="32" width="94" height="16" rx="8" fill="var(--c-surface-2)" stroke={LINE} />
      <circle cx="43" cy="40" r="2.5" fill={c} />
      <text x="50" y="43" fontSize="8" fill={INK} fontFamily="var(--font-mono)" letterSpacing="0.8">
        4-3-3 LINEUP
      </text>

      {/* Right Telemetry / Grouping Panel */}
      <rect x="282" y="24" width="94" height="192" rx="10" fill={CARD} stroke={LINE} />
      <text x="294" y="44" fontSize="9" fill={FAINT} fontFamily="var(--font-mono)" letterSpacing="1.2">
        SQUAD GROUPING
      </text>
      <line x1="294" y1="50" x2="366" y2="50" stroke={LINE} />

      {/* Grouping Rows */}
      {groups.map((g, idx) => (
        <g key={g.label} transform={`translate(294, ${60 + idx * 28})`}>
          <circle cx="3" cy="3" r="2.5" fill={c} />
          <text x="10" y="5.5" fontSize="9.5" fill={INK} fontWeight="600" fontFamily="var(--font-mono)">
            {g.label}
          </text>
          <text x="72" y="5.5" fontSize="9" {...accentText(c)} textAnchor="end" fontFamily="var(--font-mono)">
            [{g.count}]
          </text>
          <text x="10" y="15" fontSize="7.5" fill={MUTED} fontFamily="var(--font-mono)">
            {g.names}
          </text>
        </g>
      ))}

      {/* Bottom Status / Match Type */}
      <rect x="290" y="174" width="78" height="30" rx="6" fill={`${c}1A`} stroke={c} strokeOpacity="0.35" />
      <text x="329" y="186" textAnchor="middle" fontSize="8" fill={FAINT} fontFamily="var(--font-mono)">
        SQUAD GROUP
      </text>
      <text x="329" y="197" textAnchor="middle" fontSize="9.5" {...accentText(c)} fontWeight="600" fontFamily="var(--font-mono)">
        11 players
      </text>
    </g>
  );
}

export default function ProjectVisual({
  variant,
  accent,
  interactive = false,
  selected = null,
  onSelect,
}: {
  variant: Project["visual"];
  accent: Project["accent"];
  interactive?: boolean;
  selected?: string | null;
  onSelect?: (label: string | null) => void;
}) {
  const c = ACCENT[accent] ?? "#10B981";

  return (
    <div className="relative flex h-full w-full min-h-[220px] items-center justify-start overflow-x-auto bg-transparent p-1 sm:p-2 [-webkit-overflow-scrolling:touch]">
      {/* Full diagram visible — meet + object-contain, no crop/mask/clip.
          min-w keeps the labels at a readable size on phones; the wrapper
          lets the visitor pan the rest instead of shrinking it to ~5px. */}
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full min-w-[460px] max-h-[min(52svh,560px)] object-contain"
        aria-hidden
      >
        <Backdrop c={c} />

        {variant === "exchange" && <Exchange c={c} />}
        {variant === "cloudwise" && <CloudWise c={c} />}
        {variant === "stream" && (
          <Stream c={c} interactive={interactive} selected={selected} onSelect={onSelect} />
        )}
        {variant === "formation" && <Formation c={c} />}
      </svg>
    </div>
  );
}
