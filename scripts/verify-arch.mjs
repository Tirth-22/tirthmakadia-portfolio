/** Interaction tests for the horizontal topology (ArchitectureViz). */
import puppeteer from "puppeteer-core";

const URL = process.env.SHOT_URL ?? "http://127.0.0.1:4173";
const CHROME =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const results = [];
const ok = (name, pass, detail = "") =>
  results.push(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);

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
await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
await new Promise((r) => setTimeout(r, 6500));

// scroll the topology card into view
await page.evaluate(() => {
  const el = document.querySelector("svg[aria-label*='topology']");
  const card = el?.closest("div")?.parentElement?.parentElement?.parentElement;
  if (card) {
    window.scrollTo({
      top: card.getBoundingClientRect().top + window.scrollY - 40,
      behavior: "instant",
    });
  }
});
await new Promise((r) => setTimeout(r, 400));

const q = (sel) => page.$(sel);
const nodeSel = (id) => `svg[aria-label*='topology'] g[role='button'][aria-label^='${id}']`;

/* ---- 1. structure: five stage headers, node counts ---- */
const structure = await page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label*='topology']");
  const nodes = [...svg.querySelectorAll("g[role='button']")];
  const titles = nodes.map((n) => n.getAttribute("aria-label").split(" — ")[0]);
  const scroller = svg.closest("div").parentElement;
  return {
    nodeCount: nodes.length,
    titles,
    overflowX: getComputedStyle(scroller).overflowX,
    canvasW: svg.getAttribute("viewBox"),
  };
});
ok("20 nodes rendered", structure.nodeCount === 20, `got ${structure.nodeCount}`);
const required = [
  "GitHub Repository",
  "GitHub Actions",
  "Build & Test",
  "Docker Image",
  "Deployment Artifact",
  "EC2 Instance",
  "Nginx Proxy",
  "Docker Compose",
  "API Gateway",
  "Auth Service",
  "User Service",
  "Request Service",
  "Provider Service",
  "Notification Service",
  "Redis",
  "PostgreSQL",
  "Apache Kafka",
  "Public HTTPS Endpoint",
  "Application Online",
  "Monitoring / Logs",
];
const missing = required.filter((t) => !structure.titles.includes(t));
ok("all required nodes present", missing.length === 0, missing.join(", ") || "none missing");
ok("horizontally scrollable", structure.overflowX === "auto", structure.overflowX);

/* ---- 2. horizontal geometry: every node's y within canvas, stages left→right ---- */
const order = await page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label*='topology']");
  const pick = (label) => {
    const g = [...svg.querySelectorAll("g[role='button']")].find((n) =>
      n.getAttribute("aria-label").startsWith(label),
    );
    const r = g.getBoundingClientRect();
    const sr = svg.getBoundingClientRect();
    return { x: r.left - sr.left, y: r.top - sr.top };
  };
  return {
    repo: pick("GitHub Repository"),
    actions: pick("GitHub Actions"),
    ec2: pick("EC2 Instance"),
    gateway: pick("API Gateway"),
    endpoint: pick("Public HTTPS Endpoint"),
    monitor: pick("Monitoring / Logs"),
  };
});
ok(
  "left→right stage order",
  order.repo.x < order.actions.x && order.actions.x < order.ec2.x &&
    order.ec2.x < order.gateway.x && order.gateway.x < order.endpoint.x &&
    order.endpoint.x < order.monitor.x,
  JSON.stringify(Object.fromEntries(Object.entries(order).map(([k, v]) => [k, Math.round(v.x)]))),
);
ok(
  "single row (no vertical stacking of stages)",
  Math.abs(order.repo.y - order.actions.y) < 4 &&
    Math.abs(order.actions.y - order.ec2.y) < 4 &&
    Math.abs(order.ec2.y - order.gateway.y) < 4 &&
    Math.abs(order.gateway.y - order.endpoint.y) < 4,
  `y: ${Math.round(order.repo.y)}/${Math.round(order.actions.y)}/${Math.round(order.ec2.y)}/${Math.round(order.gateway.y)}/${Math.round(order.endpoint.y)}`,
);

