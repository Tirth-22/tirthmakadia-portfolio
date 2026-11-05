import { useRef, type PointerEvent, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees. */
  max?: number;
  /** Holographic pointer lighting. */
  holo?: boolean;
  /** Adds the pointer-tracking hairline border. */
  border?: boolean;
};

/**
 * 3D perspective tilt with holographic lighting — used by project
 * and metric cards.
 */
export default function TiltCard({
  children,
  className = "",
  max = 7,
  holo = true,
  border = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const rx = useSpring(0, { stiffness: 170, damping: 18, mass: 0.6 });
  const ry = useSpring(0, { stiffness: 170, damping: 18, mass: 0.6 });
  const lx = useMotionValue(50);
  const ly = useMotionValue(0);

  const light = useMotionTemplate`radial-gradient(560px circle at ${lx}% ${ly}%, var(--glow-line), transparent 62%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    rx.set((0.5 - py) * max);
    ry.set((px - 0.5) * max);
    lx.set(px * 100);
    ly.set(py * 100);
    if (border) {
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    }
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    lx.set(50);
    ly.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative ${border ? "holo-border" : ""} ${className}`}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
    >
      {holo && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: light }}
        />
      )}
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}
