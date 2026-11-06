import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Radar } from "lucide-react";
import { heroTags, profile } from "../data/site";
import { EASE } from "../lib/motion";

/**
 * Cybernetic profile card: scanning line, HUD brackets, orbiting ring and
 * floating tech tags. Image falls back: local file → GitHub avatar → monogram.
 */
export default function ProfileCard() {
  const [src, setSrc] = useState<string | null>(profile.photo);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const onError = () => {
    if (src === profile.photo && !avatarFailed) {
      setAvatarFailed(true);
      setSrc(profile.githubAvatar);
    } else {
      setSrc(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
      className="relative mx-auto w-full max-w-[420px] lg:max-w-none"
    >
      {/* orbiting ring */}
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-full opacity-60"
        style={{
          border: "1px dashed var(--c-line-strong)",
          animation: "orbit-spin 46s linear infinite",
          maskImage:
            "radial-gradient(circle, transparent 58%, #000 60%, #000 78%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 58%, #000 60%, #000 78%, transparent 80%)",
        }}
      />

      <div className="holo-border group relative overflow-hidden rounded-[26px] border border-line bg-surface shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)]">
        {/* card header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-faint uppercase">
            <Radar className="size-3.5 text-[var(--c-accent)]" />
            profile.json
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-[var(--c-accent-2)] uppercase">
            <span className="status-dot scale-75" />
            live
          </span>
        </div>

        {/* image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-2">
          {src ? (
            <img
              src={src}
              alt={`${profile.name} — ${profile.role}`}
              onError={onError}
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top saturate-[0.92] contrast-[1.04] transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(120%_100%_at_50%_0%,var(--c-surface-2),var(--c-surface))]">
              <div className="text-center">
                <div className="mx-auto grid size-28 place-items-center rounded-2xl border border-line bg-surface font-mono text-4xl font-semibold tracking-tighter text-gradient">
                  {profile.monogram}
                </div>
                <p className="mt-4 font-mono text-[11px] tracking-[0.24em] text-faint uppercase">
                  avatar offline
                </p>
              </div>
            </div>
          )}

          {/* grid + tint overlays */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-line) 1px, transparent 1px)",
              backgroundSize: "46px 46px",
              mixBlendMode: "overlay",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[var(--c-surface)] via-transparent to-transparent opacity-90"
          />
          <div aria-hidden className="scanline" />

          {/* HUD corner brackets */}
          <span
            aria-hidden
            className="absolute top-3 left-3 size-5 border-t border-l border-[var(--c-accent)] opacity-70"
          />
          <span
            aria-hidden
            className="absolute top-3 right-3 size-5 border-t border-r border-[var(--c-accent)] opacity-70"
          />
          <span
            aria-hidden
            className="absolute bottom-3 left-3 size-5 border-b border-l border-[var(--c-accent)] opacity-70"
          />
          <span
            aria-hidden
            className="absolute right-3 bottom-3 size-5 border-r border-b border-[var(--c-accent)] opacity-70"
          />

          {/* bottom identity plate */}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[19px] leading-tight font-semibold tracking-tight">
              {profile.name}
            </p>
            <p className="mt-1 font-mono text-[11px] text-[var(--c-accent)]">
              {profile.role}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
              <MapPin className="size-3" /> {profile.location} ·{" "}
              {profile.timezone}
            </p>
          </div>
        </div>

        {/* card footer */}
        <div className="flex items-center justify-between px-4 py-3 font-mono text-[11px] tracking-[0.14em] text-faint uppercase">
          <span>uptime 100%</span>
          <span className="text-[var(--c-accent-2)]">● systems ready</span>
        </div>
      </div>

      {/* floating tech tags — anchored fully outside the card */}
      {heroTags.map((tag, i) => {
        const positions = [
          "-top-9 left-6",
          "top-32 right-full mr-3",
          "top-[46%] right-full mr-3",
          "bottom-20 right-full mr-3",
          "-bottom-5 right-6",
        ];
        return (
          <motion.span
            key={tag.label}
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1 + i * 0.12, duration: 0.6, ease: EASE }}
            className={`chip absolute z-10 hidden whitespace-nowrap bg-surface/90 backdrop-blur-md ${
              (positions[i] ?? "").includes("right-full")
                ? "lg:inline-flex"
                : "sm:inline-flex"
            } ${positions[i] ?? "top-4 left-full ml-3"}`}
            style={{ animation: `float-y ${5.5 + i * 0.6}s ease-in-out ${tag.delay}s infinite` }}
          >
            <span className="size-1.5 rounded-full bg-[var(--c-accent)]" />
            {tag.label}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
