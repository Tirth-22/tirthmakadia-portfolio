import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  MapPin,
  RotateCcw,
  Send,
} from "lucide-react";
import Reveal from "./Reveal";
import { profile, socials } from "../data/site";
import { useToast } from "../lib/ui";
import { scrollToTop } from "../lib/scroll";
import { useClock } from "../lib/useClock";
import { EASE } from "../lib/motion";
import { useIntro } from "../lib/intro";
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

const TERMINAL = [
  { cmd: "whoami", out: `${profile.name.toLowerCase().replace(" ", "_")} — ${profile.role.toLowerCase()}` },
  { cmd: "ping rajkot-in", out: "64 bytes · 0% packet loss · all systems operational" },
  { cmd: "availability --role backend", out: "open to opportunities · response < 24h" },
];

export default function Contact() {
  const { push } = useToast();
  const { ist, utc, date } = useClock();
  const [copied, setCopied] = useState(false);
  const { replay } = useIntro();

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      push({ title: "Email copied to clipboard", description: profile.email });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      push({
        title: "Clipboard blocked",
        description: profile.email,
      });
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-24 pt-24 pb-10 md:pt-32">
      <div className="shell">
        {/* -------------------------------------------------- contact card */}
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
            {/* backdrop */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage:
                  "radial-gradient(ellipse 80% 90% at 50% 0%, #000 20%, transparent 85%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 90% at 50% 0%, #000 20%, transparent 85%)",
              }}
            />
            <div
              aria-hidden
              className="absolute -top-32 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full blur-[90px]"
              style={{ background: "var(--orb-a)" }}
            />

            <div className="relative px-6 py-12 md:px-12 md:py-16">
              {/* terminal lines */}
              <div className="mb-9 space-y-1.5 font-mono text-[11.5px] md:text-[12.5px]">
                {TERMINAL.map((t) => (
                  <div key={t.cmd} className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[var(--c-accent-2)]">$</span>
                    <span className="text-[var(--c-accent)]">{t.cmd}</span>
                    <span className="text-faint">→</span>
                    <span className="text-muted">{t.out}</span>
                  </div>
                ))}
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-70px" }}
                transition={{ duration: 0.9, ease: EASE }}
                className="max-w-[16ch] text-[clamp(2.1rem,5.6vw,4.4rem)] leading-[0.98] font-semibold tracking-tighter text-balance"
              >
                Let's build something{" "}
                <span className="text-gradient">scalable</span> together.
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
                className="mt-5 max-w-lg text-[14.5px] leading-relaxed text-muted"
              >
                Open to backend engineering and DevOps roles, freelance systems
                work, or a good conversation about why your p99 is what it is.
              </motion.p>

              {/* actions */}
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={copyEmail}
                  data-cursor="copy"
                  className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-6 py-3.5 text-sm font-medium"
                  style={{ color: "var(--c-canvas)" }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[var(--c-accent)] to-[var(--c-accent-2)] transition-transform duration-500 group-hover:scale-[1.05]" />
                  <span className="relative flex items-center gap-2.5">
                    {copied ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    {copied ? "Copied" : "Copy email"}
                  </span>
                </button>

                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                    profile.email,
                  )}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="open"
                  className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface-2 px-6 py-3.5 text-sm font-medium transition-all duration-300 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"
                >
                  <Mail className="size-4" />
                  Write an email
                </a>

                <a
                  href={socials[1].href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="open"
                  className="inline-flex items-center gap-2.5 rounded-full border border-line px-6 py-3.5 text-sm font-medium transition-all duration-300 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"
                >
                  <Send className="size-4" />
                  Connect on LinkedIn
                </a>
              </div>

              {/* socials */}
              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {socials.map((s) => {
                  const Icon = BRAND_ICON[s.id];
                  return (
                    <a
                      key={s.id}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="open"
                      className="group flex items-center gap-3 rounded-2xl border border-line bg-surface-2/70 px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--c-accent)] hover:bg-surface-2 hover:shadow-[0_0_40px_-22px_var(--c-accent)]"
                    >
                      <span className="grid size-9 place-items-center rounded-xl border border-line bg-surface transition-colors duration-300 group-hover:border-[var(--c-accent)] group-hover:text-[var(--c-accent)]">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium">
                          {s.label}
                        </span>
                        <span className="block truncate font-mono text-[10px] text-faint">
                          {s.description}
                        </span>
                      </span>
                      <ArrowUpRight className="ml-auto size-4 -translate-x-1 text-faint opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  );
                })}
              </div>

              {/* clock + status strip */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <span className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.1em] text-muted">
                  <MapPin className="size-3.5 text-[var(--c-accent)]" />
                  {profile.location}
                  <span className="text-faint">•</span>
                  <span className="status-dot" />
                  all systems operational
                </span>

                <span className="flex flex-wrap items-center gap-4 font-mono text-[11px] tabular-nums">
                  <span className="text-faint">
                    IST <span className="text-muted">{ist}</span>
                  </span>
                  <span className="text-faint">
                    UTC <span className="text-muted">{utc}</span>
                  </span>
                  <span className="text-faint">{date}</span>
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* -------------------------------------------------- footer */}
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7 pb-2">
          <p className="font-mono text-[11px] text-faint">
            © {new Date().getFullYear()} {profile.name} ·{" "}
            <span className="text-muted">{profile.role}</span>
          </p>

          <p className="hidden font-mono text-[11px] text-faint md:block">
            Designed &amp; built with React · Tailwind · Framer Motion
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            data-cursor="link"
            className="group flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[11px] text-muted transition-all duration-300 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"
          >
            back to top
            <ArrowUp className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>

          <button
            type="button"
            onClick={replay}
            data-cursor="link"
            className="group flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[11px] text-muted transition-all duration-300 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"
          >
            <RotateCcw className="size-3.5 transition-transform duration-300 group-hover:-rotate-90" />
            Replay Intro
          </button>
        </footer>
      </div>
    </section>
  );
}
