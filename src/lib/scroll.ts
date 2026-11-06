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

/* ------------------------------------------------------------------
   Overlay scroll lock

   `overflow: hidden` alone is not enough: iOS Safari still lets the
   document rubber-band behind a fixed overlay. On coarse-pointer devices
   we pin the body in place instead (the classic position:fixed technique)
   and restore the scroll offset — and Lenis' own scroll value — on unlock.
   Desktop keeps the cheap overflow lock so the scrollbar never shifts.
------------------------------------------------------------------ */
let locks = 0;
let savedScrollY = 0;

const isCoarsePointer = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(pointer: coarse)").matches;

export function setScrollLock(locked: boolean) {
  window.dispatchEvent(new CustomEvent("tm-modal", { detail: locked }));

  const body = document.body;
  const html = document.documentElement;
  if (!body || !html) return;

  if (locked) {
    locks += 1;
    if (locks > 1) return;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (isCoarsePointer()) {
      body.style.position = "fixed";
      body.style.top = `-${savedScrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
    }
  } else {
    locks = Math.max(0, locks - 1);
    if (locks > 0) return;
    body.style.overflow = "";
    html.style.overflow = "";
    if (body.style.position === "fixed") {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      const y = savedScrollY;
      // Restore the offset — window first, then hand it back to Lenis so
      // its internal value doesn't snap the page back to the top.
      window.scrollTo(0, y);
      instance?.scrollTo(y, { immediate: true });
    }
  }
}
