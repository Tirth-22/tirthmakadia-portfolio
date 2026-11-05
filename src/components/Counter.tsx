import { useRef } from "react";
import { useInView } from "framer-motion";
import { useCountUp } from "../lib/useCountUp";

type Props = {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
};

/** Counts up once when scrolled into view. */
export default function Counter({
  value,
  suffix = "",
  prefix = "",
  className = "",
  duration = 1500,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const n = useCountUp(value, inView, duration);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {n.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
