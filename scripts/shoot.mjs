/**
 * Visual smoke test — launches system Chrome, screenshots each section and
 * reports console errors.
 *
 *   npx vite preview --port 4173 &
 *   node scripts/shoot.mjs
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const URL = process.env.SHOT_URL ?? "http://127.0.0.1:4173";
const OUT = "shots";
const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

mkdirSync(OUT, { recursive: true });

const errors = [];
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem("tm-theme", "dark");
  } catch {
    /* ignore */
  }
});

page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") {
    errors.push(`[console.${m.type()}] ${m.text()}`);
  }
});
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) =>
  errors.push(`[requestfailed] ${r.url()} — ${r.failure()?.errorText}`),
);

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });

// --- cinematic intro captures (boot lines → monogram flare) ---
await new Promise((r) => setTimeout(r, 550));
await page.screenshot({ path: `${OUT}/intro-boot.png` });
await new Promise((r) => setTimeout(r, 850));
await page.screenshot({ path: `${OUT}/intro-monogram.png` });

// intro finishes at ~2.05s — wait for the hero to mount + settle
await new Promise((r) => setTimeout(r, 2400));
const introState = await page.evaluate(() => ({
  seen: sessionStorage.getItem("tm-intro-seen"),
  locked: document.documentElement.classList.contains("tm-intro"),
  heroMounted: Boolean(document.querySelector("#top h1")),
}));
console.log(
  `intro: seen=${introState.seen} locked=${introState.locked} hero=${introState.heroMounted}`,
);

const sections = [
  "top",
  "about",
  "architecture",
  "widgets",
  "projects",
  "metrics",
  "experience",
  "contact",
];

for (const id of sections) {
  await page.evaluate((sid) => {
    const el =
      sid === "widgets"
        ? document.getElementById("widgets")
        : document.getElementById(sid);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - 90), behavior: "instant" });
  }, id);
  await new Promise((r) => setTimeout(r, 1600));
  const state = await page.evaluate(() => ({
    y: Math.round(window.scrollY),
    theme: document.documentElement.className,
  }));
  await page.screenshot({ path: `${OUT}/${id}.png` });
  console.log(`✓ ${id} (scrollY=${state.y}, ${state.theme})`);
}

// full page (dark)
await page.screenshot({ path: `${OUT}/full-dark.png`, fullPage: true });

// --- project carousel: verify auto-advance + prev/next controls ---
await page.evaluate(() => {
  const el = document.getElementById("projects");
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top - 60), behavior: "instant" });
});
await new Promise((r) => setTimeout(r, 900));

const slideIdx = () =>
  page.evaluate(() => {
    const c = document.querySelector('#projects p[aria-live="polite"]');
    return c ? c.textContent.replace(/\s+/g, " ").trim() : null;
  });

const i1 = await slideIdx();
await new Promise((r) => setTimeout(r, 6500)); // > AUTOPLAY_MS (5500)
const i2 = await slideIdx();
console.log(`carousel auto-advance: ${i1} → ${i2}`);

await page.evaluate(() => {
  document.querySelector('button[aria-label="Next project"]')?.click();
});
await new Promise((r) => setTimeout(r, 900));
const i3 = await slideIdx();
console.log(`carousel next step:    ${i2} → ${i3}`);
await page.screenshot({ path: `${OUT}/projects-next.png` });

// light theme
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await new Promise((r) => setTimeout(r, 900));
await page.evaluate(() => {
  const btn = document.querySelector('button[aria-label*="Switch to light"]');
  btn?.click();
});
await new Promise((r) => setTimeout(r, 1600));
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await new Promise((r) => setTimeout(r, 700));
await page.screenshot({ path: `${OUT}/hero-light.png` });
await page.evaluate(() => {
  const el = document.getElementById("metrics");
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top - 60), behavior: "instant" });
});
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: `${OUT}/metrics-light.png` });

// resume modal — opened from the Experience section (Hero/Header links now
// open the PDF directly in a new tab instead of a modal).
await page.evaluate(() => {
  const el = document.getElementById("experience");
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top - 60), behavior: "instant" });
});
await new Promise((r) => setTimeout(r, 1000));
await page.evaluate(() => {
  const btns = [...document.querySelectorAll("button")];
  btns.find((b) => /open full resume/i.test(b.textContent || ""))?.click();
});
await new Promise((r) => setTimeout(r, 1600));
await page.screenshot({ path: `${OUT}/resume-modal.png` });

// mobile (its own tab → sessionStorage intro replays, so wait for the hero
// instead of a fixed sleep that races the loader)
const mobile = await browser.newPage();
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
await mobile.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await mobile
  .waitForSelector("#top h1", { timeout: 20000, visible: true })
  .catch(() => {});
await new Promise((r) => setTimeout(r, 1800)); // stagger settle
await mobile.screenshot({ path: `${OUT}/mobile-hero.png` });
await mobile.evaluate(() => {
  const el = document.getElementById("projects");
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top - 40), behavior: "instant" });
});
await new Promise((r) => setTimeout(r, 1500));
await mobile.screenshot({ path: `${OUT}/mobile-projects.png` });

await browser.close();

console.log("\n--- issues ---");
console.log(errors.length ? errors.join("\n") : "none");
