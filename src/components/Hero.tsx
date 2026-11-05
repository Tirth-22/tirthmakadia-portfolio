import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Download, MoveRight } from "lucide-react";
import { profile, socials } from "../data/site";
import { scrollToId } from "../lib/scroll";
import { EASE } from "../lib/motion";
import { useIntro } from "../lib/intro";
import { useResume } from "../lib/ui";
import Magnetic from "./Magnetic";
import ProfileCard from "./ProfileCard";
import {
  GitHubIcon,
  LeetCodeIcon,
  LinkedInIcon,
} from "./icons/BrandIcons";

const BRAND_ICON = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  leetcode: LeetCodeIcon,
} as const;

const HEADLINE_LINES: { text: string; accent: boolean }[][] = [
  [
    { text: "Architecting", accent: false },
    { text: "Resilient", accent: true },
  ],
  [
    { text: "Distributed", accent: true },
    { text: "Systems", accent: false },
    { text: "&", accent: false },
  ],
  [
    { text: "Cloud-Native", accent: true },
    { text: "Platforms.", accent: false },
  ],
];

const wordParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};

const wordChild = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 0.95, ease: EASE } },
};

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { setOpen: setResumeOpen } = useResume();
  const { ready } = useIntro();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-24 md:pt-32 md:pb-32"
    >
      {ready && (
        <div className="shell grid w-full items-center gap-16 lg:grid-cols-12 lg:gap-8">
        {/* -------------------------------------------------- copy */}
        <motion.div style={{ y: copyY }} className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2"
          >
            <span className="status-dot" />
            <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted uppercase md:text-[11px]">
              {profile.badge}
            </span>
          </motion.div>

          <motion.h1
            variants={wordParent}
            initial="hidden"
            animate="show"
            className="text-[clamp(2.15rem,4.7vw,4.2rem)] leading-[0.98] font-semibold tracking-tighter"
          >
            {HEADLINE_LINES.map((line, li) => (
              <span
                key={`line-${li}`}
                className="-mb-[0.1em] block overflow-hidden pb-[0.1em]"
              >
                {line.map((word, wi) => (
                  <motion.span
                    key={`${word.text}-${wi}`}
                    variants={wordChild}
                    className={`inline-block ${word.accent ? "text-gradient" : ""}`}
                  >
                    {word.text}
                    {wi < line.length - 1 ? "\u00A0" : ""}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.85, ease: EASE }}
            className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted md:text-[16.5px]"
          >
            {profile.subtitle}
          </motion.p>

          {/* actions */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Magnetic strength={0.28}>
              <button
                type="button"
                onClick={() => scrollToId("projects")}
                data-cursor="explore"
                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-6 py-3.5 text-sm font-medium"
                style={{ color: "var(--c-canvas)" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[var(--c-accent)] via-[var(--c-accent)] to-[var(--c-accent-2)] transition-transform duration-500 ease-out group-hover:scale-[1.06]" />
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative flex items-center gap-2">
                  Explore Systems
                  <ArrowDown className="size-4 transition-transform duration-500 group-hover:translate-y-0.5" />
                </span>
              </button>
            </Magnetic>

            <Magnetic strength={0.22}>
              <button
                type="button"
                onClick={() => setResumeOpen(true)}
                data-cursor="open"
                className="group inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-6 py-3.5 text-sm font-medium transition-all duration-300 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)] hover:shadow-[0_0_34px_-16px_var(--c-accent)]"
              >
                <Download className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                View Resume
              </button>
            </Magnetic>
          </motion.div>

          {/* socials */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.15, ease: EASE }}
            className="mt-10 flex flex-wrap gap-2.5"
          >
            {socials.map((s) => {
              const Icon = BRAND_ICON[s.id];
              return (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="open"
                  className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--c-accent)] hover:shadow-[0_0_32px_-16px_var(--c-accent)]"
                >
                  <span className="grid size-7 place-items-center rounded-lg border border-line bg-surface-2 transition-colors duration-300 group-hover:border-[var(--c-accent)] group-hover:text-[var(--c-accent)]">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="flex flex-col leading-none">
                    <span className="text-[12.5px] font-medium">{s.label}</span>
                    <span className="mt-1 font-mono text-[9.5px] text-faint">
                      {s.handle}
                    </span>
                  </span>
                  <ArrowUpRight className="ml-1 size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                </a>
              );
            })}
          </motion.div>
        </motion.div>

        {/* -------------------------------------------------- visual */}
        <motion.div
          style={{ y: cardY, opacity: fade }}
          className="lg:col-span-5"
        >
          <ProfileCard />
        </motion.div>
        </div>
      )}

      {/* scroll cue */}
      {ready && (
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        style={{ opacity: fade }}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2.5 md:flex"
      >
        <span className="font-mono text-[9.5px] tracking-[0.3em] text-faint uppercase">
          scroll
        </span>
        <span className="relative h-12 w-px overflow-hidden bg-[var(--c-line-strong)]">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-transparent to-[var(--c-accent)]"
            animate={{ y: [-16, 48] }}
            transition={{
              duration: 1.9,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </span>
        <MoveRight className="size-3 rotate-90 text-faint" />
        </motion.div>
      )}
    </section>
  );
}
