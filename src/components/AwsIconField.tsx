import { useEffect, useRef } from "react";
import { AWS_GLYPHS } from "../data/awsGlyphs";

/**
 * Ambient AWS service icon field.
 * Small, low-contrast AWS glyphs drift downward like a subtle digital
 * galaxy — rendered on a single canvas (few DOM nodes) behind content.
 * Runs continuously for the whole session; only pauses when the tab is
 * hidden and honours prefers-reduced-motion.
 */

type Icon = {
  img: HTMLImageElement;
  x: number;
  y: number;
  size: number;
  rot: number;
  rotSpeed: number;
  speed: number;
  sway: number;
  phase: number;
  alpha: number;
  fade: number; // 0..1 life progress for fade in/out
};

const COUNT_DESKTOP = 34;
const COUNT_MOBILE = 16;

function prefersReduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AwsIconField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = prefersReduced();
    const mobile = window.innerWidth < 768;
    const count = mobile ? COUNT_MOBILE : COUNT_DESKTOP;

    /* ---- load glyphs as images ---------------------------------- */
    const images: HTMLImageElement[] = [];
    let loaded = 0;
    AWS_GLYPHS.forEach((g) => {
      const img = new Image();
      const url = `data:image/svg+xml;utf8,${encodeURIComponent(g.svg)}`;
      img.onload = () => {
        loaded += 1;
      };
      img.src = url;
      images.push(img);
    });

    /* ---- sizing -------------------------------------------------- */
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* ---- icon pool ---------------------------------------------- */
    const spawn = (initial: boolean): Icon => {
      const img = images[Math.floor(Math.random() * images.length)];
      // subtle ambient cloud glyphs, reduced visibility so foreground content pops
      const hero = Math.random() < 0.2;
      const size = hero ? 26 + Math.random() * 14 : 16 + Math.random() * 12;
      return {
        img,
        x: Math.random() * w,
        y: initial ? Math.random() * h : -size - Math.random() * 140,
        size,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        speed: hero ? 7 + Math.random() * 8 : 10 + Math.random() * 14, // px/s
        sway: 6 + Math.random() * 18, // lateral drift amplitude
        phase: Math.random() * Math.PI * 2,
        alpha: hero ? 0.11 + Math.random() * 0.06 : 0.05 + Math.random() * 0.06,
        fade: initial ? 0.35 + Math.random() * 0.35 : 0,
      };
    };

    const icons: Icon[] = Array.from({ length: count }, () => spawn(true));

    /* ---- pause conditions ---------------------------------------- */
    let docVisible = !document.hidden;
    const onVis = () => {
      docVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    /* ---- render loop --------------------------------------------- */
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!docVisible) return;
      elapsed += dt;

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < icons.length; i++) {
        const ic = icons[i];
        if (loaded === 0 || !ic.img.complete || !ic.img.naturalWidth) continue;

        if (!reduced) {
          ic.y += ic.speed * dt;
          ic.phase += dt * 0.5;
          ic.rot += ic.rotSpeed * dt;
          // fade in near top, fade out near bottom
          const enter = Math.min(1, (ic.y + ic.size) / (h * 0.18));
          const exit = Math.min(1, (h - ic.y) / (h * 0.2));
          ic.fade = Math.max(0, Math.min(enter, exit));
          if (ic.y > h + ic.size + 20) {
            icons[i] = spawn(false);
            continue;
          }
        } else {
          ic.fade = 0.8; // static, dimmer scatter
        }

        const dx = Math.sin(ic.phase) * ic.sway;
        const a = ic.alpha * ic.fade;
        if (a <= 0.01) continue;

        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(ic.x + dx, ic.y);
        ctx.rotate(ic.rot);
        ctx.drawImage(ic.img, -ic.size / 2, -ic.size / 2, ic.size, ic.size);
        ctx.restore();
      }
    };

    raf = requestAnimationFrame(draw);

    const onResize = () => {
      resize();
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 1 }}
    />
  );
}
