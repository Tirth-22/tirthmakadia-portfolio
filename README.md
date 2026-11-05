# Tirth Makadia — Portfolio

A cinematic, agency-grade portfolio for a **Java Backend & Cloud DevOps Engineer**. React 19 + Vite + Tailwind CSS v4 + Framer Motion + Lenis smooth scrolling.

![dark theme preview](shots/top.png)

## Highlights

- **Cinematic first-visit intro** — a ~2s boot sequence (blackout + pulsing server grid → terminal boot lines → `TM` monogram flare with a light sweep → split-curtain wipe into the hero). Runs once per session (`sessionStorage`), blocks interaction until complete, skipped entirely for `prefers-reduced-motion`.
- **Compute/cloud palette** — deep electric cobalt and ice blue (`#2563EB` / `#38BDF8` / `#00D2FF`) with cyber-violet secondary (`#6366F1`) on ultra-dark midnight surfaces (`#08090E`–`#0D1117`), hairline `rgba(56,189,248,0.12)` borders, radial card illumination and glassmorphism.
- **Snappy interaction** — high-performance custom cursor (zero-lag dot, 0.18-lerp ring) on desktop only, native pointer on touch and <1024px; Lenis smooth scroll tuned to a quick 0.9s settle.
- **Cinematic motion** — staggered word-by-word headline reveal, scroll parallax, magnetic buttons, 3D holographic tilt cards, contextual cursor states (`view / open / explore / copy`), film grain, ambient pointer-reactive gradient orbs.
- **Infinite project marquee** — the four featured projects as a single-row horizontal stream with pause-on-hover, prev/next controls and drag-to-scrub.
- **Dark + light theme** with animated toggle (dark is default, set by an inline script in `index.html` to avoid a flash).
- **Live metrics** — GitHub contribution calendar (real API data for `Tirth-22`) plus LeetCode easy/medium/hard rings. A build-time snapshot (`npm run metrics`) is refreshed in the browser from the GitHub REST API, the public contributions API and LeetCode stats mirrors, with a LIVE/CACHED/UNAVAILABLE status pill, last-updated timestamp and manual refresh.
- **Interactive architecture widgets** — auto-typing terminal and an API Gateway topology visualizer with animated packets and hover readouts.
- **Bespoke SVG project visuals** — four hand-built mockups (microservices exchange, CloudWise spend dashboard, stream grouping tree, edge-case matrix), no external image assets.
- **Resume modal** with in-page PDF preview + download.
- Fully responsive (desktop → 390px mobile), `prefers-reduced-motion` respected.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # serve dist/
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run metrics` | Re-fetches GitHub + LeetCode stats into `src/data/metrics.json` |
| `npm run resume` | Regenerates the placeholder `public/resume.pdf` and validates its xref table |
| `npm run shoot` | Visual smoke test — screenshots every section into `shots/` via system Chrome and reports console errors (requires `npm run preview` on port 4173) |
| `node scripts/verify-metrics.mjs` | Live-metrics harness — asserts Linguist colors, percentage math, heatmap tooltips and desktop/tablet/mobile layout (add `REFRESH=1` to exercise the refresh button; requires `npm run preview`) |

## Content you should replace

1. **Experience entries** — edit [`src/data/experience.ts`](src/data/experience.ts). The current timeline contains polished placeholders.
2. **Resume** — drop your real PDF at `public/resume.pdf` (it replaces the generated placeholder; `npm run resume` would overwrite it).
3. **Profile photo** — optionally place a photo at `public/profile.jpg`. If it's missing, the hero card automatically falls back to the real GitHub avatar, then to a `TM` monogram.
4. **Copy & links** — profile text, socials and project details live in `src/data/site.ts` and `src/data/projects.ts`; the tech matrix is in `src/data/stack.ts`.
5. **Live demo URLs** — the four featured projects have no deployed demos yet, so cards show GitHub only. Add a `demo: "https://…"` field to any entry in `src/data/projects.ts` and a *Live Demo* button appears on that card.

## Project structure

```
public/            favicon.svg, resume.pdf, (profile.jpg — yours)
scripts/
  fetch-metrics.mjs   build-time GitHub/LeetCode fetcher
  make-resume.mjs     placeholder PDF generator
  validate-pdf.mjs    PDF xref sanity check
  shoot.mjs           puppeteer screenshot harness
  verify-metrics.mjs  live-metrics assertions (colors, math, tooltips, responsive)
src/
  App.tsx             section composition
  index.css           theme tokens, keyframes, grain/scanline/glass utilities
  components/         Header, Hero, IntroLoader, About, Stack, Projects,
                      Metrics, Experience, Contact, ResumeModal, Cursor, …
  data/               editable content (site, projects, stack, experience, metrics.json)
  lib/                scroll, theme, clock, metrics + live-metrics fetchers,
                      linguist colors, motion, intro state helpers
shots/               generated screenshots (gitignore-able)
```

## Deployment

`npm run build` emits a static site in `dist/` — deploy to Vercel, Netlify, GitHub Pages or any static host. No server-side code required.
