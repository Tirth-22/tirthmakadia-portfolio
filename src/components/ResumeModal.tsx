import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, FileText, X } from "lucide-react";
import { profile, socials } from "../data/site";
import { metrics } from "../lib/metrics";
import { setScrollLock } from "../lib/scroll";
import { useResume } from "../lib/ui";
import { EASE } from "../lib/motion";

const CORE = [
  "Java 17/21",
  "Spring Boot",
  "Spring Cloud",
  "AWS",
  "Docker",
  "PostgreSQL",
  "Redis",
  "Kafka",
  "CI/CD",
];

/** iOS (incl. iPadOS masquerading as macOS) cannot render PDFs in an iframe. */
function canEmbedPdf() {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent || "";
  const iOS = /iP(hone|ad|od)/.test(ua);
  const iPadOS = /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1;
  return !iOS && !iPadOS;
}

export default function ResumeModal() {
  const { open, setOpen } = useResume();
  const embedPdf = useMemo(canEmbedPdf, []);

  useEffect(() => {
    setScrollLock(open);
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[88] flex items-center justify-center px-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:px-6 md:py-6">
          {/* backdrop */}
          <motion.button
            type="button"
            aria-label="Close resume preview"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
            data-cursor="close"
          />

          {/* panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Resume preview"
            initial={{ opacity: 0, y: 44, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="tm-modal-panel relative flex w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-line bg-canvas shadow-[0_50px_140px_-60px_rgba(0,0,0,0.95)]"
          >
            {/* header */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-3.5 md:px-5 md:py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 font-mono text-[13px] font-semibold">
                  {profile.monogram}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-medium tracking-tight">
                    {profile.name}
                    <span className="text-faint"> — </span>
                    <span className="text-muted">Resume</span>
                  </p>
                  <p className="hidden font-mono text-[11px] tracking-[0.14em] text-faint uppercase sm:block">
                    /resume.pdf · one page · updated 2026
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="open"
                  aria-label="Open resume in a new tab"
                  className="grid size-11 place-items-center rounded-full border border-line bg-surface-2 transition-colors duration-300 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)] sm:grid sm:size-auto sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-[12.5px] sm:font-medium"
                >
                  <ExternalLink className="size-4" />
                  <span className="hidden sm:inline">Open tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  data-cursor="close"
                  autoFocus
                  className="grid size-11 place-items-center rounded-full border border-line bg-surface-2 transition-colors duration-300 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"
                >
                  <X className="size-4.5" />
                </button>
              </div>
            </div>

            {/* body */}
            <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-4 sm:p-5 lg:grid-cols-12 lg:overflow-hidden">
              {/* summary rail */}
              <aside className="flex flex-col gap-4 lg:col-span-4 lg:overflow-y-auto">
                <div className="panel rounded-xl p-4">
                  <p className="label-mono">Profile</p>
                  <p className="mt-2.5 text-[14px] font-medium tracking-tight">
                    {profile.role}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    Backend systems, cloud delivery and the tooling that keeps
                    both honest.
                  </p>

                  <dl className="mt-4 space-y-2 border-t border-line pt-3 font-mono text-[11.5px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-faint">email</dt>
                      <dd className="truncate">{profile.email}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-faint">base</dt>
                      <dd>{profile.location}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-faint">status</dt>
                      <dd className="text-[var(--c-accent-2)]">available</dd>
                    </div>
                  </dl>
                </div>

                <div className="panel rounded-xl p-4">
                  <p className="label-mono">Core stack</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {CORE.map((c) => (
                      <span key={c} className="chip">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="panel rounded-xl p-4">
                  <p className="label-mono">Snapshot</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    {[
                      { k: "repos", v: metrics.github.repositories },
                      { k: "commits", v: metrics.github.commits },
                      { k: "problems", v: metrics.leetcode.totalSolved },
                    ].map((s) => (
                      <div
                        key={s.k}
                        className="rounded-lg border border-line bg-surface-2 py-2.5"
                      >
                        <p className="text-lg leading-none font-semibold tracking-tighter">
                          {s.v}
                        </p>
                        <p className="mt-1.5 font-mono text-[11px] tracking-[0.1em] text-faint uppercase">
                          {s.k}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={profile.resume}
                  download
                  data-cursor="open"
                  className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3.5 text-sm font-medium"
                  style={{ color: "var(--c-canvas)" }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-accent-2)] transition-transform duration-500 group-hover:scale-[1.05]" />
                  <span className="relative flex items-center gap-2">
                    <Download className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                    Download full resume
                  </span>
                </a>

                <div className="flex items-center gap-4 px-1 pb-1 font-mono text-[11.5px] text-faint">
                  {socials.map((s) => (
                    <a
                      key={s.id}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="open"
                      className="inline-flex min-h-11 items-center transition-colors hover:text-[var(--c-accent)]"
                    >
                      {s.label.toLowerCase()}
                    </a>
                  ))}
                </div>
              </aside>

              {/* pdf viewer — iOS Safari can't paint a PDF inside an iframe,
                  so it gets a direct-open panel instead of a blank frame. */}
              <div className="relative min-h-[380px] overflow-hidden rounded-xl border border-line bg-surface-2 lg:col-span-8">
                {embedPdf ? (
                  <>
                    <div className="absolute top-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-line bg-surface/90 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.14em] text-faint uppercase backdrop-blur-md">
                      <FileText className="size-3.5 text-[var(--c-accent)]" />
                      preview
                    </div>
                    <iframe
                      src={`${profile.resume}#toolbar=0&navpanes=0&view=FitH`}
                      title="Tirth Makadia resume preview"
                      className="h-full min-h-[380px] w-full border-0 bg-white"
                    />
                  </>
                ) : (
                  <div className="flex h-full min-h-[380px] flex-col items-center justify-center gap-5 p-7 text-center">
                    <span className="grid size-16 place-items-center rounded-2xl border border-line bg-surface">
                      <FileText
                        className="size-8 text-[var(--c-accent)]"
                        aria-hidden
                      />
                    </span>
                    <div>
                      <p className="text-[15px] font-semibold tracking-tight">
                        One-page resume
                      </p>
                      <p className="mx-auto mt-2 max-w-[19rem] text-[13.5px] leading-relaxed text-muted">
                        This browser opens PDFs in its own viewer — tap below to
                        read, save or share the resume.
                      </p>
                    </div>
                    <div className="flex w-full max-w-xs flex-col gap-2.5">
                      <a
                        href={profile.resume}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor="open"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-accent-2)] px-6 py-3.5 text-sm font-medium"
                        style={{ color: "var(--c-canvas)" }}
                      >
                        <ExternalLink className="size-4" />
                        Open resume
                      </a>
                      <a
                        href={profile.resume}
                        download
                        data-cursor="open"
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3.5 text-sm font-medium transition-colors hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"
                      >
                        <Download className="size-4" />
                        Download PDF
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
