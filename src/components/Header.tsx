import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight, Download, Menu, Moon, Sun, X } from "lucide-react";
import { navLinks, profile, socials } from "../data/site";
import { scrollToId, scrollToTop, setScrollLock } from "../lib/scroll";
import { useActiveSection, useScrolled } from "../lib/useActiveSection";
import { useTheme } from "../lib/useTheme";
import { useIntro } from "../lib/intro";
import Magnetic from "./Magnetic";
import {
  GitHubIcon,
  LeetCodeIcon,
  LinkedInIcon,
} from "./icons/BrandIcons";

const NAV_IDS = navLinks.map((l) => l.id) as string[];
const BRAND_ICON = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  leetcode: LeetCodeIcon,
} as const;

function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "dark" | "light";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      data-cursor="link"
      className="relative flex h-11 w-[4.2rem] shrink-0 items-center rounded-full border border-line bg-surface-2 p-1 transition-colors duration-300 hover:border-[var(--c-line-strong)] xl:h-8 xl:w-[3.4rem]"
    >
      <motion.span
        className="grid size-9 place-items-center rounded-full bg-canvas shadow-[0_2px_10px_-4px_rgba(0,0,0,0.6)] xl:size-6"
        animate={{ x: theme === "dark" ? 0 : 22 }}
        transition={{ type: "spring", stiffness: 480, damping: 32, mass: 0.6 }}
      >
        <motion.span
          className="grid place-items-center"
          animate={{ rotate: theme === "dark" ? 0 : 180 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {theme === "dark" ? (
            <Moon className="size-3.5 text-[var(--c-accent)]" />
          ) : (
            <Sun className="size-3.5 text-[var(--c-accent)]" />
          )}
        </motion.span>
      </motion.span>
    </button>
  );
}

