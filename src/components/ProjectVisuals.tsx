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

const INK = "#FFFFFF";
const MUTED = "#94A3B8";
const FAINT = "#64748B";
const CARD = "#12161D";
const LINE = "rgba(255,255,255,.08)";

/** Shared backdrop: deep obsidian/slate canvas + hairline grid + subtle emerald bloom. */
function Backdrop({ c }: { c: string }) {
  return (
    <>
      <rect width="400" height="240" fill="#090C0F" />
      <g opacity="0.35">
        {Array.from({ length: 17 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 25}
            y1="0"
            x2={i * 25}
            y2="240"
            stroke="rgba(255,255,255,.04)"
          />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 25}
            x2="400"
            y2={i * 25}
            stroke="rgba(255,255,255,.04)"
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
      <text x="54" y="118" textAnchor="middle" fontSize="8.5" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
        Client
      </text>
      <text x="54" y="131" textAnchor="middle" fontSize="6.5" fill={MUTED} fontFamily="var(--font-mono)">
        browser
      </text>

      <rect x="132" y="98" width="76" height="44" rx="9" fill={CARD} stroke={c} strokeWidth="1.2" />
      <text x="170" y="117" textAnchor="middle" fontSize="8.5" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
        Gateway
      </text>
      <text x="170" y="131" textAnchor="middle" fontSize="6.5" fill={MUTED} fontFamily="var(--font-mono)">
        jwt · route
      </text>

      {services.map((s) => (
        <g key={s.label}>
          <rect x="250" y={s.y} width="96" height="32" rx="8" fill={CARD} stroke={LINE} />
          <circle cx="262" cy={s.y + 16} r="3" fill={c} />
          <text x="272" y={s.y + 20} fontSize="8" fill={INK} fontFamily="var(--font-mono)">
            {s.label}
          </text>
        </g>
      ))}

      <path d="M298 186 V198" stroke={c} strokeWidth="1.2" fill="none" opacity="0.7" />
      <rect x="22" y="198" width="148" height="28" rx="8" fill={CARD} stroke={c} opacity="0.95" />
      <text x="96" y="216" textAnchor="middle" fontSize="8" fill={c} fontFamily="var(--font-mono)">
        kafka
      </text>
      <path d="M170 212 H210" stroke={c} strokeWidth="1.2" fill="none" className="dash-flow" />
      <rect x="210" y="198" width="166" height="28" rx="8" fill={CARD} stroke={LINE} />
      <text x="293" y="216" textAnchor="middle" fontSize="8" fill={INK} fontFamily="var(--font-mono)">
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
          <text x={s.x + 42} y="74" textAnchor="middle" fontSize="8.5" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
            {s.label}
          </text>
          <text x={s.x + 42} y="90" textAnchor="middle" fontSize="6.5" fill={MUTED} fontFamily="var(--font-mono)">
            {s.sub}
          </text>
        </g>
      ))}

      <path d="M352 108 V128" stroke={c} strokeWidth="1.3" fill="none" className="dash-flow" />

      <rect x="22" y="136" width="170" height="72" rx="10" fill={CARD} stroke={c} strokeWidth="1.2" />
      <text x="107" y="162" textAnchor="middle" fontSize="9" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
        AWS Deployment
      </text>
      <text x="107" y="180" textAnchor="middle" fontSize="7" fill={MUTED} fontFamily="var(--font-mono)">
        user-owned account
      </text>
      <text x="107" y="194" textAnchor="middle" fontSize="7" fill={c} fontFamily="var(--font-mono)">
        Docker · CI/CD
      </text>

      <path d="M192 172 H218" stroke={c} strokeWidth="1.3" fill="none" className="dash-flow" />

      <rect x="218" y="136" width="160" height="72" rx="10" fill={CARD} stroke={LINE} />
      <text x="298" y="162" textAnchor="middle" fontSize="9" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
        Monitor / Cost
      </text>
      <text x="298" y="180" textAnchor="middle" fontSize="7" fill={MUTED} fontFamily="var(--font-mono)">
        recommendations
      </text>
      <text x="298" y="194" textAnchor="middle" fontSize="7" fill={c} fontFamily="var(--font-mono)">
        CloudWatch
      </text>
    </g>
  );
}

