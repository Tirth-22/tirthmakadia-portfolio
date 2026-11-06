import { useRef, type CSSProperties } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, Calendar, Download } from "lucide-react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import Magnetic from "./Magnetic";
import { phases } from "../data/experience";
import { EASE } from "../lib/motion";
import { useResume } from "../lib/ui";

/** unfold easing — the card physically opens from its bottom edge */
const UNFOLD_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** one IntersectionObserver per timeline row (framer whileInView) */
const VIEWPORT = { once: false, amount: 0.25 } as const;

/** label relay — each row resolves its own variants, children inherit the label */
const RELAY: Variants = { hidden: {}, show: {} };

/** phase-ordered spectrum: right cards green, left cards neon blue */
const LINE_GRADIENT =
  "linear-gradient(to bottom, #10B981 0%, #0A84FF 34%, #10B981 67%, #0A84FF 100%)";

export default function Experience() {
  const { setOpen } = useResume();
  const reduce = useReducedMotion();

  /* the centre line fills in as the visitor scrolls the timeline */
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.85", "end 0.65"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0.02, 1]);
  const lineOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  /* ---- unfold choreography (static variants when reduced motion) ---- */

  /* card shell: slides in from timeline side (right card from right, left card from left) */
  const cardVariants: Variants = reduce
    ? RELAY
    : {
        hidden: (side: "left" | "right") => ({
          opacity: 0,
          x: side === "right" ? 80 : -80,
          y: 0,
        }),
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
        },
      };

  /* internal content — lands 130ms after the shell starts opening */
  const contentVariants: Variants = reduce
    ? RELAY
    : {
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: UNFOLD_EASE, delay: 0.13 },
        },
      };

  /* milestone activates the moment its card starts revealing */
  const nodeVariants: Variants = reduce
    ? RELAY
    : {
        hidden: { opacity: 0, scale: 0.4 },
        show: {
          opacity: 1,
          scale: 1,
          transition: { duration: 0.6, ease: EASE, delay: 0.05 },
        },
      };

  /* outer glow blooms as the card lands */
  const ringVariants: Variants = reduce
    ? RELAY
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { duration: 0.9, ease: EASE, delay: 0.45 },
        },
      };

  /* connector draws toward the card once it starts opening */
  const connectorVariants: Variants = reduce
    ? RELAY
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { duration: 0.7, ease: EASE, delay: 0.4 },
        },
      };

  return (
    <section
      id="experience"
      className="relative scroll-mt-24 overflow-x-clip py-24 md:py-32"
    >
      <div className="shell">
        <SectionHeading
          index="06"
          label="Experience · My Journey"
          align="center"
          title={
            <>
              Every step built <span className="text-gradient">the next</span>.
            </>
          }
          description="From writing my first lines of code to engineering backend systems and deploying applications to the cloud."
        />

        <Reveal delay={0.08} className="flex justify-center">
          <Magnetic strength={0.2}>
            <button
              type="button"
              onClick={() => setOpen(true)}
              data-cursor="open"
              className="group inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-5 py-3 text-[13px] font-medium transition-all duration-300 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)] hover:shadow-[0_0_34px_-16px_var(--c-accent)]"
            >
              <Download className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              Open full resume
            </button>
          </Magnetic>
        </Reveal>

        {/* ------------------------------------------- alternating timeline */}
        <div
          ref={timelineRef}
          className="relative mx-auto mt-16 max-w-5xl md:mt-24"
        >
          {/* base rail — always continuous */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-6 w-px bg-line md:left-[calc(50%-0.5px)]"
          />
          {/* progress rail — illuminates with scroll */}
          <motion.span
            aria-hidden
            className="absolute inset-y-0 left-6 w-px md:left-[calc(50%-0.5px)]"
            style={{
              backgroundImage: LINE_GRADIENT,
              transformOrigin: "top",
              boxShadow: "0 0 12px -3px rgba(16,185,129,0.75)",
              scaleY: reduce ? 1 : lineScale,
              opacity: reduce ? 1 : lineOpacity,
            }}
          />

          <div className="space-y-16 md:space-y-24">
            {phases.map((p, i) => {
              const side = i % 2 === 0 ? "right" : "left";
              const Icon = p.icon;
              const accent = p.accent;

              return (
                <motion.div
                  key={p.id}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT}
                  custom={side}
                  variants={RELAY}
                  className={`relative flex flex-col md:flex-row md:items-center md:justify-between ${
                    side === "left" ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* empty half — keeps the card on its own side */}
                  <div className="hidden md:block md:w-5/12" />

                  {/* connector: card → milestone */}
                  <motion.span
                    aria-hidden
                    variants={connectorVariants}
                    className="absolute top-1/2 left-6 h-px w-8 -translate-y-1/2 md:hidden"
                    style={{
                      background: `linear-gradient(to right, ${accent}99, transparent)`,
                    }}
                  />
                  <motion.span
                    aria-hidden
                    variants={connectorVariants}
                    className="absolute top-1/2 hidden h-px w-16 -translate-y-1/2 md:block"
                    style={
                      side === "right"
                        ? {
                            left: "calc(50% + 20px)",
                            background: `linear-gradient(to right, ${accent}99, transparent)`,
                          }
                        : {
                            right: "calc(50% + 20px)",
                            background: `linear-gradient(to left, ${accent}99, transparent)`,
                          }
                    }
                  />

                  {/* milestone node — centred on the rail, aligned to the card */}
                  <span className="absolute top-1/2 left-6 block z-20 -translate-x-1/2 -translate-y-1/2 md:left-1/2">
                    <motion.span
                      variants={nodeVariants}
                      className="relative grid size-9 place-items-center rounded-full border border-line bg-[var(--c-canvas)]"
                      style={{ boxShadow: `0 0 24px -8px ${accent}` }}
                    >
                      {/* outer glow — lights up once the card lands */}
                      <motion.span
                        variants={ringVariants}
                        className="absolute inset-0 rounded-full"
                        style={{
                          border: `1px solid ${accent}66`,
                          boxShadow: `0 0 18px -2px ${accent}, inset 0 0 10px -6px ${accent}`,
                        }}
                      />
                      <span
                        className="size-2.5 animate-pulse rounded-full"
                        style={{
                          background: accent,
                          boxShadow: `0 0 8px ${accent}`,
                        }}
                      />
                    </motion.span>
                  </span>

                  {/* ---------------------------------------- card (slides in from left/right) */}
                  <motion.div
                    custom={side}
                    variants={cardVariants}
                    className="ml-14 md:ml-0 md:w-5/12"
                  >
                    <article
                      className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 sm:p-6"
                      style={
                        {
                          borderColor: `${accent}40`,
                          background: `linear-gradient(155deg, ${accent}12 0%, var(--c-stage) 45%)`,
                          boxShadow: `0 34px 60px -48px ${accent}`,
                        } as CSSProperties
                      }
                    >
                      {/* hover glow */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{
                          background: `radial-gradient(120% 90% at 50% 0%, ${accent}26, transparent 65%)`,
                        }}
                      />

                      <motion.div variants={contentVariants} className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <span
                            className="accent-text rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.16em] uppercase"
                            style={
                              { "--accent-text": accent } as CSSProperties
                            }
                          >
                            Phase {p.phase} — {p.category}
                          </span>
                          <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
                            <Calendar className="size-3" />
                            {p.period}
                          </span>
                        </div>

                        <h3 className="mt-4 flex items-center gap-2 text-lg font-semibold tracking-tight text-ink sm:text-xl">
                          {p.title}
                          <Icon
                            className="size-4 shrink-0"
                            style={{ color: accent }}
                          />
                        </h3>

                        {p.org && (
                          <p
                            className="accent-text mt-1.5 font-mono text-[12px] tracking-wide"
                            style={
                              { "--accent-text": accent } as CSSProperties
                            }
                          >
                            {p.org}
                          </p>
                        )}

                        <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted">
                          {p.summary}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {p.tags.map((t) => (
                            <span key={t} className="chip">
                              {t}
                            </span>
                          ))}
                        </div>

                        {p.href && (
                          <div className="mt-4 border-t border-line pt-3.5">
                            <a
                              href={p.href}
                              target="_blank"
                              rel="noreferrer"
                              data-cursor="link"
                              className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[11.5px] text-muted transition-colors duration-200 hover:text-ink"
                            >
                              {p.hrefLabel}
                              <ArrowUpRight
                                className="size-3.5"
                                style={{ color: accent }}
                              />
                            </a>
                          </div>
                        )}
                      </motion.div>
                    </article>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
