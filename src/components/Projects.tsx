import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ProjectVisual, { STREAM_DEPARTMENTS } from "./ProjectVisuals";
import { projects, type Project } from "../data/projects";
import { GitHubIcon } from "./icons/BrandIcons";
import { EASE } from "../lib/motion";

/* ------------------------------------------------------------------ */
/* Featured Project Slide                                             */
/* ------------------------------------------------------------------ */
function FeaturedProjectSlide({
  project,
  total,
  onMouseEnter,
  onMouseLeave,
}: {
  project: Project;
  total: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const t = project.theme;
  /* In-place live demo for projects flagged `liveDemo` — the panel never grows,
     the caption row swaps for the controls instead. */
  const supportsDemo = Boolean(project.liveDemo);
  const [demoOn, setDemoOn] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  const toggleDemo = () => {
    setDemoOn((on) => {
      const next = !on;
      if (!next) setPicked(null);
      if (next && window.matchMedia("(max-width: 1023px)").matches) {
        visualRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return next;
    });
  };

  const readout = picked
    ? `→ get("${picked}") = ${STREAM_DEPARTMENTS.find((d) => d.label === picked)?.val ?? "0"} records`
    : `→ {${STREAM_DEPARTMENTS.map((d) => `${d.label}=${d.val}`).join(", ")}}`;

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onPointerDown={onMouseEnter}
      onPointerLeave={onMouseLeave}
      className="relative w-full min-h-[34rem] rounded-2xl border bg-surface p-5 sm:min-h-[36rem] sm:p-7 md:rounded-3xl md:p-9 lg:min-h-[40rem] lg:p-10"
      style={{
        borderColor: `${t.cardBorder}99`,
        boxShadow: `0 24px 60px -24px rgba(0,0,0,0.65), 0 0 28px -18px ${t.borderGlow}`,
      }}
    >
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left — spacious uncropped visual */}
        <div className="lg:col-span-6 xl:col-span-6">
          <div
            className="relative flex h-full min-h-[280px] w-full flex-col rounded-2xl border p-4 sm:min-h-[340px] sm:p-5 lg:min-h-[480px]"
            style={{
              background: "var(--c-stage)",
              borderColor: `${t.accentColor}33`,
            }}
          >
            {/* Visual Top Bar — Clean, no LIVE badge */}
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-line pb-3">
              <span
                className="accent-text font-mono text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ "--accent-text": t.badgeText } as CSSProperties}
              >
                {project.index} // system visual
              </span>
              <span className="font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
                {project.index} / {String(total).padStart(2, "0")}
              </span>
            </div>

            <div ref={visualRef} className="flex flex-1 items-center justify-center py-2">
              <ProjectVisual
                variant={project.visual}
                accent={project.accent}
                interactive={supportsDemo && demoOn}
                selected={supportsDemo && demoOn ? picked : null}
                onSelect={setPicked}
              />
            </div>

            {/* Caption row — swaps for live-demo controls at identical height */}
            {supportsDemo && demoOn ? (
              <div
                className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 border-t border-line pt-3"
                style={
                  {
                    "--accent-text": t.badgeText,
                    "--accent-bg": t.badgeBg,
                  } as CSSProperties
                }
              >
                <div
                  className="flex flex-wrap items-center gap-1.5"
                  role="group"
                  aria-label="Live demo — inspect a department"
                >
                  <button
                    type="button"
                    onClick={() => setPicked(null)}
                    aria-pressed={picked === null}
                    data-cursor="link"
                    className={`min-h-10 rounded-full border px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 ${
                      picked === null
                        ? "accent-tint accent-text"
                        : "border-line bg-surface-2 text-muted hover:text-ink"
                    }`}
                  >
                    all
                  </button>
                  {STREAM_DEPARTMENTS.map((d) => {
                    const active = picked === d.label;
                    return (
                      <button
                        key={d.label}
                        type="button"
                        onClick={() => setPicked(active ? null : d.label)}
                        aria-pressed={active}
                        data-cursor="link"
                        className={`min-h-10 rounded-full border px-3 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase transition-all duration-200 ${
                          active
                            ? "accent-tint accent-text"
                            : "border-line bg-surface-2 text-muted hover:text-ink"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                <p
                  className="min-w-0 flex-1 truncate text-right font-mono text-[11px] tracking-[0.06em] text-muted"
                  aria-live="polite"
                >
                  {readout}
                </p>
              </div>
            ) : (
              <p className="mt-3 border-t border-line pt-3 font-mono text-[11px] leading-relaxed tracking-[0.08em] text-muted">
                {project.visualCaption}
              </p>
            )}
          </div>
        </div>

        {/* Right — full readable project info */}
        <div className="flex flex-col justify-between gap-8 lg:col-span-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="inline-block size-2 shrink-0 rounded-full"
                style={{ backgroundColor: t.accentColor }}
                aria-hidden
              />
              <span
                className="accent-text font-mono text-[11px] font-semibold tracking-[0.16em] uppercase"
                style={{ "--accent-text": t.badgeText } as CSSProperties}
              >
                {project.index} · {project.category}
              </span>
            </div>

            <h3 className="mt-3 text-[1.65rem] font-semibold tracking-tight text-ink sm:text-3xl lg:text-[2.05rem] lg:leading-[1.2]">
              {project.title}
            </h3>

            <p className="mt-4 text-[15px] leading-relaxed text-muted dark:text-slate-300 sm:text-[16px]">
              {project.summary}
            </p>

            <div
              className="mt-6 rounded-xl border p-4 sm:p-5"
              style={{
                background: "var(--c-stage)",
                borderColor: `${t.cardBorder}88`,
              }}
            >
              <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-faint uppercase">
                Architecture pipeline
              </p>
              <p
                className="accent-text mt-2 font-mono text-[12.5px] leading-relaxed break-words sm:text-[13px]"
                style={{ "--accent-text": t.badgeText } as CSSProperties}
              >
                {project.architecture}
              </p>
            </div>

            <div className="mt-6">
              <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-faint uppercase">
                Key engineering highlights
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {project.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2.5 text-[13.5px] leading-snug text-muted dark:text-slate-300"
                  >
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: t.accentColor }}
                      aria-hidden
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {project.stack.map((tag) => (
                <span
                  key={tag}
                  className="accent-tint rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-medium transition-colors duration-200"
                  style={
                    {
                      "--accent-text": t.badgeText,
                      "--accent-bg": t.badgeBg,
                    } as CSSProperties
                  }
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* CTAs: Unified Blue theme for Explore System / Live Demo on EVERY project */}
            <div className="flex flex-wrap items-center gap-3">
              {project.repo ? (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="open"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface-2 px-5 py-3 text-[13px] font-medium text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--c-line-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-accent)]"
                >
                  <GitHubIcon className="size-4" />
                  View Repository
                  <ArrowUpRight className="size-4" />
                </a>
              ) : null}

              {supportsDemo ? (
                <button
                  type="button"
                  onClick={toggleDemo}
                  aria-pressed={demoOn}
                  data-cursor="link"
                  className={`accent-text inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    demoOn
                      ? "border-[#2496ED] bg-[#2496ED]/25 shadow-[0_0_24px_-6px_rgba(36,150,237,0.6)]"
                      : "border-[rgba(36,150,237,0.45)] bg-[rgba(36,150,237,0.12)] hover:border-[#2496ED] hover:bg-[rgba(36,150,237,0.24)] hover:shadow-[0_0_24px_-6px_rgba(36,150,237,0.6)]"
                  }`}
                  style={{ "--accent-text": "#38BDF8" } as CSSProperties}
                >
                  {demoOn ? (
                    <span
                      className="size-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]"
                      aria-hidden
                    />
                  ) : null}
                  Live Demo
                  {demoOn ? null : <ArrowUpRight className="size-4" />}
                </button>
              ) : (
                <a
                  href={project.demo ?? project.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="open"
                  className="accent-text inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(36,150,237,0.45)] bg-[rgba(36,150,237,0.12)] px-5 py-3 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2496ED] hover:bg-[rgba(36,150,237,0.24)] hover:shadow-[0_0_24px_-6px_rgba(36,150,237,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ "--accent-text": "#38BDF8" } as CSSProperties}
                >
                  Explore System
                  <ArrowUpRight className="size-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                            */
/* ------------------------------------------------------------------ */
export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const total = projects.length;
  const currentProject = projects[activeIndex];
  const AUTOPLAY_MS = 5500;

  const goTo = useCallback(
    (nextIdx: number, dir?: 1 | -1) => {
      const clamped = ((nextIdx % total) + total) % total;
      setDirection(dir ?? (clamped > activeIndex ? 1 : -1));
      setActiveIndex(clamped);
    },
    [activeIndex, total],
  );

  const prev = useCallback(() => {
    setActiveIndex((curr) => {
      const nextIdx = (curr - 1 + total) % total;
      setDirection(-1);
      return nextIdx;
    });
  }, [total]);

  const next = useCallback(() => {
    setActiveIndex((curr) => {
      const nextIdx = (curr + 1) % total;
      setDirection(1);
      return nextIdx;
    });
  }, [total]);

  // Advance automatically after some time; resets whenever active slide changes
  useEffect(() => {
    if (isPaused) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((curr) => {
        setDirection(1);
        return (curr + 1) % total;
      });
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, total, isPaused]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  const slideVariants = reduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : {
        enter: (d: number) => ({ x: d > 0 ? 56 : -56, opacity: 0 }),
        center: {
          x: 0,
          opacity: 1,
          transition: {
            x: { duration: 0.38, ease: EASE },
            opacity: { duration: 0.28, ease: "easeOut" as const },
          },
        },
        exit: (d: number) => ({
          x: d > 0 ? -40 : 40,
          opacity: 0,
          transition: {
            x: { duration: 0.28, ease: EASE },
            opacity: { duration: 0.2, ease: "easeIn" as const },
          },
        }),
      };

  return (
    <section
      id="projects"
      className="relative scroll-mt-24 overflow-hidden py-24 md:py-32"
      aria-roledescription="carousel"
      aria-label="Featured projects"
    >
      <div className="shell">
        <SectionHeading
          index="04"
          label="Featured Projects"
          title={
            <>
              Projects I've <span className="text-gradient">engineered</span>.
            </>
          }
          description="Selected engineering projects exploring backend architecture, cloud infrastructure, distributed systems and algorithmic problem-solving."
        />

        {/* Controls: Project selector tabs + counter + prev/next (NO green line) */}
        <div className="mt-8 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {projects.map((p, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => goTo(idx)}
                  data-cursor="link"
                  className={`flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 font-mono text-[11px] font-semibold tracking-wider uppercase transition-all duration-200 sm:text-[11.5px] ${
                    isActive
                      ? "border-[#2496ED]/60 bg-[#2496ED]/15 text-[#0369a1] shadow-[0_0_18px_rgba(36,150,237,0.25)] dark:text-[#38BDF8]"
                      : "border-line bg-surface-2 text-muted hover:border-[var(--c-line-strong)] hover:text-ink"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      isActive
                        ? "bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]"
                        : "bg-[var(--c-faint)]"
                    }`}
                  />
                  {p.index} · {p.id.toUpperCase()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <p
              className="font-mono text-[12px] font-semibold tracking-[0.2em] text-muted dark:text-slate-300 sm:text-[13px]"
              aria-live="polite"
            >
              <span className="text-[#0369a1] dark:text-[#38BDF8]">{currentProject.index}</span>
              <span className="text-faint"> / </span>
              {String(total).padStart(2, "0")}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous project"
                data-cursor="link"
                className="grid size-10 place-items-center rounded-full border border-line bg-surface text-muted transition-all duration-200 hover:border-[var(--c-line-strong)] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-accent)] active:scale-95 sm:size-11"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next project"
                data-cursor="link"
                className="grid size-10 place-items-center rounded-full border border-line bg-surface text-muted transition-all duration-200 hover:border-[var(--c-line-strong)] hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-accent)] active:scale-95 sm:size-11"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide */}
        <div className="relative w-full overflow-hidden" aria-live="polite">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentProject.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={reduceMotion ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -6000 || offset.x < -72) next();
                else if (swipe > 6000 || offset.x > 72) prev();
              }}
              className="w-full"
            >
              <FeaturedProjectSlide
                project={currentProject}
                total={total}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div
          className="mt-7 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Select project"
        >
          {projects.map((p, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show project ${p.index}: ${p.title}`}
                onClick={() => goTo(idx)}
                data-cursor="link"
                className="grid size-10 place-items-center rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--c-accent)] active:scale-95"
              >
                <span
                  className="block h-2 rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? 28 : 8,
                    backgroundColor: isActive
                      ? "#38BDF8"
                      : "color-mix(in srgb, var(--c-ink) 25%, transparent)",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