/** 03 — Source → stream → grouping L1 → grouping L2 → result. */
function Stream({ c }: { c: string }) {
  const stages = [
    { x: 18, w: 70, label: "Source", sub: "collection" },
    { x: 104, w: 70, label: "Stream", sub: ".stream()" },
    { x: 190, w: 86, label: "Group L1", sub: "groupingBy" },
    { x: 292, w: 90, label: "Group L2", sub: "downstream" },
  ];

  return (
    <g>
      {stages.map((s, i) => (
        <g key={s.label}>
          {i < stages.length - 1 && (
            <path
              d={`M${s.x + s.w} 78 H${stages[i + 1].x}`}
              stroke={c}
              strokeWidth="1.3"
              fill="none"
              className="dash-flow"
            />
          )}
          <rect x={s.x} y="52" width={s.w} height="52" rx="9" fill={CARD} stroke={i === 1 ? c : LINE} strokeWidth={i === 1 ? 1.2 : 1} />
          <text x={s.x + s.w / 2} y="74" textAnchor="middle" fontSize="8.5" fill={INK} fontWeight="600" fontFamily="var(--font-sans)">
            {s.label}
          </text>
          <text x={s.x + s.w / 2} y="90" textAnchor="middle" fontSize="6.5" fill={MUTED} fontFamily="var(--font-mono)">
            {s.sub}
          </text>
        </g>
      ))}

      <path d="M337 104 V128" stroke={c} strokeWidth="1.3" fill="none" />

      <rect x="18" y="136" width="364" height="76" rx="10" fill={CARD} stroke={LINE} />
      <text x="200" y="158" textAnchor="middle" fontSize="8" fill={FAINT} fontFamily="var(--font-mono)" letterSpacing="1.2">
        result collection
      </text>
      {[
        { x: 40, label: "dept · role" },
        { x: 148, label: "region · team" },
        { x: 256, label: "immutable map" },
      ].map((leaf) => (
        <g key={leaf.label}>
          <rect x={leaf.x} y="170" width="96" height="26" rx="7" fill="rgba(255,255,255,.03)" stroke={c} strokeOpacity="0.35" />
          <text x={leaf.x + 48} y="187" textAnchor="middle" fontSize="7.5" fill={c} fontFamily="var(--font-mono)">
            {leaf.label}
          </text>
        </g>
      ))}
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
      <line x1="148" y1="24" x2="148" y2="216" stroke="rgba(255,255,255,.08)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="148" cy="120" r="28" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />
      <circle cx="148" cy="120" r="2" fill={c} opacity="0.8" />

      {/* Penalty boxes */}
      <rect x="24" y="68" width="42" height="104" rx="3" fill="none" stroke="rgba(255,255,255,.07)" />
      <rect x="24" y="88" width="16" height="64" rx="2" fill="none" stroke="rgba(255,255,255,.05)" />
      <circle cx="50" cy="120" r="1.5" fill="rgba(255,255,255,.2)" />

      <rect x="230" y="68" width="42" height="104" rx="3" fill="none" stroke="rgba(255,255,255,.07)" />
      <rect x="256" y="88" width="16" height="64" rx="2" fill="none" stroke="rgba(255,255,255,.05)" />
      <circle cx="248" cy="120" r="1.5" fill="rgba(255,255,255,.2)" />

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
            fontSize="6.5"
            fill={INK}
            fontFamily="var(--font-mono)"
            fontWeight="600"
          >
            {p.role}
          </text>
        </g>
      ))}

      {/* Pitch Top HUD Pill */}
      <rect x="34" y="32" width="94" height="16" rx="8" fill="rgba(0,0,0,.65)" stroke="rgba(255,255,255,.1)" />
      <circle cx="43" cy="40" r="2.5" fill={c} />
      <text x="50" y="43" fontSize="6.5" fill={INK} fontFamily="var(--font-mono)" letterSpacing="0.8">
        4-3-3 LINEUP
      </text>

      {/* Right Telemetry / Grouping Panel */}
      <rect x="282" y="24" width="94" height="192" rx="10" fill={CARD} stroke={LINE} />
      <text x="294" y="44" fontSize="7" fill={FAINT} fontFamily="var(--font-mono)" letterSpacing="1.2">
        SQUAD GROUPING
      </text>
      <line x1="294" y1="50" x2="366" y2="50" stroke="rgba(255,255,255,.07)" />

      {/* Grouping Rows */}
      {groups.map((g, idx) => (
        <g key={g.label} transform={`translate(294, ${60 + idx * 28})`}>
          <circle cx="3" cy="3" r="2.5" fill={c} />
          <text x="10" y="5.5" fontSize="7.5" fill={INK} fontWeight="600" fontFamily="var(--font-mono)">
            {g.label}
          </text>
          <text x="72" y="5.5" fontSize="7" fill={c} textAnchor="end" fontFamily="var(--font-mono)">
            [{g.count}]
          </text>
          <text x="10" y="15" fontSize="6" fill={MUTED} fontFamily="var(--font-mono)">
            {g.names}
          </text>
        </g>
      ))}

      {/* Bottom Status / Match Type */}
      <rect x="290" y="174" width="78" height="30" rx="6" fill={`${c}1A`} stroke={c} strokeOpacity="0.35" />
      <text x="329" y="186" textAnchor="middle" fontSize="6.5" fill={FAINT} fontFamily="var(--font-mono)">
        SQUAD GROUP
      </text>
      <text x="329" y="197" textAnchor="middle" fontSize="7.5" fill={c} fontWeight="600" fontFamily="var(--font-mono)">
        11 players
      </text>
    </g>
  );
}

