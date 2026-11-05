import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";

type Mode = "default" | "view" | "open" | "explore" | "copy" | "link" | "close";

const LABELS: Partial<Record<Mode, string>> = {
  view: "view",
  open: "open",
  explore: "explore",
  copy: "copy",
  link: "go",
  close: "close",
};

/** Frame trailing factor — 0.20 per frame ≈ crisp, responsive follow. */
const FRAME_LERP = 0.20;

/**
 * Precision Reticle Framer Cursor:
 * Replaces the conventional circle cursor with a bespoke tactical reticle
 * featuring 4 corner brackets, an ultra-precise diamond crosshair, and
 * reactive state framing.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<Mode>("default");
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  // Center Reticle: raw pointer position, applied instantly with zero latency
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  // Outer Bracket Frame: lerped trailing position for buttery smooth momentum
  const frameX = useMotionValue(-200);
  const frameY = useMotionValue(-200);

  const target = useRef({ x: -200, y: -200 });
  const frame = useRef({ x: -200, y: -200 });

  const active = mode !== "default";
  const frameSize = active ? 68 : 28;

  /* ------------------------------------------------ enable / disable */
  useEffect(() => {
    const mqFine = window.matchMedia("(pointer: fine)");
    const mqWide = window.matchMedia("(min-width: 1024px)");
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => {
      const on = mqFine.matches && mqWide.matches && !mqReduce.matches;
      setEnabled(on);
      document.documentElement.classList.toggle("tm-cursor", on);
    };

    sync();
    mqFine.addEventListener("change", sync);
    mqWide.addEventListener("change", sync);
    mqReduce.addEventListener("change", sync);
    return () => {
      mqFine.removeEventListener("change", sync);
      mqWide.removeEventListener("change", sync);
      mqReduce.removeEventListener("change", sync);
      document.documentElement.classList.remove("tm-cursor");
    };
  }, []);

  /* ------------------------------------------------ pointer listeners */
  useEffect(() => {
    if (!enabled) return;

    const move = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);

      const el = e.target as HTMLElement | null;
      const holder = el?.closest?.("[data-cursor]") as HTMLElement | null;
      const next = (holder?.dataset.cursor as Mode) ?? "default";
      setMode((prev) => (prev === next ? prev : next));
    };

    const over = () => setVisible(true);
    const leave = () => setVisible(false);
    const dwn = () => setDown(true);
    const up = () => setDown(false);

    window.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", over);
    window.addEventListener("mousedown", dwn);
    window.addEventListener("mouseup", up);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", over);
      window.removeEventListener("mousedown", dwn);
      window.removeEventListener("mouseup", up);
    };
  }, [enabled, x, y]);

  /* ------------------------------------------------ rAF follow loop */
  useEffect(() => {
    if (!enabled) return;
    let frameId = 0;

    const loop = () => {
      const f = frame.current;
      const t = target.current;
      f.x += (t.x - f.x) * FRAME_LERP;
      f.y += (t.y - f.y) * FRAME_LERP;
      if (Math.abs(t.x - f.x) < 0.1) f.x = t.x;
      if (Math.abs(t.y - f.y) < 0.1) f.y = t.y;
      frameX.set(f.x);
      frameY.set(f.y);
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [enabled, frameX, frameY]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] hidden lg:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .2s ease" }}
    >
      {/* ----------------- Corner Brackets Frame (No circles!) ----------------- */}
      <motion.div
        className="absolute top-0 left-0 flex items-center justify-center"
        style={{
          x: frameX,
          y: frameY,
          translateX: "-50%",
          translateY: "-50%",
          width: frameSize,
          height: frameSize,
        }}
        animate={{
          scale: down ? 0.85 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 32, mass: 0.5 }}
      >
        {/* Top-Left Bracket */}
        <span
          className="absolute top-0 left-0 h-2 w-2 border-t-2 border-l-2 transition-colors duration-200"
          style={{
            borderColor: active
              ? "var(--c-accent)"
              : "color-mix(in srgb, var(--c-accent) 55%, transparent)",
            boxShadow: active ? "0 0 8px var(--c-accent)" : "none",
          }}
        />
        {/* Top-Right Bracket */}
        <span
          className="absolute top-0 right-0 h-2 w-2 border-t-2 border-r-2 transition-colors duration-200"
          style={{
            borderColor: active
              ? "var(--c-accent)"
              : "color-mix(in srgb, var(--c-accent) 55%, transparent)",
            boxShadow: active ? "0 0 8px var(--c-accent)" : "none",
          }}
        />
        {/* Bottom-Left Bracket */}
        <span
          className="absolute bottom-0 left-0 h-2 w-2 border-b-2 border-l-2 transition-colors duration-200"
          style={{
            borderColor: active
              ? "var(--c-accent)"
              : "color-mix(in srgb, var(--c-accent) 55%, transparent)",
            boxShadow: active ? "0 0 8px var(--c-accent)" : "none",
          }}
        />
        {/* Bottom-Right Bracket */}
        <span
          className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 transition-colors duration-200"
          style={{
            borderColor: active
              ? "var(--c-accent)"
              : "color-mix(in srgb, var(--c-accent) 55%, transparent)",
            boxShadow: active ? "0 0 8px var(--c-accent)" : "none",
          }}
        />

        {/* Hover label inside brackets */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.span
              key={mode}
              initial={{ opacity: 0, scale: 0.75, filter: "blur(3px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.75, filter: "blur(3px)" }}
              transition={{ duration: 0.16 }}
              className="font-mono text-[9px] font-semibold tracking-[0.2em] uppercase"
              style={{
                color: "var(--c-accent)",
                textShadow: "0 0 10px var(--c-accent)",
              }}
            >
              {LABELS[mode]}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ----------------- Center Precision Diamond Reticle ----------------- */}
      <motion.div
        className="absolute top-0 left-0"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: active ? 0.6 : down ? 0.75 : 1,
          rotate: active ? 90 : 45,
        }}
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
      >
        {/* Diamond Reticle */}
        <div
          className="h-2 w-2 transition-colors duration-200"
          style={{
            backgroundColor: "var(--c-accent)",
            boxShadow: "0 0 10px var(--c-accent)",
            transform: "rotate(45deg)",
          }}
        />
      </motion.div>
    </div>
  );
}
