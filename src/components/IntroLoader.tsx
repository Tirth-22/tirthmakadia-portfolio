import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIntro } from "../lib/intro";
import { setScrollLock } from "../lib/scroll";
import { EASE } from "../lib/motion";

/* ------------------------------------------------------------------ */
/* Timing: ~3.0s total, skippable with ESC                            */
/* ------------------------------------------------------------------ */
const PHASE_1_END = 1100; // Clouds parting (0 – 1.1s)
const REVEAL_AT = 2650;   // Curtain wipe begins (2.65s)
const DONE_AT = 3150;     // Fully into homepage (~3.1s)

const BACKEND_NODES = [
  { label: "Auth Service", status: "200 OK", delay: 1.35 },
  { label: "User / Portfolio", status: "Ready", delay: 1.5 },
  { label: "Database / Redis", status: "Cache Hit", delay: 1.65 },
];

const VERIFICATION = [
  { key: "STATUS", val: "200 OK", delay: 1.75 },
  { key: "ROUTE", val: "GET /tirth-makadia", delay: 1.9 },
  { key: "VERIFIED", val: "WELCOME", delay: 2.05 },
];

export default function IntroLoader() {
  const { phase, done, reveal, complete } = useIntro();

  useEffect(() => {
    if (done) return;
    setScrollLock(true);
    document.documentElement.classList.add("tm-intro");
    return () => {
      setScrollLock(false);
      document.documentElement.classList.remove("tm-intro");
    };
  }, [done]);

  useEffect(() => {
    if (done) return;
    const a = window.setTimeout(reveal, REVEAL_AT);
    const b = window.setTimeout(complete, DONE_AT);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [done, reveal, complete]);

  const skip = useCallback(() => {
    reveal();
    window.setTimeout(complete, 260);
  }, [reveal, complete]);

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, skip]);

  if (done) return null;

  return (
    <AnimatePresence>
      <div
        aria-busy="true"
        aria-label="Loading portfolio"
        className="intro-layer fixed inset-0 z-[100] overflow-hidden bg-[#080A0C]"
      >
        {/* Curtains for Phase 3 Curtain Wipe */}
        <motion.div
          initial={{ y: 0 }}
          animate={phase === "reveal" ? { y: "-102%" } : { y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute inset-x-0 top-0 z-10 h-[51%] bg-[#080A0C]"
        />
        <motion.div
          initial={{ y: 0 }}
          animate={phase === "reveal" ? { y: "102%" } : { y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="absolute inset-x-0 bottom-0 z-10 h-[51%] bg-[#080A0C]"
        />

        {/* Main Stage */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={
            phase === "reveal"
              ? { opacity: 0, scale: 1.04, filter: "blur(6px)" }
              : { opacity: 1, scale: 1, filter: "blur(0px)" }
          }
          transition={{ duration: 0.45, ease: EASE }}
          className="absolute inset-0 z-20 flex flex-col bg-[#080A0C]"
        >
          {/* Subtle Grid Backdrop */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "72px 72px",
                maskImage:
                  "radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 90%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 80% at 50% 50%, #000 20%, transparent 90%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 110% 90% at 50% 50%, transparent 35%, rgba(8,10,12,0.95) 100%)",
              }}
            />
          </div>

          {/* Top-Right Skip Button */}
          <button
            type="button"
            onClick={skip}
            data-cursor="link"
            className="absolute top-[calc(1.5rem+env(safe-area-inset-top,0px))] right-[calc(1.5rem+env(safe-area-inset-right,0px))] z-40 min-h-11 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase backdrop-blur-sm transition-all hover:border-white/30 hover:text-white sm:top-8 sm:right-8 sm:text-[12px]"
          >
            Skip <span className="ml-1 text-white/35">[ESC]</span>
          </button>

          {/* -------------------------------------------------------- */}
          {/* Phase 1: Atmospheric Drifting Sky Clouds (0.0s – 1.1s)   */}
          {/* -------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0, pointerEvents: "none" }}
            transition={{ delay: PHASE_1_END / 1000 - 0.1, duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Drifting Cloud Left */}
            <motion.div
              initial={{ x: "-10%", opacity: 0, scale: 0.95 }}
              animate={{ x: "-65%", opacity: [0, 0.8, 0.65, 0], scale: 1.25 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="pointer-events-none absolute top-[-10%] left-[-20%] h-[120vh] w-[90vw]"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 40% 50%, rgba(30,41,59,0.75), rgba(15,23,42,0.5) 45%, transparent 75%)",
                filter: "blur(60px)",
              }}
            />
            {/* Drifting Cloud Right */}
            <motion.div
              initial={{ x: "10%", opacity: 0, scale: 0.95 }}
              animate={{ x: "65%", opacity: [0, 0.8, 0.65, 0], scale: 1.25 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="pointer-events-none absolute top-[-10%] right-[-20%] h-[120vh] w-[90vw]"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 60% 50%, rgba(30,41,59,0.75), rgba(15,23,42,0.5) 45%, transparent 75%)",
                filter: "blur(60px)",
              }}
            />
            {/* Ambient Cyan/Emerald Cloud Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.85, 0.25, 0], scale: [0.8, 1.25, 1.45] }}
              transition={{ duration: 1.15, ease: "easeInOut" }}
              className="pointer-events-none absolute h-[78vmin] w-[78vmin] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.25), rgba(36,150,237,0.15) 40%, transparent 70%)",
                filter: "blur(50px)",
              }}
            />

            {/* Ambient Center Text */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: [0, 1, 1, 0], y: [16, 0, 0, -8] }}
              transition={{ duration: 1.1, times: [0, 0.25, 0.8, 1], ease: EASE }}
              className="relative z-10 flex flex-col items-center gap-3 px-6 text-center"
            >
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-emerald-400 shadow-[0_0_14px_#10B981] animate-ping sm:size-3.5" />
                <span className="font-mono text-[15px] font-semibold tracking-[0.22em] text-white uppercase drop-shadow-md sm:text-[18px] md:text-[20px]">
                  Connecting to cloud workloads...
                </span>
              </div>
              <span className="font-mono text-[11px] tracking-[0.22em] text-slate-400 uppercase sm:text-[12.5px]">
                provisioning edge routes &amp; api gateway
              </span>
            </motion.div>
          </motion.div>

          {/* -------------------------------------------------------- */}
          {/* Phase 2: System Topology & Packet Routing (1.1s – 2.5s)  */}
          {/* -------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: PHASE_1_END / 1000, duration: 0.45, ease: EASE }}
            className="absolute inset-0 z-20 flex items-center justify-center px-4 sm:px-8"
          >
            {/* Desktop Horizontal Layout */}
            <div className="hidden w-full max-w-6xl items-center justify-between gap-5 md:flex lg:gap-8">
              {/* Left Node: Client */}
              <motion.div
                initial={{ opacity: 0, x: -28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.15, duration: 0.4, ease: EASE }}
                className="shrink-0"
              >
                <div className="rounded-2xl border border-white/10 bg-[#11151D] p-5 shadow-2xl shadow-black/40 sm:p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]" />
                    <span className="font-mono text-[12px] tracking-[0.2em] text-slate-400 uppercase">
                      Client
                    </span>
                  </div>
                  <p className="mt-2 font-sans text-[16px] font-semibold tracking-wide text-white sm:text-[17px]">
                    Visitor / Browser
                  </p>
                </div>
              </motion.div>

              {/* Data Packet 1: Client -> Gateway */}
              <div className="relative mx-2 flex-1">
                <motion.div
                  className="h-[2px] w-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.25, duration: 0.45, ease: EASE }}
                  style={{
                    transformOrigin: "left",
                    background:
                      "linear-gradient(to right, rgba(16,185,129,0.35), rgba(52,211,153,0.35))",
                  }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2"
                  initial={{ left: "0%", opacity: 0 }}
                  animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 1.35, duration: 0.55, ease: "easeInOut" }}
                >
                  <div
                    className="size-3.5 rounded-full"
                    style={{
                      background: "#10B981",
                      boxShadow: "0 0 16px #10B981, 0 0 32px #10B98188",
                    }}
                  />
                </motion.div>
              </div>

              {/* Center Node: API Gateway */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.25, duration: 0.4, ease: EASE }}
                className="shrink-0"
              >
                <motion.div
                  className="rounded-2xl border bg-[#11151D] p-5 shadow-2xl shadow-black/40 sm:p-6"
                  initial={{ borderColor: "rgba(255,255,255,0.1)" }}
                  animate={{
                    borderColor: [
                      "rgba(255,255,255,0.1)",
                      "#10B981",
                      "rgba(255,255,255,0.1)",
                    ],
                    boxShadow: [
                      "0 0 0px transparent",
                      "0 0 32px rgba(16,185,129,0.35)",
                      "0 0 0px transparent",
                    ],
                  }}
                  transition={{ delay: 1.7, duration: 0.65, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10B981]" />
                    <span className="font-mono text-[12px] tracking-[0.2em] text-slate-400 uppercase">
                      Gateway
                    </span>
                  </div>
                  <p className="mt-2 font-sans text-[16px] font-semibold tracking-wide text-white sm:text-[17px]">
                    API Gateway
                  </p>
                  <p className="mt-1 font-mono text-[11px] tracking-wider text-slate-400">
                    jwt · rate-limit · route
                  </p>
                </motion.div>
              </motion.div>

              {/* Data Packet 2: Gateway -> Backend */}
              <div className="relative mx-2 flex-1">
                <motion.div
                  className="h-[2px] w-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.6, duration: 0.45, ease: EASE }}
                  style={{
                    transformOrigin: "left",
                    background:
                      "linear-gradient(to right, rgba(52,211,153,0.35), rgba(16,185,129,0.35))",
                  }}
                />
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2"
                  initial={{ left: "0%", opacity: 0 }}
                  animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 1.7, duration: 0.5, ease: "easeInOut" }}
                >
                  <div
                    className="size-3.5 rounded-full"
                    style={{
                      background: "#34D399",
                      boxShadow: "0 0 16px #34D399, 0 0 32px #34D39988",
                    }}
                  />
                </motion.div>
              </div>

              {/* Right Nodes: Backend Cluster */}
              <motion.div
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3, duration: 0.4, ease: EASE }}
                className="flex shrink-0 flex-col gap-3"
              >
                {BACKEND_NODES.map((node) => (
                  <motion.div
                    key={node.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: node.delay, duration: 0.35, ease: EASE }}
                    className="rounded-xl border border-white/10 bg-[#11151D] px-5 py-3 shadow-lg shadow-black/30"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <span className="font-mono text-[13px] font-medium tracking-wide text-slate-200">
                        {node.label}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 font-mono text-[11px] tracking-wider"
                        style={{
                          color: "#10B981",
                          background: "rgba(16,185,129,0.12)",
                          border: "1px solid rgba(16,185,129,0.3)",
                        }}
                      >
                        {node.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Mobile Topology */}
            <div className="flex flex-col items-center gap-3.5 md:hidden">
              {[
                { label: "Client: Visitor", sub: "Web Browser", delay: 1.15 },
                {
                  label: "API Gateway",
                  sub: "jwt · rate-limit · route",
                  delay: 1.35,
                },
                {
                  label: "Backend Cluster",
                  sub: "Auth · Portfolio · Cache Ready",
                  delay: 1.55,
                },
              ].map((node, i) => (
                <motion.div key={node.label} className="w-72 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: node.delay, duration: 0.35, ease: EASE }}
                    className="rounded-2xl border border-white/10 bg-[#11151D] px-5 py-3.5 shadow-lg"
                  >
                    <p className="font-sans text-[15px] font-semibold tracking-wide text-white">
                      {node.label}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">
                      {node.sub}
                    </p>
                  </motion.div>
                  {i < 2 && (
                    <div
                      className="mx-auto my-1.5 h-6 w-px"
                      style={{
                        background: "linear-gradient(to bottom, #10B981, transparent)",
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Verification Readout */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.35, ease: EASE }}
            className="absolute bottom-24 left-1/2 z-20 -translate-x-1/2 sm:bottom-28"
          >
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-[#0c1017]/90 px-7 py-3 shadow-xl backdrop-blur-md">
              {VERIFICATION.map((v) => (
                <motion.div
                  key={v.key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: v.delay, duration: 0.22, ease: EASE }}
                  className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.16em] sm:text-[13px]"
                >
                  <span className="text-slate-400">{v.key}:</span>
                  <span className="font-semibold text-emerald-400">{v.val}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Welcome Banner
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 2.2, duration: 0.3, ease: EASE }}
            className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap sm:bottom-14"
          >
            <div className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-6 py-2 shadow-[0_0_30px_-8px_#10B981]">
              <span className="font-mono text-[11px] font-semibold tracking-[0.18em] text-emerald-400 uppercase sm:text-[13px]">
              
              </span>
            </div>
          </motion.div> */}

          {/* Progress Bar */}
          <div className="absolute bottom-4 left-1/2 z-10 w-64 -translate-x-1/2 sm:bottom-5 sm:w-72">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: REVEAL_AT / 1000, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
