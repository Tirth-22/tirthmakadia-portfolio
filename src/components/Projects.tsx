import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import SectionHeading from "./SectionHeading";
import ProjectVisual from "./ProjectVisuals";
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

  return (
    <article
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
              background: "#08090C",
              borderColor: `${t.accentColor}33`,
            }}
          >
            {/* Visual Top Bar — Clean, no LIVE badge */}
            <div className="mb-3 flex items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
              <span
                className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase"
                style={{ color: t.badgeText }}
              >
                {project.index} // system visual
              </span>
              <span className="font-mono text-[11px] tracking-[0.14em] text-slate-500 uppercase">
                {project.index} / {String(total).padStart(2, "0")}
              </span>
            </div>

            <div className="flex flex-1 items-center justify-center py-2">
              <ProjectVisual variant={project.visual} accent={project.accent} />
            </div>

            <p className="mt-3 border-t border-white/[0.07] pt-3 font-mono text-[11px] leading-relaxed tracking-[0.08em] text-slate-400">
              {project.visualCaption}
            </p>
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
                className="font-mono text-[11px] font-semibold tracking-[0.16em] uppercase"
                style={{ color: t.badgeText }}
              >
                {project.index} · {project.category}
              </span>
            </div>

            <h3 className="mt-3 text-[1.65rem] font-semibold tracking-tight text-white sm:text-3xl lg:text-[2.05rem] lg:leading-[1.2]">
              {project.title}
            </h3>

            <p className="mt-4 text-[15px] leading-relaxed text-slate-300 sm:text-[16px]">
              {project.summary}
            </p>

            <div
              className="mt-6 rounded-xl border p-4 sm:p-5"
              style={{
                background: "#0d1117",
                borderColor: `${t.cardBorder}88`,
              }}
            >
              <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                Architecture pipeline
              </p>
              <p
                className="mt-2 font-mono text-[12.5px] leading-relaxed break-words sm:text-[13px]"
                style={{ color: t.badgeText }}
              >
                {project.architecture}
              </p>
            </div>

            <div className="mt-6">
              <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                Key engineering highlights
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {project.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2.5 text-[13.5px] leading-snug text-slate-300"
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
                  className="rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-medium transition-colors duration-200"
                  style={{
                    color: t.badgeText,
                    backgroundColor: t.badgeBg,
                    borderColor: `${t.cardBorder}aa`,
                  }}
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
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-[#161b22] px-5 py-3 text-[13px] font-medium text-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                >
                  <GitHubIcon className="size-4" />
                  View Repository
                  <ArrowUpRight className="size-4" />
                </a>
              ) : null}

              <a
                href={project.demo ?? project.repo}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="open"
                className="inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  backgroundColor: "rgba(36, 150, 237, 0.12)",
                  borderColor: "rgba(36, 150, 237, 0.45)",
                  color: "#38BDF8",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(36, 150, 237, 0.24)";
                  e.currentTarget.style.borderColor = "#2496ED";
                  e.currentTarget.style.boxShadow = "0 0 24px -6px rgba(36, 150, 237, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(36, 150, 237, 0.12)";
                  e.currentTarget.style.borderColor = "rgba(36, 150, 237, 0.45)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Explore System
                <ArrowUpRight className="size-4" />
              </a>
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
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] font-semibold tracking-wider uppercase transition-all duration-200 sm:text-[11.5px] ${
                    isActive
                      ? "border-[#2496ED]/60 bg-[#2496ED]/15 text-[#38BDF8] shadow-[0_0_18px_rgba(36,150,237,0.25)]"
                      : "border-white/10 bg-[#12161D] text-slate-400 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span
                    className={`size-1.5 rounded-full ${
                      isActive ? "bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" : "bg-slate-500"
                    }`}
                  />
                  {p.index} · {p.id.toUpperCase()}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <p
              className="font-mono text-[12px] font-semibold tracking-[0.2em] text-slate-300 sm:text-[13px]"
              aria-live="polite"
            >
              <span className="text-[#38BDF8]">{currentProject.index}</span>
              <span className="text-slate-500"> / </span>
              {String(total).padStart(2, "0")}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous project"
                data-cursor="link"
                className="grid size-10 place-items-center rounded-full border border-white/12 bg-surface text-slate-300 transition-all duration-200 hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:scale-95 sm:size-11"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next project"
                data-cursor="link"
                className="grid size-10 place-items-center rounded-full border border-white/12 bg-surface text-slate-300 transition-all duration-200 hover:border-white/30 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:scale-95 sm:size-11"
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
                className="h-2 rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
                style={{
                  width: isActive ? 28 : 8,
                  backgroundColor: isActive
                    ? "#38BDF8"
                    : "rgba(255,255,255,0.2)",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