export default function Header() {
  const active = useActiveSection(NAV_IDS);
  const scrolled = useScrolled(20);
  const { theme, toggle } = useTheme();
  const { ready } = useIntro();
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.3,
  });

  useEffect(() => {
    setScrollLock(menuOpen, "mobile-menu");
    return () => setScrollLock(false, "mobile-menu");
  }, [menuOpen]);

  const go = (id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollToId(id), menuOpen ? 260 : 0);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[80] transition-all duration-500 ${
          scrolled ? "px-3 pt-2 md:px-4 md:pt-2.5" : "px-3 pt-3 md:px-5 md:pt-4"
        }`}
      >
        <motion.div
          initial={{ y: -70, opacity: 0 }}
          animate={ready ? { y: 0, opacity: 1 } : { y: -70, opacity: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          /* mt keeps the bar clear of the notch/status bar when the site is
             opened as a home-screen web app (viewport-fit=cover). */
          className={`relative mx-auto mt-[env(safe-area-inset-top,0px)] flex items-center justify-between gap-3 transition-all duration-500 ${
            scrolled
              ? "max-w-[72rem] rounded-xl px-2.5 py-1 glass shadow-[0_16px_40px_-28px_rgba(0,0,0,0.9)] md:px-3"
              : "max-w-[86rem] rounded-2xl border border-transparent bg-transparent px-3 py-2 md:px-4"
          }`}
        >
          {/* Monogram + status */}
          <button
            type="button"
            onClick={scrollToTop}
            data-cursor="link"
            className={`group flex items-center rounded-xl pr-1 pl-1 md:pl-1.5 ${
              scrolled ? "gap-2" : "gap-2.5"
            }`}
            aria-label="Back to top"
          >
            <span
              className={`relative grid place-items-center rounded-lg border border-line bg-surface-2 font-mono font-semibold tracking-tight transition-all duration-500 group-hover:border-[var(--c-accent)] group-hover:text-[var(--c-accent)] ${
                scrolled ? "size-8 text-[12px]" : "size-9 text-[13px]"
              }`}
            >
              {profile.monogram}
              <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-[var(--c-accent-2)]">
                <span className="absolute inset-0 animate-ping rounded-full bg-[var(--c-accent-2)] opacity-75" />
              </span>
            </span>
            <span className="hidden flex-col items-start leading-none sm:flex">
              <span
                className={`font-medium tracking-tight transition-all duration-500 ${
                  scrolled ? "text-[12.5px]" : "text-[13.5px]"
                }`}
              >
                {profile.name}
              </span>
              <span
                className={`flex items-center gap-1.5 font-mono tracking-[0.14em] text-faint uppercase transition-all duration-500 ${
                  scrolled ? "mt-0.5 text-[10.5px]" : "mt-1 text-[11px]"
                }`}
              >
                <span className="status-dot scale-75" />
                {profile.status}
              </span>
            </span>
          </button>

          {/* Jump links */}
          <nav
            className={`hidden items-center gap-0.5 rounded-full border border-line bg-[color-mix(in_srgb,var(--c-surface)_65%,transparent)] backdrop-blur-md lg:flex ${
              scrolled ? "p-0.5" : "p-1"
            }`}
          >
            {navLinks.map((link) => {
              const isActive = active === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => go(link.id)}
                  data-cursor="link"
                  className={`relative rounded-full font-medium tracking-tight transition-all duration-300 ${
                    scrolled
                      ? "px-3 py-2 text-[12px]"
                      : "px-3.5 py-2.5 text-[12.5px]"
                  }`}
                  style={{ color: isActive ? "var(--c-ink)" : "var(--c-muted)" }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 -z-10 rounded-full border border-line bg-surface-2"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Magnetic strength={0.25} className="hidden sm:block">
              <a
                href={profile.resume}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="open"
                aria-label="Open resume in a new tab"
                className={`group flex items-center gap-1.5 rounded-full border border-line bg-surface-2 font-medium tracking-tight transition-all duration-300 hover:border-[var(--c-accent)] hover:text-[var(--c-accent)] hover:shadow-[0_0_26px_-12px_var(--c-accent)] ${
                  scrolled
                    ? "px-3.5 py-2 text-[12px]"
                    : "px-4 py-2.5 text-[12.5px]"
                }`}
              >
                <Download className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
                Resume
              </a>
            </Magnetic>

            <ThemeToggle theme={theme} onToggle={toggle} />

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              data-cursor="link"
              className="grid size-10 place-items-center rounded-full border border-line bg-surface-2 transition-colors hover:border-[var(--c-accent)] lg:hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="grid place-items-center"
                >
                  {menuOpen ? (
                    <X className="size-4" />
                  ) : (
                    <Menu className="size-4" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>

          {/* scroll progress */}
          <motion.div
            style={{ scaleX: progress }}
            className="absolute inset-x-3 -bottom-px h-px origin-left rounded-full bg-gradient-to-r from-[var(--c-accent)] via-[var(--c-accent-2)] to-transparent opacity-70"
          />
        </motion.div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[79] overflow-y-auto bg-[color-mix(in_srgb,var(--c-canvas)_92%,transparent)] px-5 pt-24 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] backdrop-blur-2xl lg:hidden"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  type="button"
                  onClick={() => go(link.id)}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.06 * i + 0.08,
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex items-baseline gap-4 border-b border-line py-4 text-left"
                >
                  <span className="font-mono text-[11px] text-[var(--c-accent)]">
                    0{i + 1}
                  </span>
                  <span className="text-3xl font-semibold tracking-tighter">
                    {link.label}
                  </span>
                  <ArrowUpRight className="ml-auto size-4 text-faint" />
                </motion.button>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.5 }}
              className="mt-8 flex flex-col gap-4"
            >
              <a
                href={profile.resume}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor="open"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--c-ink)] px-5 py-3.5 text-sm font-medium text-[var(--c-canvas)]"
              >
                <Download className="size-4" /> View resume
              </a>

              <div className="flex items-center justify-between gap-2">
                {socials.map((s) => {
                  const Icon = BRAND_ICON[s.id];
                  return (
                    <a
                      key={s.id}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="open"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 py-3 text-[12px] text-muted"
                    >
                      <Icon className="size-4" /> {s.label}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
