import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "../lib/scroll";

/** Lenis inertia scrolling — drives every scroll-linked animation. */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // Native scrolling is more reliable on iOS/Android, especially when a
    // phone browser is displaying the desktop site layout.
    if (reduce || coarse) return;

    const lenis = new Lenis({
      duration: 0.9,
      // Quick, linear-ish settle — no long exponential tail to feel heavy.
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.8,
    });

    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // Pause lenis while the resume modal is open (body scroll lock).
    const onModal = (e: Event) => {
      const open = (e as CustomEvent<boolean>).detail;
      if (open) lenis.stop();
      else lenis.start();
    };
    window.addEventListener("tm-modal", onModal as EventListener);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("tm-modal", onModal as EventListener);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
