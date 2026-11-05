/**
 * Verification harness for Section 04 (Live Metrics).
 *   node scripts/verify-metrics.mjs            # render checks only (no API spend)
 *   REFRESH=1 node scripts/verify-metrics.mjs  # also exercises the Refresh button
 *
 * Needs `npx vite preview --port 4173` running.
 */
import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const URL = process.env.SHOT_URL ?? "http://127.0.0.1:4173";
const OUT = "shots";
const DO_REFRESH = process.env.REFRESH === "1";
const CHROME =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

mkdirSync(OUT, { recursive: true });

const OFFICIAL = {
  Java: "#b07219",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#663399",
  Go: "#00ADD8",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Rust: "#dea584",
  Kotlin: "#A97BFF",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Dart: "#00B4AB",
  Vue: "#41b883",
  Dockerfile: "#384d54",
  HCL: "#844FBA",
};

const problems = [];
const errors = [];
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`[console.error] ${m.text()}`);
});
page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));

let roundReqs = [];
page.on("request", (r) => roundReqs.push(`${r.method()} ${r.url()}`));

// Without REFRESH=1, seed a fresh snapshot so the run makes zero API calls
// (the stale-skip path is what a returning visitor sees).
import { readFileSync } from "node:fs";
const bundled = JSON.parse(readFileSync("src/data/metrics.json", "utf8"));
await page.evaluateOnNewDocument((data, doRefresh) => {
  try {
    localStorage.setItem("tm-theme", "dark");
    if (!doRefresh) {
      localStorage.setItem(
        "tm-metrics-live",
        JSON.stringify({ data, storedAt: new Date().toISOString() }),
      );
    }
  } catch {
    /* ignore */
  }
}, bundled, DO_REFRESH);

await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
// intro sequence finishes at ~5.8s — wait it out before touching the page
await new Promise((r) => setTimeout(r, 6500));

await page.evaluate(() => {
  const el = document.getElementById("metrics");
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top - 80), behavior: "instant" });
});
await new Promise((r) => setTimeout(r, 1800));

const read = () =>
  page.evaluate(() => {
    const texts = [...document.querySelectorAll("#metrics span")].map((s) =>
      s.textContent?.trim() ?? "",
    );
    const status =
      texts.find((t) => /^(LIVE|CACHED|UNAVAILABLE|REFRESHING)$/.test(t)) ?? null;
    const updated = texts.find((t) => t.startsWith("Updated ")) ?? null;
    const statValues = [
      ...document.querySelectorAll("#metrics .font-sans.text-\\[26px\\]"),
    ].map((n) => n.textContent?.trim());
    const langRows = [...document.querySelectorAll("#metrics .space-y-4 > div")]
      .map((row) => {
        const spans = [...row.querySelectorAll("span")];
        const bar = row.querySelector("div.h-2 > div");
        if (!bar || spans.length < 2) return null;
        return {
          name: spans[0]?.textContent?.trim(),
          pct: spans[1]?.textContent?.trim(),
          color: getComputedStyle(bar).backgroundColor,
          width: bar.style.width,
        };
      })
      .filter(Boolean);
    const lcPill = texts.find((t) => /^(live data|cached|unavailable)$/.test(t)) ?? null;
    const heatmap = document.querySelectorAll("#metrics rect.cell").length;
    const contrib = texts.find((t) => /contributions in the last year/.test(t)) ?? null;
    const chips = [
      ...document.querySelectorAll("#metrics .inline-flex span.font-semibold"),
    ].map((n) => n.parentElement?.textContent?.trim());
    const ranking = texts.find((t) => /^#\d/.test(t)) ?? null;
    const tsLabel = [...document.querySelectorAll("#metrics span")].find(
      (s) => s.textContent?.trim() === "Total solved",
    );
    const totalSolved = tsLabel?.parentElement?.lastElementChild?.textContent?.trim() ?? null;
    return {
      status,
      updated,
      statValues,
      langRows,
      lcPill,
      heatmap,
      contrib,
      chips,
      ranking,
      totalSolved,
      isLive:
        document.querySelector('#metrics svg[role="img"]')?.classList.contains("is-live") ??
        false,
      langCacheRepos: (() => {
        try {
          return Object.keys(
            JSON.parse(localStorage.getItem("tm-metrics-lang-bytes") ?? "{}"),
          ).length;
        } catch {
          return -1;
        }
      })(),
    };
  });

const before = await read();
console.log("BEFORE:", JSON.stringify({ ...before, langRows: undefined }));

if (DO_REFRESH) {
  const clickRefresh = async (label) => {
    roundReqs = [];
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("#metrics button")].find((b) =>
        /refresh/i.test(b.textContent ?? ""),
      );
      btn?.click();
    });
    let last = null;
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const s = await page.evaluate(
        () =>
          [...document.querySelectorAll("#metrics span")]
            .map((x) => x.textContent?.trim() ?? "")
            .find((t) => /^(LIVE|CACHED|UNAVAILABLE|REFRESHING)$/.test(t)) ?? null,
      );
      if (last === "REFRESHING" && s && s !== "REFRESHING") break;
      last = s;
    }
    const gh = roundReqs.filter((u) => u.includes("https://api.github.com"));
    const opts = gh.filter((u) => u.startsWith("OPTIONS")).length;
    const gets = gh.length - opts;
    const langGets = gh.filter((u) => u.startsWith("GET") && u.includes("/languages")).length;
    const lc = roundReqs.filter((u) => /leetcode|onrender|herokuapp|fly\.dev/.test(u));
    const contrib = roundReqs.filter((u) => u.includes("contributions-api"));
    console.log(
      `${label}: github=${gets} GETs + ${opts} preflights (languages=${langGets}) leetcode=${lc.length} contrib=${contrib.length}`,
    );
  };

  await clickRefresh("refresh #1");
  await clickRefresh("refresh #2");
}

