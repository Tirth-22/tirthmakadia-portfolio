import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis() {
  return instance;
}

/** Smoothly jump to a section id, accounting for the floating header. */
export function scrollToId(id: string, offset = -84) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) {
    instance.scrollTo(el, { offset, duration: 1.35 });
  } else {
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY + offset,
      behavior: "smooth",
    });
  }
}

export function scrollToTop() {
  if (instance) instance.scrollTo(0, { duration: 1.2 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

/** Lock page scroll while an overlay (menu / modal) is open. */
export function setScrollLock(locked: boolean) {
  window.dispatchEvent(new CustomEvent("tm-modal", { detail: locked }));
  document.body.style.overflow = locked ? "hidden" : "";
}
