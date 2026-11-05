import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import AwsIconField from "./AwsIconField";

/**
 * Atmospheric Ambient Layer:
 * Subdued, organic cloud mist movements drifting like clouds across
 * a deep obsidian/slate canvas, with subtle emerald & acid lime lighting.
 * Layered: canvas → hairline grid → rack rails → floating AWS service
 * icons → soft cloud bloom → vignette. All layers sit behind content.
 */
export default function AmbientBackground() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 24, damping: 26, mass: 0.9 });
  const sy = useSpring(my, { stiffness: 24, damping: 26, mass: 0.9 });

  // Gentle aerodynamic cloud parallax
  const cloud1x = useTransform(sx, (v) => v * 0.035);
  const cloud1y = useTransform(sy, (v) => v * 0.035);
  const cloud2x = useTransform(sx, (v) => v * -0.025);
  const cloud2y = useTransform(sy, (v) => v * -0.02);
  const cloud3x = useTransform(sx, (v) => v * 0.02);
  const cloud3y = useTransform(sy, (v) => v * -0.015);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX - window.innerWidth / 2);
      my.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Architectural square grid */}
      <div className="hairline-grid absolute inset-0 opacity-55" />
      <div className="hairline-grid-fine absolute inset-0 opacity-40" />
      <div className="grid-scan pointer-events-none absolute inset-x-0 top-0" />

      {/* Gentle horizontal server rails */}
      <div className="rack-rails absolute inset-0 opacity-30" />

      {/* Floating AWS service icons — subtle digital galaxy behind everything */}
      <AwsIconField />

      {/* Cloud Formation A — Subtle Emerald Cumulus Drift (reduced) */}
      <motion.div
        style={{ x: cloud1x, y: cloud1y }}
        className="absolute top-[8%] left-[5%] h-[55vw] w-[55vw] max-w-[760px] max-h-[760px]"
      >
        <div
          className="h-full w-full rounded-full blur-[140px] opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 45% 45%, var(--orb-a), color-mix(in srgb, var(--c-accent) 5%, transparent) 42%, transparent 72%)",
            animation: "cloud-drift-1 28s ease-in-out infinite",
          }}
        />
      </motion.div>

      {/* Cloud Formation B — Acid Lime / Chartreuse Atmospheric Mist (reduced) */}
      <motion.div
        style={{ x: cloud2x, y: cloud2y }}
        className="absolute right-[2%] top-[35%] h-[48vw] w-[52vw] max-w-[700px] max-h-[700px]"
      >
        <div
          className="h-full w-full rounded-full blur-[150px] opacity-42"
          style={{
            background:
              "radial-gradient(ellipse at 55% 50%, var(--orb-b), color-mix(in srgb, var(--c-accent-2) 4%, transparent) 45%, transparent 72%)",
            animation: "cloud-drift-2 34s ease-in-out infinite",
          }}
        />
      </motion.div>

      {/* Cloud Formation C — Deep Obsidian / Emerald Atmospheric Billow (reduced) */}
      <motion.div
        style={{ x: cloud3x, y: cloud3y }}
        className="absolute -bottom-[10%] left-[25%] h-[50vw] w-[50vw] max-w-[650px] max-h-[650px]"
      >
        <div
          className="h-full w-full rounded-full blur-[160px] opacity-42"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, var(--orb-c), color-mix(in srgb, #059669 4%, transparent) 48%, transparent 75%)",
            animation: "cloud-drift-3 24s ease-in-out infinite",
          }}
        />
      </motion.div>

      {/* High-altitude soft cloud mist veil */}
      <div
        className="absolute top-[-5%] left-[20%] h-[35vw] w-[60vw] max-w-[800px] rounded-full blur-[170px] opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.05), transparent 70%)",
          animation: "float-y 20s ease-in-out infinite",
        }}
      />

      {/* Sleek Slate Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 10%, transparent 45%, color-mix(in srgb, var(--c-canvas) 88%, transparent) 100%)",
        }}
      />
    </div>
  );
}