const after = await read();
console.log("AFTER:", JSON.stringify({ ...after, langRows: undefined }));
console.log("LANG ROWS:", JSON.stringify(after.langRows, null, 1));

// --- status / freshness ---
if (!["LIVE", "CACHED", "UNAVAILABLE"].includes(after.status ?? "")) {
  problems.push(`bad status pill: ${after.status}`);
}
if (!after.updated) problems.push("updated timestamp missing");
if (after.heatmap < 300) problems.push(`heatmap cells too few: ${after.heatmap}`);
if (!after.contrib) problems.push("contribution total label missing");
for (const v of after.statValues) {
  if (!v || v === "0") problems.push(`stat card shows ${v}`);
}
if (!after.ranking) problems.push("LeetCode ranking missing");
if (!after.totalSolved) problems.push("LeetCode total solved missing");

// --- language colors + math ---
const toHex = (c) => {
  const m = /rgba?\((\d+), (\d+), (\d+)/.exec(c ?? "");
  if (!m) return null;
  return "#" + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("");
};

after.langRows.forEach((r) => {
  const actual = toHex(r.color);
  const want = OFFICIAL[r.name];
  if (want && actual && want.toLowerCase() !== actual.toLowerCase()) {
    problems.push(`color ${r.name}: rendered ${actual}, official ${want}`);
  }
  if (!r.pct) problems.push(`row ${r.name} missing pct`);
  if (!r.width) problems.push(`row ${r.name} missing bar width`);
  console.log(
    `  lang ${r.name}: pct=${r.pct} width=${r.width} color=${actual} official=${want ?? "(not in required list)"}`,
  );
});

const pctNum = (s) => Number(String(s ?? "").replace("%", "").replace("<1", "0.5"));

// percentage math vs the bundled snapshot byte counts (or live cache if refreshed)
const math = await page.evaluate(() => {
  try {
    const d = JSON.parse(localStorage.getItem("tm-metrics-live"))?.data;
    return d ?? null;
  } catch {
    return null;
  }
}).catch(() => null);
const mathSource = math ?? bundled;
if (mathSource?.github?.topLanguages?.length) {
  const total = mathSource.github.languageTotalBytes;
  const expected = mathSource.github.topLanguages.slice(0, 5).map((l) => ({
    name: l.name,
    expect: Math.round((l.bytes / total) * 100),
  }));
  expected.forEach((m, i) => {
    const row = after.langRows[i];
    if (!row) return problems.push(`missing rendered lang row ${i}`);
    if (row.name !== m.name) problems.push(`row ${i}: ${row.name} != ${m.name}`);
    if (pctNum(row.pct) !== m.expect) {
      problems.push(`pct ${m.name}: shown ${row.pct}, expected ${m.expect}`);
    }
  });
  const shownSum = after.langRows.reduce((n, r) => n + pctNum(r.pct), 0);
  console.log(`top-${after.langRows.length} pct sum = ${shownSum}% (of ${total} bytes)`);
} else {
  problems.push("no language byte data available for math check");
}
if (after.langRows.length > 5) problems.push(`more than5 languages shown: ${after.langRows.length}`);

// --- heatmap tooltip ---
const target = await page.evaluate(() => {
  const rects = [...document.querySelectorAll("#metrics rect.cell")];
  const svg = document.querySelector("#metrics svg");
  const vb = svg ? Number(svg.getAttribute("viewBox")?.split(" ")[2]) : 0;
  const hit = rects.find((r) => {
    const fill = r.style.fill;
    if (fill === "rgb(22, 27, 34)" || fill === "#161b22") return false;
    const b = r.getBoundingClientRect();
    return b.top > 60 && b.bottom < window.innerHeight - 20 && b.left > 0 && b.right < window.innerWidth;
  });
  if (!hit) return { error: "no visible non-empty cell", cells: rects.length, vb };
  const b = hit.getBoundingClientRect();
  const x = Math.round(b.x + b.width / 2);
  const y = Math.round(b.y + b.height / 2);
  const el = document.elementFromPoint(x, y);
  return {
    x,
    y,
    fill: hit.style.fill,
    at: el ? `${el.tagName}.${el.getAttribute("class") ?? ""}` : null,
  };
});
console.log("tooltip target:", JSON.stringify(target));
if (target.error) {
  problems.push(`tooltip target: ${target.error}`);
} else {
  await page.mouse.move(target.x, target.y);
  await new Promise((r) => setTimeout(r, 500));
  const tip = await page.evaluate(() => {
    const t = [...document.querySelectorAll("#metrics div")].find(
      (d) => d.className.includes("pointer-events-none") && /contribution/.test(d.textContent ?? ""),
    );
    return t ? t.textContent.replace(/\s+/g, " ").trim() : null;
  });
  console.log("tooltip:", tip);
  if (!tip) problems.push(`heatmap tooltip did not appear (element at point: ${target.at})`);
  await page.mouse.move(10, 10);
}

// the in-view animation class can lag the scroll by a beat — re-check late
await new Promise((r) => setTimeout(r, 900));
const liveLate = await page.evaluate(
  () =>
    document.querySelector('#metrics svg[role="img"]')?.classList.contains("is-live") ?? false,
);
if (!liveLate) problems.push("heatmap is-live class still missing after settle");
const cellOpacity = await page.evaluate(() => {
  const c = document.querySelector("#metrics rect.cell");
  return c ? getComputedStyle(c).opacity : null;
});
console.log(`is-live late=${liveLate} cell opacity=${cellOpacity}`);
if (cellOpacity !== null && Number(cellOpacity) < 0.9) {
  problems.push(`heatmap cells not fully visible (opacity ${cellOpacity})`);
}

await page.screenshot({ path: `${OUT}/metrics-live.png` });

// --- mobile ---
const mobile = await browser.newPage();
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
mobile.on("pageerror", (e) => errors.push(`[mobile pageerror] ${e.message}`));
await mobile.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 7000)); // wait out the intro
await mobile.evaluate(() => {
  const el = document.getElementById("metrics");
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top - 40), behavior: "instant" });
});
await new Promise((r) => setTimeout(r, 1800));
const m = await mobile.evaluate(() => {
  const scroller = document.querySelector("#metrics .overflow-x-auto");
  return {
    pageScrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    scrollerClientW: scroller?.clientWidth ?? null,
    scrollerScrollW: scroller?.scrollWidth ?? null,
    status: [...document.querySelectorAll("#metrics span")]
      .map((s) => s.textContent?.trim() ?? "")
      .find((t) => /^(LIVE|CACHED|UNAVAILABLE|REFRESHING)$/.test(t)) ?? null,
    btnVisible: (() => {
      const btn = [...document.querySelectorAll("#metrics button")].find((b) =>
        /refresh/i.test(b.textContent ?? ""),
      );
      if (!btn) return false;
      const b = btn.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && b.right <= window.innerWidth + 1;
    })(),
    langPcts: [...document.querySelectorAll("#metrics .space-y-4 > div")].map((row) =>
      [...row.querySelectorAll("span")].map((s) => s.textContent?.trim()).join("/"),
    ),
  };
});
console.log("mobile:", JSON.stringify(m, null, 1));
if (m.pageScrollW > m.innerW + 1) {
  problems.push(`mobile horizontal page overflow: ${m.pageScrollW} > ${m.innerW}`);
}
if (m.scrollerScrollW != null && m.scrollerScrollW <= m.scrollerClientW) {
  problems.push(
    `heatmap not scrollable on mobile: ${m.scrollerScrollW} <= ${m.scrollerClientW}`,
  );
}
if (!m.btnVisible) problems.push("mobile refresh button not fully visible");
if (m.langPcts.length && m.langPcts.some((r) => !/%$/.test(r))) {
  problems.push(`mobile language row missing pct: ${m.langPcts.join(" | ")}`);
}
await mobile.screenshot({ path: `${OUT}/metrics-mobile.png` });

// --- tablet ---
const tablet = await browser.newPage();
await tablet.setViewport({ width: 820, height: 1180, deviceScaleFactor: 1 });
await tablet.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 7000));
await tablet.evaluate(() => {
  const el = document.getElementById("metrics");
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top - 40), behavior: "instant" });
});
await new Promise((r) => setTimeout(r, 1800));
const t = await tablet.evaluate(() => ({
  pageScrollW: document.documentElement.scrollWidth,
  innerW: window.innerWidth,
}));
console.log("tablet:", JSON.stringify(t));
if (t.pageScrollW > t.innerW + 1) {
  problems.push(`tablet horizontal page overflow: ${t.pageScrollW} > ${t.innerW}`);
}
await tablet.screenshot({ path: `${OUT}/metrics-tablet.png` });

await browser.close();
console.log("\n--- console/page errors ---");
console.log(errors.length ? errors.join("\n") : "none");
console.log("\n--- problems ---");
console.log(problems.length ? problems.join("\n") : "none");
process.exitCode = problems.length ? 1 : 0;
