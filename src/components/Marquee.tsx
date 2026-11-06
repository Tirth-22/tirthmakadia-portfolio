type Props = { items: readonly string[]; className?: string };

/** Infinite mono marquee with section heading. */
export default function Marquee({ items, className = "" }: Props) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item) => (
        <span key={item} className="flex items-center">
          <span className="px-5 font-mono text-[13px] font-semibold tracking-[0.22em] text-ink/85 uppercase sm:text-[14px] md:px-7 md:text-[15px]">
            {item}
          </span>
          <span className="size-1.5 rounded-full bg-[var(--c-accent)] shadow-[0_0_6px_var(--c-accent)]" />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`relative mt-8 mb-6 md:mt-10 md:mb-8 ${className}`}>
      {/* Heading: My Skills & Technologies */}
      <div className="mb-3 flex items-center justify-center gap-2.5">
        <span className="size-2 rounded-full bg-[var(--c-accent)] shadow-[0_0_8px_var(--c-accent)] animate-pulse" />
        <span className="font-mono text-[11px] font-semibold tracking-[0.25em] text-muted uppercase sm:text-[12px]">
          My Skills &amp; Technologies
        </span>
      </div>

      <div
        className="marquee relative overflow-hidden border-y border-line py-5 md:py-6"
        aria-hidden
      >
        <div className="marquee-track">
          {row}
          {row}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[var(--c-canvas)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[var(--c-canvas)] to-transparent" />
      </div>
    </div>
  );
}
