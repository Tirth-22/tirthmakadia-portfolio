/**
 * Fetches real "proof of work" metrics for the portfolio and writes
 * src/data/metrics.json.
 *
 *   npm run metrics
 *
 * Optional: GITHUB_TOKEN in the environment (never committed) raises the
 * GitHub REST rate limit. The token is used only by this script.
 *
 * Sources: GitHub REST API + GitHub contributions HTML, LeetCode GraphQL.
 * Failed sources keep the previous snapshot so the site never fabricates stats.
 */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/data/metrics.json");

const GH_USER = "Tirth-22";
const LC_USER = "Tirth_22";
const GH_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

const LINGUIST = {
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
  SCSS: "#c6538c",
  "Jupyter Notebook": "#DA5B0B",
  Makefile: "#427819",
  CMake: "#DA3434",
  PowerShell: "#012456",
};

const DEFAULTS = {
  generatedAt: null,
  github: {
    username: GH_USER,
    profileUrl: `https://github.com/${GH_USER}`,
    avatarUrl: `https://avatars.githubusercontent.com/u/183889692?v=4`,
    repositories: 0,
    publicRepos: 0,
    commits: 0,
    pullRequests: 0,
    stars: 0,
    followers: 0,
    topLanguages: [],
    languageTotalBytes: 0,
    contributions: [],
    source: "unavailable",
  },
  leetcode: {
    username: LC_USER,
    profileUrl: `https://leetcode.com/u/${LC_USER}`,
    totalSolved: 0,
    ranking: 0,
    reputation: 0,
    contestRating: null,
    easy: { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard: { solved: 0, total: 0 },
    source: "unavailable",
  },
};

const readPrevious = () => {
  try {
    if (existsSync(OUT)) return JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    /* ignore */
  }
  return structuredClone(DEFAULTS);
};

async function get(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": "tirth-makadia-portfolio-metrics",
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(GH_TOKEN && url.includes("api.github.com")
        ? { Authorization: `Bearer ${GH_TOKEN}` }
        : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res;
}

async function fetchAllRepos() {
  const repos = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await (
      await get(
        `https://api.github.com/users/${GH_USER}/repos?per_page=100&page=${page}&type=owner&sort=updated`,
      )
    ).json();
    if (!Array.isArray(batch) || !batch.length) break;
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

async function fetchGithub(data) {
  const user = await (await get(`https://api.github.com/users/${GH_USER}`)).json();
  data.github.publicRepos = user.public_repos ?? data.github.publicRepos;
  data.github.followers = user.followers ?? data.github.followers;
  data.github.avatarUrl = user.avatar_url || data.github.avatarUrl;

  const repos = await fetchAllRepos();
  const owned = repos.filter((r) => !r.fork);
  const activePublic = owned.filter((r) => !r.archived);
  data.github.repositories = activePublic.length;
  data.github.stars = owned.reduce((n, r) => n + (r.stargazers_count || 0), 0);

  const byLang = {};
  const eligible = activePublic.filter((r) => !r.archived);
  for (const r of eligible) {
    try {
      const langs = await (await get(r.languages_url)).json();
      for (const [name, bytes] of Object.entries(langs)) {
        if (typeof bytes === "number" && bytes > 0) {
          byLang[name] = (byLang[name] || 0) + bytes;
        }
      }
    } catch (err) {
      console.warn("! languages", r.full_name, err.message);
    }
  }

  const totalBytes = Object.values(byLang).reduce((n, v) => n + v, 0);
  data.github.languageTotalBytes = totalBytes;
  data.github.topLanguages = Object.entries(byLang)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({
      name,
      bytes,
      color: LINGUIST[name] || "#8b949e",
    }));

  try {
    const search = await (
      await get(
        `https://api.github.com/search/issues?q=author:${GH_USER}+type:pr&per_page=1`,
      )
    ).json();
    if (typeof search.total_count === "number") {
      data.github.pullRequests = search.total_count;
    }
  } catch (err) {
    console.warn("! PR search failed:", err.message);
  }

  data.github.source = "live";
}

async function fetchContributions(data) {
  const res = await fetch(`https://github.com/users/${GH_USER}/contributions`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`contributions ${res.status}`);
  const html = await res.text();

  const daysMap = new Map();
  const idToDate = new Map();
  const tagRe = /<(?:td|th|rect)[^>]*>/gi;
  let tag;
  while ((tag = tagRe.exec(html))) {
    const raw = tag[0];
    const date = /data-date="(\d{4}-\d{2}-\d{2})"/.exec(raw);
    const level = /data-level="(\d+)"/.exec(raw);
    if (!date || !level) continue;
    const iso = date[1];
    daysMap.set(iso, {
      date: iso,
      level: Number(level[1]),
      count: 0,
    });
    const id = /\sid="([^"]+)"/.exec(raw);
    if (id) idToDate.set(id[1], iso);
  }

  if (!daysMap.size) throw new Error("no contribution cells parsed");

  const tipRe =
    /<tool-tip[^>]*(?:for="([^"]+)"[^>]*|id="([^"]+)"[^>]*)>([\s\S]*?)<\/tool-tip>/gi;
  let m;
  while ((m = tipRe.exec(html))) {
    const text = m[3].replace(/<[^>]+>/g, "").trim();
    const n = /^No contributions/i.test(text)
      ? 0
      : Number((/^\d+/.exec(text) || [])[0]);
    if (!Number.isFinite(n)) continue;
    const ref = m[1] || m[2];
    const iso = idToDate.get(ref);
    if (iso && daysMap.has(iso)) daysMap.get(iso).count = n;
  }

  const rangeFor = { 0: 0, 1: 1, 2: 3, 3: 6, 4: 9 };
  const days = [...daysMap.values()].sort((a, b) => a.date.localeCompare(b.date));
  for (const d of days) {
    if (!d.count && d.level === 0) d.count = 0;
    else if (!d.count) d.count = rangeFor[d.level] ?? 0;
  }

  const totalMatch =
    /([\d,]+)\s*<\/span>\s*contributions? in the last year/i.exec(html) ||
    /([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i.exec(html);
  const summed = days.reduce((n, d) => n + d.count, 0);

  data.github.contributions = days;
  data.github.commits = totalMatch
    ? Number(totalMatch[1].replace(/,/g, ""))
    : summed;
  data.github.contributionTotalSource = totalMatch ? "github" : "summed";
}

async function fetchLeetCode(data) {
  const query = `
    query PortfolioStats($username: String!) {
      matchedUser(username: $username) {
        username
        profile { ranking reputation }
        submitStatsGlobal {
          acSubmissionNum { difficulty count submissions }
        }
      }
      allQuestionsCount { difficulty count }
      userContestRanking(username: $username) { rating topPercentage }
    }`;

  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Origin: "https://leetcode.com",
      Referer: `https://leetcode.com/u/${LC_USER}/`,
    },
    body: JSON.stringify({ query, variables: { username: LC_USER } }),
  });
  if (!res.ok) throw new Error(`leetcode ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);

  const user = json.data?.matchedUser;
  if (!user) throw new Error("leetcode user not found");

  const ac = user.submitStatsGlobal?.acSubmissionNum || [];
  const totals = Object.fromEntries(
    (json.data?.allQuestionsCount || []).map((q) => [q.difficulty, q.count]),
  );
  const pick = (d) => {
    const row = ac.find((r) => r.difficulty === d) || { count: 0 };
    return { solved: row.count || 0, total: totals[d] ?? 0 };
  };

  const allRow = ac.find((r) => r.difficulty === "All");
  const total = allRow
    ? allRow.count
    : ["Easy", "Medium", "Hard"].reduce((n, d) => n + pick(d).solved, 0);

  data.leetcode = {
    ...data.leetcode,
    username: user.username || LC_USER,
    totalSolved: total,
    ranking: user.profile?.ranking ?? 0,
    reputation: user.profile?.reputation ?? 0,
    contestRating: json.data?.userContestRanking?.rating ?? null,
    easy: pick("Easy"),
    medium: pick("Medium"),
    hard: pick("Hard"),
    source: "live",
  };
}

async function main() {
  const data = readPrevious();
  if (!data.github.publicRepos) data.github.publicRepos = data.github.repositories || 0;
  if (!Array.isArray(data.github.topLanguages)) data.github.topLanguages = [];
  if (typeof data.github.languageTotalBytes !== "number") {
    data.github.languageTotalBytes = 0;
  }

  let anyOk = false;

  try {
    await fetchGithub(data);
    anyOk = true;
  } catch (e) {
    console.warn("! github:", e.message);
    data.github.source =
      data.github.repositories || data.github.followers ? "cached" : "unavailable";
  }

  try {
    await fetchContributions(data);
    anyOk = true;
  } catch (e) {
    console.warn("! contributions:", e.message);
  }

  try {
    await fetchLeetCode(data);
    anyOk = true;
  } catch (e) {
    console.warn("! leetcode:", e.message);
    data.leetcode.source = data.leetcode.totalSolved ? "cached" : "unavailable";
  }

  if (anyOk) data.generatedAt = new Date().toISOString();

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(data, null, 2) + "\n", "utf8");

  console.log("✓ wrote", OUT);
  console.log(
    `  github: ${data.github.repositories} active public repos · ${data.github.publicRepos} public · ` +
      `${data.github.commits} contribs · ${data.github.pullRequests} PRs · ${data.github.stars} stars · ` +
      `${data.github.contributions.length} days · ${data.github.topLanguages.length} languages (${data.github.languageTotalBytes} bytes)`,
  );
  console.log(
    `  leetcode: ${data.leetcode.totalSolved} solved (E${data.leetcode.easy.solved}/` +
      `M${data.leetcode.medium.solved}/H${data.leetcode.hard.solved}) · ${data.leetcode.source}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
