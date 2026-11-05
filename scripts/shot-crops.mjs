/** Viewport close-ups: scroll the topology card to key stages and shoot. */
import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
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
      top: card.getBoundingClientRect().top + window.scrollY - 40,
      behavior: "instant",
    });
});
await new Promise((r) => setTimeout(r, 400));

const shots = [
  { name: "hz-view-aws.png", left: 950 },
  { name: "hz-view-runtime.png", left: 1650 },
  { name: "hz-view-data.png", left: 1980 },
  { name: "hz-view-prod.png", left: 2026 },
];
for (const s of shots) {
  await page.evaluate((left) => {
    const sc = document
      .querySelector("svg[aria-label*='topology']")
      .closest("div").parentElement;
    sc.scrollLeft = left;
  }, s.left);
  await new Promise((r) => setTimeout(r, 350));
  const cardBox = await page.evaluate(() => {
    const el = document.querySelector("svg[aria-label*='topology']");
    const card = el.closest("div").parentElement.parentElement.parentElement;
    const r = card.getBoundingClientRect();
    return {
      x: r.x + window.scrollX,
      y: r.y + window.scrollY,
      width: r.width,
      height: r.height,
    };
  });
  await page.screenshot({
    path: `shots/${s.name}`,
    clip: {
      x: Math.max(0, cardBox.x),
      y: Math.max(0, cardBox.y),
      width: Math.min(cardBox.width, 1440),
      height: Math.min(cardBox.height, 860),
    },
  });
}
console.log("done");
await browser.close();