/** 04 — Edge Case Generator: request mutations + case matrix. */
function EdgeCase({ c }: { c: string }) {
  const requests = [
    { body: "qty: -1", code: "400", ok: false },
    { body: "qty: null", code: "400", ok: false },
    { body: "qty: 1e999", code: "400", ok: false },
    { body: "id: ../../etc/passwd", code: "403", ok: false },
    { body: "qty: 2147483648", code: "400", ok: false },
  ];

  const defects = new Set([7, 16, 23]);
  const cells = Array.from({ length: 30 }, (_, i) => i);

  return (
    <g>
      {/* request / response panel */}
      <rect x="24" y="24" width="176" height="192" rx="11" fill={CARD} stroke={LINE} />
      <text x="38" y="45" fontSize="7.5" fill={FAINT} fontFamily="var(--font-mono)" letterSpacing="1.2">
        POST /api/orders
      </text>
      <path d="M38 53 H186" stroke="rgba(255,255,255,.08)" />
      {requests.map((r, i) => (
        <g key={r.body}>
          <text x="38" y={72 + i * 26} fontSize="7.5" fill={MUTED} fontFamily="var(--font-mono)">
            {r.body}
          </text>
          <rect
            x="152"
            y={62 + i * 26}
            width="34"
            height="14"
            rx="7"
            fill="rgba(239,68,68,.12)"
            stroke="rgba(239,68,68,.4)"
          />
          <text x="169" y={72 + i * 26} textAnchor="middle" fontSize="7" fill="#F87171" fontFamily="var(--font-mono)">
            {r.code}
          </text>
        </g>
      ))}
      <text x="38" y="206" fontSize="7" fill={c} fontFamily="var(--font-mono)">
        ✓ contract held — no 5xx
      </text>

      {/* case matrix */}
      <rect x="212" y="24" width="164" height="192" rx="11" fill={CARD} stroke={LINE} />
      <text x="226" y="45" fontSize="7.5" fill={FAINT} fontFamily="var(--font-mono)" letterSpacing="1.2">
        EDGE CASE MATRIX
      </text>
      {cells.map((i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const defect = defects.has(i);
        return (
          <rect
            key={i}
            x={226 + col * 23}
            y={58 + row * 23}
            width="18"
            height="18"
            rx="5"
            fill={defect ? "#EF4444" : c}
            opacity={defect ? 0.9 : 0.16 + ((i * 7) % 5) * 0.14}
          >
            <animate
              attributeName="opacity"
              values={`${defect ? 0.9 : 0.2};${defect ? 0.9 : 0.75};${defect ? 0.9 : 0.2}`}
              dur={`${2.6 + (i % 5) * 0.4}s`}
              repeatCount="indefinite"
            />
          </rect>
        );
      })}
      <path d="M226 186 H362" stroke="rgba(255,255,255,.08)" />
      <text x="226" y="204" fontSize="7.5" fill={INK} fontFamily="var(--font-mono)">
        47 generated
      </text>
      <text x="362" y="204" textAnchor="end" fontSize="7.5" fill="#F87171" fontFamily="var(--font-mono)">
        6 defects
      </text>
    </g>
  );
}

export default function ProjectVisual({
  variant,
  accent,
}: {
  variant: Project["visual"];
  accent: Project["accent"];
}) {
  const c = ACCENT[accent] ?? "#10B981";

  return (
    <div className="relative flex h-full w-full min-h-[220px] items-center justify-center bg-transparent p-1 sm:p-2">
      {/* Full diagram visible — meet + object-contain, no crop/mask/clip */}
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid meet"
        className="h-auto w-full max-h-[min(52vh,560px)] object-contain"
        style={{ overflow: "visible" }}
        aria-hidden
      >
        <Backdrop c={c} />

        {variant === "exchange" && <Exchange c={c} />}
        {variant === "cloudwise" && <CloudWise c={c} />}
        {variant === "stream" && <Stream c={c} />}
        {variant === "edgecase" && <EdgeCase c={c} />}
        {variant === "formation" && <Formation c={c} />}
      </svg>
    </div>
  );
}