/* ---- 3. hover tooltip ---- */
const gw = await q(nodeSel("API Gateway"));
await gw.hover();
await new Promise((r) => setTimeout(r, 500));
const tip = await page.evaluate(() => {
  const t = document.querySelector('[role="tooltip"]');
  return t ? t.innerText.replace(/\s+/g, " ").trim() : null;
});
ok("hover tooltip appears", Boolean(tip), tip ? tip.slice(0, 90) : "no tooltip");
const dimmed = await page.evaluate(() => {
  const svg = document.querySelector("svg[aria-label*='topology']");
  const nodes = [...svg.querySelectorAll("g[role='button']")];
  return nodes.filter((n) => parseFloat(getComputedStyle(n).opacity) < 0.5).length;
});
ok("hover dims unrelated nodes", dimmed > 0, `${dimmed} dimmed`);
await page.mouse.move(10, 10);
await new Promise((r) => setTimeout(r, 400));

/* ---- 4. Trace Request ---- */
await page.evaluate(() => {
  [...document.querySelectorAll("button")].find((x) =>
    x.textContent.includes("Trace Request"),
  )?.click();
});
await new Promise((r) => setTimeout(r, 1200));
const traceState = await page.evaluate(() => {
  const readout = [...document.querySelectorAll("p")]
    .map((p) => p.innerText.replace(/\s+/g, " "))
    .find((t) => t.includes("tracing") || t.includes("//")) ?? "";
  const lit = [...document.querySelectorAll("svg[aria-label*='topology'] g[role='button']")].filter(
    (n) => parseFloat(getComputedStyle(n).opacity) > 0.9,
  ).length;
  const status = [...document.querySelectorAll("span")]
    .map((s) => s.textContent)
    .find((t) => t.includes("request path live"));
  return { readout: readout.slice(0, 140), lit, live: Boolean(status) };
});
ok("trace runs (status live)", traceState.live, traceState.readout);
ok("trace lights path nodes only", traceState.lit > 0 && traceState.lit < 20, `${traceState.lit} lit of 20`);

// tooltip suppressed during trace
const tipDuring = await page.evaluate(() => Boolean(document.querySelector('[role="tooltip"]')));
ok("tooltip suppressed during trace", !tipDuring);

// stop the trace via the same button (now reads "Stop")
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) => x.textContent.includes("Stop"));
  b?.click();
});
await new Promise((r) => setTimeout(r, 500));

/* ---- 5. Run Deployment ---- */
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) =>
    x.textContent.includes("Run Deployment"),
  );
  b?.click();
});
await new Promise((r) => setTimeout(r, 1500));
const dep = await page.evaluate(() => {
  const status = [...document.querySelectorAll("span")]
    .map((s) => s.textContent)
    .find((t) => t.includes("delivery pipeline live"));
  const readout = document.querySelector("p")?.innerText.replace(/\s+/g, " ").slice(0, 140);
  return { live: Boolean(status), readout };
});
ok("deployment trace runs", dep.live, dep.readout);
// let it progress and check auto-scroll followed the node
const scrolled = await page.evaluate(() => {
  const sc = document
    .querySelector("svg[aria-label*='topology']")
    .closest("div").parentElement;
  return sc.scrollLeft;
});
ok("auto-scroll follows the trace", scrolled > 100, `scrollLeft=${Math.round(scrolled)}`);

/* ---- 6. Reset View ---- */
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find((x) =>
    x.textContent.includes("Reset View"),
  );
  b?.click();
});
await new Promise((r) => setTimeout(r, 900));
const afterReset = await page.evaluate(() => {
  const sc = document
    .querySelector("svg[aria-label*='topology']")
    .closest("div").parentElement;
  const nodes = [...document.querySelectorAll("svg[aria-label*='topology'] g[role='button']")];
  const allFull = nodes.every((n) => parseFloat(getComputedStyle(n).opacity) > 0.9);
  const idle = [...document.querySelectorAll("span")]
    .map((s) => s.textContent)
    .some((t) => t.trim() === "○ idle");
  const hint = document.body.innerText.toLowerCase().includes("drag / scroll");
  return { scrollLeft: sc.scrollLeft, allFull, idle, hint };
});
ok("reset restores scroll to start", afterReset.scrollLeft < 5, `scrollLeft=${afterReset.scrollLeft}`);
ok("reset un-dims all nodes", afterReset.allFull);
ok("reset returns status to idle", afterReset.idle);
ok("scroll hint returns after reset", afterReset.hint);

await browser.close();
console.log(results.join("\n"));
console.log(results.some((r) => r.startsWith("FAIL")) ? "\nRESULT: FAILURES" : "\nRESULT: ALL PASS");
