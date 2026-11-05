import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE } from "../lib/motion";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  once?: boolean;
};

/** Scroll-triggered fade + slide-up reveal. */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.8,
  once = true,
}: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-70px 0px -60px 0px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
