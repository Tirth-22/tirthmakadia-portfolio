import { useRef, type ReactNode } from "react";
import { motion, useSpring } from "framer-motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** 0–1 — how far the element leans toward the pointer. */
  strength?: number;
};

/** Magnetic hover: the element is pulled toward the cursor. */
export default function Magnetic({
  children,
  className = "",
  strength = 0.32,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 180, damping: 14, mass: 0.5 });
  const y = useSpring(0, { stiffness: 180, damping: 14, mass: 0.5 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={className}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}
