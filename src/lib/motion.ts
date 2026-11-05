import type { Transition, Variants } from "framer-motion";

/** Signature easing — fast out, long settle. Used everywhere. */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const SPRING = { stiffness: 120, damping: 20, mass: 0.9 } as const;
export const SPRING_SNAPPY = { stiffness: 320, damping: 30, mass: 0.7 } as const;

export const transition = (delay = 0, duration = 0.8): Transition => ({
  duration,
  delay,
  ease: EASE,
});

/** Container variant for staggered children. */
export const stagger = (staggerChildren = 0.07, delayChildren = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});

/** Single child: fade + slide up. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.9, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

/** Clip-path style line reveal for editorial headlines. */
export const lineReveal: Variants = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 0.95, ease: EASE } },
};

export const VIEWPORT = { once: true, margin: "-80px 0px -60px 0px" } as const;
