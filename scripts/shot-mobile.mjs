/** Mobile horizontal-scroll readability check (390×844). */
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await page.evaluateOnNewDocument(() => {
  try {
    localStorage.setItem("tm-theme", "dark");
    sessionStorage.setItem("tm-intro-seen", "1");
  } catch {}
});
await page.goto("http://127.0.0.1:4173", { waitUntil: "domcontentloaded" });
await new Promise((r) => setTimeout(r, 6500));
await page.evaluate(() => {
  const el = document.querySelector("svg[aria-label*='topology']");
  const card = el?.closest("div")?.parentElement?.parentElement?.parentElement;
  if (card)
    window.scrollTo({
      top: card.getBoundingClientRect().top + scrollY - 20,
      behavior: "instant",
    });
});
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: "shots/hz-mobile.png" });

const m = await page.evaluate(() => {
  const s = document.querySelector("svg[aria-label*='topology']");
  const sc = s.closest("div").parentElement;
  return {
    rendered: Math.round(s.getBoundingClientRect().width),
    scrollW: sc.scrollWidth,
    clientW: sc.clientWidth,
    hint: document.body.innerText.toLowerCase().includes("drag / scroll"),
  };
});
console.log(JSON.stringify(m));

// scroll to the runtime stage and shoot again
await page.evaluate(() => {
  const sc = document
    .querySelector("svg[aria-label*='topology']")
    .closest("div").parentElement;
  sc.scrollLeft = 1750;
});
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: "shots/hz-mobile-runtime.png" });

await browser.close();
