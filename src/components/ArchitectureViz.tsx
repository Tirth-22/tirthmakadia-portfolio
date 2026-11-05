import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUp } from "lucide-react";
import {
  ARCH_NODES,
  CANVAS,
  CICD_NODES,
  EDGES,
  TRACE_STEPS,
  type FlowKind,
} from "../data/architecture";

/** Flows the demo alternates between, forever. */
const FLOWS: FlowKind[] = ["request", "deploy"];
const STEP_MS = 700; // gap between trace steps
const HOLD_MS = 2600; // how long a finished trace stays lit
const GAP_MS = 700; // dark pause between two traces
const WAIT_MS = 350; // scheduler tick while paused / off-screen
const START_MS = 600; // delay before the first trace

export default function ArchitectureViz() {
  const [activeNodeIds, setActiveNodeIds] = useState<string[]>([]);
  const [activeFlow, setActiveFlow] = useState<FlowKind | null>(null);
  const [particlePos, setParticlePos] = useState<{ x: number; y: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const pathsMapRef = useRef<Map<string, SVGPathElement>>(new Map());
  const pausedRef = useRef(false);
  const visibleRef = useRef(false);

  /* ------------------------------------------------------ autoplay
   * Runs request → deploy → request … with no user input, mirroring the
   * Projects carousel: pauses on hover, when scrolled out of view and when
   * the tab is hidden; honours prefers-reduced-motion (stays static). */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let timer = 0;
    let frame = 0;
    let flowIdx = 0;

    const clearPacket = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      setParticlePos(null);
    };

    const clearTrace = () => {
      window.clearTimeout(timer);
      clearPacket();
      setActiveFlow(null);
      setActiveNodeIds([]);
    };

    const next = () => {
      if (cancelled) return;
      if (pausedRef.current || !visibleRef.current || document.hidden) {
        timer = window.setTimeout(next, WAIT_MS);
        return;
      }
      runFlow(FLOWS[flowIdx++ % FLOWS.length]);
    };

    const runFlow = (flow: FlowKind) => {
      setActiveFlow(flow);
      const sequence = TRACE_STEPS[flow];
      let i = 0;

      const step = () => {
        if (cancelled) return;

        // scrolled away / tab hidden — wipe the trace, idle until visible
        if (!visibleRef.current || document.hidden) {
          clearTrace();
          timer = window.setTimeout(next, WAIT_MS);
          return;
        }
        // hovered — freeze on the current step
        if (pausedRef.current) {
          timer = window.setTimeout(step, WAIT_MS);
          return;
        }
        // trace finished — hold, then hand back to the scheduler
        if (i >= sequence.length) {
          timer = window.setTimeout(() => {
            if (cancelled) return;
            clearTrace();
            timer = window.setTimeout(next, GAP_MS);
          }, HOLD_MS);
          return;
        }

        const item = sequence[i++];
        setActiveNodeIds(item.nodeIds);

        // travelling packet along this step's primary edge
        clearPacket();
        const pathEl = item.edgeIds?.[0]
          ? pathsMapRef.current.get(item.edgeIds[0])
          : null;
        if (pathEl) {
          const length = pathEl.getTotalLength();
          const duration = 460;
          const start = performance.now();

          const animatePacket = (now: number) => {
            if (cancelled) return;
            const progress = Math.min((now - start) / duration, 1);
            const pt = pathEl.getPointAtLength(progress * length);
            setParticlePos({ x: pt.x, y: pt.y });

            if (progress < 1) {
              frame = requestAnimationFrame(animatePacket);
            } else {
              frame = 0;
              setParticlePos(null);
            }
          };
          frame = requestAnimationFrame(animatePacket);
        }

        timer = window.setTimeout(step, STEP_MS);
      };

      step();
    };

    /* only animate while the card is actually on screen */
    const root = rootRef.current;
    let io: IntersectionObserver | null = null;
    if (root && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          visibleRef.current = entries.some((e) => e.isIntersecting);
        },
        { threshold: 0, rootMargin: "0px 0px -15% 0px" },
      );
      io.observe(root);
    } else {
      visibleRef.current = true;
    }

    timer = window.setTimeout(next, START_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
      io?.disconnect();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      className="relative w-full rounded-2xl border border-line bg-[#090C0F]/95 p-5 shadow-2xl backdrop-blur-xl sm:p-7 md:rounded-3xl md:p-8"
    >
      {/* ---------------- Header Bar ---------------- */}
      <div className="mb-6 flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
              System Topology // Architecture &amp; Delivery
            </span>
          </div>

          <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            From Code to <span className="text-gradient">Cloud</span>.
          </h3>

          <p className="mt-1 text-[14px] leading-relaxed text-slate-300 sm:text-[15px]">
            A simple look at how I build backend systems and deploy them to AWS.
          </p>
        </div>

        {/* Live indicator — traces run on a loop, no controls needed */}
        <span className="inline-flex w-fit shrink-0 items-center gap-2 self-start rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.16em] text-emerald-300 uppercase">
          <span className="status-dot scale-75" />
          {activeFlow === "deploy"
            ? "deploying"
            : activeFlow === "request"
              ? "tracing"
              : "live demo"}
        </span>
      </div>

      {/* ---------------- Desktop Unified SVG Canvas ---------------- */}
      <div className="hidden md:block relative w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#07090C] p-4 shadow-inner">
        <svg
          viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
          className="h-auto w-full max-h-[420px]"
          preserveAspectRatio="xMidYMid meet"
          aria-label="System Topology Architecture Diagram"
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="topo-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.035)" />
            </pattern>

            {/* Directional Arrow Markers */}
            <marker
              id="arrow-emerald"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10B981" />
            </marker>

            <marker
              id="arrow-blue"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38BDF8" />
            </marker>

            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06B6D4" />
            </marker>

            <marker
              id="arrow-orange"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F59E0B" />
            </marker>

            {/* Glowing Filters */}
            <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#10B981" floodOpacity="0.45" />
            </filter>
            <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38BDF8" floodOpacity="0.5" />
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#06B6D4" floodOpacity="0.45" />
            </filter>
            <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#F59E0B" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Canvas Background */}
          <rect width={CANVAS.w} height={CANVAS.h} fill="url(#topo-grid)" />

          {/* Atmospheric Cluster Bloom (Image 2 aesthetic) */}
          <ellipse cx="485" cy="95" rx="260" ry="85" fill="rgba(36,150,237,0.05)" />

          {/* ---------------- Connecting Edges (always flowing) ---------------- */}
          {EDGES.map((edge, i) => {
            const isRequestFlow = activeFlow === "request" && edge.flow === "request";
            const isDeployFlow = activeFlow === "deploy" && edge.flow === "deploy";
            const isHighlighted = isRequestFlow || isDeployFlow;

            let markerUrl = "url(#arrow-emerald)";
            if (edge.color === "#38BDF8") markerUrl = "url(#arrow-blue)";
            if (edge.color === "#06B6D4") markerUrl = "url(#arrow-cyan)";
            if (edge.color === "#F59E0B") markerUrl = "url(#arrow-orange)";

            const dur = `${3.2 + (i % 4) * 0.5}s`;
            const begin = `${i * 0.3}s`;

            return (
              <g key={edge.id}>
                <path
                  ref={(el) => {
                    if (el) pathsMapRef.current.set(edge.id, el);
                    else pathsMapRef.current.delete(edge.id);
                  }}
                  d={edge.d}
                  fill="none"
                  stroke={isHighlighted ? edge.color : "rgba(255,255,255,0.18)"}
                  strokeWidth={isHighlighted ? 2.2 : 1.4}
                  markerEnd={markerUrl}
                  className="dash-flow transition-all duration-300"
                />

                {/* packet drifting along the line — same trick as the Exchange visual */}
                <circle r="2.8" fill={edge.color} opacity="0">
                  <animateMotion dur={dur} begin={begin} repeatCount="indefinite" path={edge.d} />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur={dur}
                    begin={begin}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          {/* ---------------- Main Architecture Nodes ---------------- */}
          {ARCH_NODES.map((node) => {
            const isActive = activeNodeIds.includes(node.id);

            // Client Node
            if (node.kind === "client") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="12"
                    fill="#11151D"
                    stroke={isActive ? "#38BDF8" : "rgba(255,255,255,0.12)"}
                    strokeWidth={isActive ? 2 : 1}
                    filter={isActive ? "url(#glow-blue)" : undefined}
                    className="transition-all duration-200"
                  />
                  <text
                    x={node.w / 2}
                    y="28"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="13"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                  >
                    {node.title}
                  </text>
                  <text
                    x={node.w / 2}
                    y="46"
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                  >
                    {node.sub}
                  </text>
                </g>
              );
            }

            // Gateway Node (Image 2 style with glowing border)
            if (node.kind === "gateway") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="14"
                    fill="#0F141E"
                    stroke={isActive ? "#38BDF8" : "#2496ED"}
                    strokeWidth={isActive ? 2.4 : 1.8}
                    filter="url(#glow-blue)"
                    className="transition-all duration-200"
                  />
                  <text
                    x={node.w / 2}
                    y="34"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="14"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                  >
                    {node.title}
                  </text>
                  <text
                    x={node.w / 2}
                    y="54"
                    textAnchor="middle"
                    fill="#7DD3FC"
                    fontSize="10"
                    fontFamily="var(--font-mono)"
                  >
                    {node.sub}
                  </text>
                </g>
              );
            }

            // Kafka broker — compact layer between services and storage
            if (node.kind === "kafka") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="10"
                    fill="#0E1613"
                    stroke={isActive ? "#10B981" : "rgba(16,185,129,0.45)"}
                    strokeWidth={isActive ? 2 : 1.2}
                    filter={isActive ? "url(#glow-emerald)" : undefined}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx="16"
                    cy={node.h / 2}
                    r="3.5"
                    fill="#10B981"
                    className={isActive ? "animate-pulse" : ""}
                  />
                  <text
                    x="28"
                    y="21"
                    fill="#FFFFFF"
                    fontSize="11.5"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                  >
                    {node.title}
                  </text>
                  <text x="28" y="34" fill="#94A3B8" fontSize="8" fontFamily="var(--font-mono)">
                    {node.sub}
                  </text>
                </g>
              );
            }

            // Microservice Pills (Image 2 style with blue/green dot + monospace label)
            if (node.kind === "service") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="10"
                    fill="#11151D"
                    stroke={isActive ? "#10B981" : "rgba(255,255,255,0.14)"}
                    strokeWidth={isActive ? 2 : 1}
                    filter={isActive ? "url(#glow-emerald)" : undefined}
                    className="transition-all duration-200"
                  />
                  <circle
                    cx="18"
                    cy={node.h / 2}
                    r="3.5"
                    fill={isActive ? "#10B981" : "#38BDF8"}
                    className={isActive ? "animate-pulse" : ""}
                  />
                  <text
                    x="32"
                    y={node.h / 2 + 4}
                    fill="#F1F5F9"
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fontWeight="600"
                  >
                    {node.title}
                  </text>
                </g>
              );
            }

            // Data Layer
            if (node.kind === "data") {
              return (
                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                  <rect
                    width={node.w}
                    height={node.h}
                    rx="12"
                    fill="#11151D"
                    stroke={isActive ? "#38BDF8" : "rgba(56,189,248,0.4)"}
                    strokeWidth={isActive ? 2 : 1.2}
                    filter={isActive ? "url(#glow-blue)" : undefined}
                    className="transition-all duration-200"
                  />
                  <text
                    x={node.w / 2}
                    y="32"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="13"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                  >
                    {node.title}
                  </text>
                  <text
                    x={node.w / 2}
                    y="50"
                    textAnchor="middle"
                    fill="#38BDF8"
                    fontSize="10"
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
                    fill="#121620"
                    stroke={isActive ? "#F59E0B" : "rgba(245,158,11,0.4)"}
                    strokeWidth={isActive ? 2 : 1.2}
                    filter={isActive ? "url(#glow-orange)" : undefined}
                    className="transition-all duration-200"
                  />
                  <circle cx="20" cy="20" r="3" fill="#F59E0B" />
                  <text
                    x="30"
                    y="23"
                    fill="#F59E0B"
                    fontSize="8.5"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                    className="uppercase"
                  >
                    AWS CLOUD
                  </text>
                  <text
                    x="16"
                    y="45"
                    fill="#FFFFFF"
                    fontSize="13"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                  >
                    {node.title}
                  </text>
                  <text
                    x="16"
                    y="63"
                    fill="#FDE68A"
                    fontSize="9.5"
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
          {CICD_NODES.map((node) => {
            const isActive = activeNodeIds.includes(node.id);

            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <rect
                  width={node.w}
                  height={node.h}
                  rx="8"
                  fill="#0F141C"
                  stroke={isActive ? node.accent : "rgba(255,255,255,0.12)"}
                  strokeWidth={isActive ? 2 : 1}
                  filter={isActive ? (node.id === "deploy-aws" ? "url(#glow-orange)" : "url(#glow-cyan)") : undefined}
                  className="transition-all duration-200"
                />
                <circle cx="16" cy="18" r="2.5" fill={node.accent} />
                <text
                  x="24"
                  y="21"
                  fill={node.accent}
                  fontSize="7.5"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                  className="uppercase"
                >
                  {node.title}
                </text>
                <text
                  x="14"
                  y="38"
                  fill="#94A3B8"
                  fontSize="8"
                  fontFamily="var(--font-mono)"
                >
                  {node.sub}
                </text>
              </g>
            );
          })}

          {/* ---------------- Animated Travelling Packet ---------------- */}
          {particlePos && (
            <g transform={`translate(${particlePos.x}, ${particlePos.y})`}>
              <circle
                r="6"
                fill={activeFlow === "request" ? "#38BDF8" : "#06B6D4"}
                opacity="0.3"
                className="animate-ping"
              />
              <circle
                r="3.5"
                fill={activeFlow === "request" ? "#38BDF8" : "#22D3EE"}
                filter="url(#glow-blue)"
              />
            </g>
          )}
        </svg>
      </div>

      {/* ---------------- Mobile Responsive Flow (< 768px) ---------------- */}
      <div className="md:hidden flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          {ARCH_NODES.map((node, i) => (
            <div key={node.id} className="flex flex-col items-center">
              <div
                className={`w-full rounded-xl border p-3.5 transition-all ${
                  activeNodeIds.includes(node.id)
                    ? "border-emerald-500 bg-[#161f28] shadow-[0_0_16px_rgba(16,185,129,0.25)]"
                    : "border-white/10 bg-[#11151D]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[14px] font-bold text-white">{node.title}</h4>
                  <span className="font-mono text-[10.5px] text-slate-400">{node.sub}</span>
                </div>
              </div>
              {i < ARCH_NODES.length - 1 && (
                <div className="my-1 flex items-center justify-center text-emerald-400/60">
                  <ArrowRight className="size-3.5 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile CI/CD Strip */}
        <div className="border-t border-white/[0.08] pt-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CICD_NODES.map((node) => (
              <div
                key={node.id}
                className={`rounded-lg border p-2.5 ${
                  activeNodeIds.includes(node.id)
                    ? "border-cyan-500 bg-[#11222d]"
                    : "border-white/10 bg-[#0F141C]"
                }`}
              >
                <p className="text-[12px] font-semibold text-white">{node.title}</p>
                <p className="mt-0.5 font-mono text-[9px] text-slate-400">{node.sub}</p>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-300">
            <ArrowUp className="size-3 shrink-0" />
            <span className="font-mono text-[10.5px]">Automated deployment to AWS EC2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
