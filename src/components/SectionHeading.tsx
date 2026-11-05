import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { EASE } from "../lib/motion";

type Props = {
  label: string;
  title: ReactNode;
  description?: string;
  index?: string;
  align?: "left" | "center";
  className?: string;
};

/** Editorial section header: mono index + label, oversized title. */
export default function SectionHeading({
  label,
  title,
  description,
  index,
  align = "left",
  className = "",
}: Props) {
  const centered = align === "center";

  return (
    <div
      className={`mb-12 md:mb-16 ${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"} ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className={`mb-5 flex items-center gap-3 ${centered ? "justify-center" : ""}`}
      >
        {index && (
          <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--c-accent)]">
            {index}
          </span>
        )}
        <span className="h-px w-8 bg-[var(--c-line-strong)]" />
        <span className="label-mono">{label}</span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 0.85, ease: EASE, delay: 0.06 }}
        className="text-[clamp(2rem,4.6vw,3.6rem)] leading-[1.03] font-semibold tracking-tighter text-balance"
      >
        {title}
      </motion.h2>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-70px" }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.14 }}
          className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted md:text-base"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
