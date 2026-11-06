import type { CSSProperties } from "react";
import {
  ARCH_NODES,
  CANVAS,
  CICD_NODES,
  CONTINUOUS_EDGES,
} from "../data/architecture";

export default function ArchitectureViz() {
  return (
    <div className="relative w-full rounded-2xl border border-line bg-surface/92 p-5 shadow-2xl backdrop-blur-xl sm:p-7 md:rounded-3xl md:p-8">
      {/* ---------------- Header Bar ---------------- */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-ping dark:bg-emerald-400" />
            <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-emerald-600 uppercase dark:text-emerald-400">
              Continuous End-to-End Live Pipeline
            </span>
          </div>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            From Code to <span className="text-gradient">Cloud</span>.
          </h3>
        </div>

        {/* Live Indicator Pill */}
        <div className="flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 shadow-[0_0_16px_rgba(16,185,129,0.2)]">
          <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse dark:bg-emerald-400" />
          <span className="font-mono text-[11px] font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
            Active Traffic Stream
          </span>
        </div>
      </div>

      {/* ---------------- Desktop Unified SVG Canvas ---------------- */}
      <div className="hidden lg:block relative w-full overflow-hidden rounded-xl border border-line bg-stage p-4 shadow-inner">
        <svg
          viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
          className="h-auto w-full max-h-[440px]"
          preserveAspectRatio="xMidYMid meet"
          aria-label="System Topology Architecture Diagram"
        >
          <defs>
            {/* Background Grid */}
            <pattern id="topo-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="var(--c-line)" />
            </pattern>

            {/* Glowing Filters */}
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#10B981" floodOpacity="0.5" />
            </filter>
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#38BDF8" floodOpacity="0.5" />
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#06B6D4" floodOpacity="0.5" />
            </filter>
            <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#F59E0B" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width={CANVAS.w} height={CANVAS.h} fill="url(#topo-grid)" />

          {/* Atmospheric Cluster Glow */}
          <ellipse cx="495" cy="95" rx="270" ry="90" fill="rgba(36,150,237,0.06)" />

          {/* ---------------- Continuous Moving Connecting Edges ---------------- */}
          {CONTINUOUS_EDGES.map((edge) => (
            <g key={edge.id}>
              {/* Moving Dashed Line (Continuous flow like in Project 1) */}
              <path
                d={edge.d}
                fill="none"
                stroke={edge.color}
                strokeWidth="1.5"
                className="dash-flow"
                opacity={0.8}
              />

              {/* Continuous Gliding Data Packet */}
              <circle r="3.2" fill={edge.color}>
                <animateMotion
                  dur={edge.dur}
                  begin={edge.delay}
                  repeatCount="indefinite"
                  path={edge.d}
                />
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur={edge.dur}
                  begin={edge.delay}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}

          {/* ---------------- Main Architecture Nodes ---------------- */}
          {ARCH_NODES.map((node) => {
            // Client Node
            if (node.kind === "client") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="12"
                    fill="var(--c-node)"
                    stroke="color-mix(in srgb, var(--c-ink) 14%, transparent)"
                    strokeWidth={1}
                    className="transition-all duration-200 hover:border-white/30"
                  />
                  <text
                    x={node.w / 2}
                    y="27"
                    textAnchor="middle"
                    fill="var(--c-ink)"
                    fontSize="13"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                  >
                    {node.title}
                  </text>
                  <text
                    x={node.w / 2}
                    y="44"
                    textAnchor="middle"
                    fill="var(--c-muted)"
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
                  >
                    {node.sub}
                  </text>
                </g>
              );
            }

            // Gateway Node (Prominent blue border glow)
            if (node.kind === "gateway") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="14"
                    fill="var(--c-node-2)"
                    stroke="#2496ED"
                    strokeWidth={1.8}
                    filter="url(#glow-blue)"
                    className="transition-all duration-200"
                  />
                  <text
                    x={node.w / 2}
                    y="33"
                    textAnchor="middle"
                    fill="var(--c-ink)"
                    fontSize="14"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                  >
                    {node.title}
                  </text>
                  <text
                    x={node.w / 2}
                    y="52"
                    textAnchor="middle"
                    className="fill-[#0369a1] dark:fill-[#7DD3FC]"
                    fontSize="9.5"
                    fontFamily="var(--font-mono)"
                  >
                    {node.sub}
                  </text>
                </g>
              );
            }

            // Stacked Microservices (auth, user, request)
            if (node.kind === "service") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="9"
                    fill="var(--c-node)"
                    stroke="color-mix(in srgb, var(--c-ink) 15%, transparent)"
                    strokeWidth={1}
                    className="transition-all duration-200 hover:border-emerald-500/50"
                  />
                  <circle
                    cx="16"
                    cy={node.h / 2}
                    r="3.5"
                    fill="#10B981"
                    className="animate-pulse"
                  />
                  <text
                    x="28"
                    y={node.h / 2 + 4}
                    fill="var(--c-ink)"
                    fontSize="10.5"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                  >
                    {node.title}
                  </text>
                </g>
              );
            }

            // Small Separate Kafka Layer
            if (node.kind === "kafka") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="10"
                    fill="var(--c-node-2)"
                    stroke="#06B6D4"
                    strokeWidth={1.4}
                    filter="url(#glow-cyan)"
                    className="transition-all duration-200"
                  />
                  <circle cx="18" cy="18" r="3" fill="#06B6D4" className="animate-ping" />
                  <circle cx="18" cy="18" r="2.5" fill="#06B6D4" />
                  <text
                    x="27"
                    y="22"
                    className="fill-[#0e7490] dark:fill-[#22D3EE]"
                    fontSize="10.5"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    Kafka
                  </text>
                  <text
                    x={node.w / 2}
                    y="40"
                    textAnchor="middle"
                    fill="var(--c-muted)"
                    fontSize="8.5"
                    fontFamily="var(--font-mono)"
                  >
                    event stream
                  </text>
                </g>
              );
            }

            // Database / PostgreSQL Node
            if (node.kind === "data") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="12"
                    fill="var(--c-node)"
                    stroke="rgba(59,130,246,0.45)"
                    strokeWidth={1.2}
                    filter="url(#glow-blue)"
                    className="transition-all duration-200"
                  />
                  <text
                    x={node.w / 2}
                    y="30"
                    textAnchor="middle"
                    fill="var(--c-ink)"
                    fontSize="12.5"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                  >
                    {node.title}
                  </text>
                  <text
                    x={node.w / 2}
                    y="48"
                    textAnchor="middle"
                    className="fill-[#1d4ed8] dark:fill-[#60A5FA]"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                  >
                    {node.sub}
                  </text>
                </g>
              );
            }

            // AWS Cloud Node
            if (node.kind === "aws") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="12"
                    fill="var(--c-node)"
                    stroke="rgba(245,158,11,0.5)"
                    strokeWidth={1.4}
                    filter="url(#glow-orange)"
                    className="transition-all duration-200"
                  />
                  <circle cx="18" cy="20" r="3" fill="#F59E0B" />
                  <text
                    x="28"
                    y="23"
                    className="fill-[#b45309] uppercase dark:fill-[#F59E0B]"
                    fontSize="8"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    AWS CLOUD
                  </text>
                  <text
                    x="14"
                    y="46"
                    fill="var(--c-ink)"
                    fontSize="13"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                  >
                    {node.title}
                  </text>
                  <text
                    x="14"
                    y="64"
                    className="fill-[#92400e] dark:fill-[#FDE68A]"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                  >
                    {node.sub}
                  </text>
                </g>
              );
            }

            return null;
          })}

          {/* ---------------- CI/CD Secondary Strip (Row 2) ---------------- */}
          {CICD_NODES.map((node) => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <rect
                width={node.w}
                height={node.h}
                rx="8"
                fill="var(--c-node)"
                stroke="color-mix(in srgb, var(--c-ink) 14%, transparent)"
                strokeWidth={1}
                className="transition-all duration-200"
              />
              <circle cx="16" cy="18" r="2.5" fill={node.accent} className="accent-fill" style={{ "--accent-text": node.accent } as CSSProperties} />
              <text
                x="24"
                y="21"
                className="accent-fill uppercase"
                style={{ "--accent-text": node.accent } as CSSProperties}
                fontSize="7.5"
                fontFamily="var(--font-mono)"
                fontWeight="600"
              >
                {node.title}
              </text>
              <text
                x="14"
                y="38"
                fill="var(--c-muted)"
                fontSize="8"
                fontFamily="var(--font-mono)"
              >
                {node.sub}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* ---------------- Mobile Responsive Flow (< 768px) ---------------- */}
      <div className="lg:hidden flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          {ARCH_NODES.map((node) => (
            <div
              key={node.id}
              className="w-full rounded-xl border border-line bg-surface p-3.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-ink">{node.title}</h4>
                <span className="font-mono text-[11px] text-muted">{node.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile CI/CD Strip */}
        <div className="border-t border-line pt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CICD_NODES.map((node) => (
              <div
                key={node.id}
                className="rounded-lg border border-line bg-surface p-2.5"
              >
                <p className="text-[12px] font-semibold text-ink">{node.title}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">{node.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
