/** Horizontal topology visual pass: full canvas + desktop viewport shots. */
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
    sessionStorage.setItem("tm-intro-seen", "1");
  } catch {}
});
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`[console] ${m.text()}`);
});
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6500));
await page.evaluate(() => {
  const el = document.querySelector("svg[aria-label*='topology']")?.closest("div")?.parentElement?.parentElement?.parentElement;
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - 40), behavior: "instant" });
  }
});
await new Promise((r) => setTimeout(r, 600));

// what a desktop user first sees
await page.screenshot({ path: `${OUT}/hz-viewport.png` });

// full-canvas capture on an ultra-wide viewport (no horizontal clipping)
const wide = await browser.newPage();
await wide.setViewport({ width: 3460, height: 1040, deviceScaleFactor: 1 });
await wide.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem("tm-theme", "dark");
    sessionStorage.setItem("tm-intro-seen", "1");
  } catch {}
});
await wide.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6500));
await wide.evaluate(() => {
  const el = document.getElementById("architecture");
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - 40), behavior: "instant" });
  }
});
await new Promise((r) => setTimeout(r, 600));
const svg = await wide.$("svg[aria-label*='topology']");
if (svg) {
  // unwrap the horizontal scroller so the full canvas paints for inspection
  await wide.evaluate(() => {
    const s = document.querySelector("svg[aria-label*='topology']");
    // unwrap every overflow-clipping ancestor so the full canvas paints
    let el = s?.closest("div");
    for (let i = 0; el && i < 6; i += 1) {
      el.style.overflow = "visible";
      el = el.parentElement;
    }
    document.body.style.overflow = "visible";
    document.documentElement.style.overflow = "visible";
    // hide the scroll affordance overlay for a clean capture
    [...document.querySelectorAll("span")]
      .filter((sp) => sp.textContent.toLowerCase().includes("drag / scroll"))
      .forEach((sp) => (sp.closest("div[class*='absolute']")?.style.setProperty("display", "none")));
  });
  await new Promise((r) => setTimeout(r, 300));
  await svg.screenshot({ path: `${OUT}/hz-canvas.png` });
} else console.log("svg not found");

const m = await wide.evaluate(() => {
  const s = document.querySelector("svg[aria-label*='topology']");
  const sc = s?.closest("div")?.parentElement;
  return s
    ? {
        viewBox: s.getAttribute("viewBox"),
        rendered: Math.round(s.getBoundingClientRect().width),
        scrollerScrollW: sc ? sc.scrollWidth : 0,
        scrollerClientW: sc ? sc.clientWidth : 0,
      }
    : null;
});
console.log(JSON.stringify(m));

await browser.close();
console.log("--- issues ---");
console.log(errors.length ? errors.join("\n") : "none");
