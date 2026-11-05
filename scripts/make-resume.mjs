/**
 * Generates a valid one-page placeholder PDF at public/resume.pdf.
 * Replace the file with your real resume whenever you like — the site
 * links to /resume.pdf everywhere.
 *
 *   node scripts/make-resume.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/resume.pdf");

const W = 595.28; // A4
const H = 841.89;

const esc = (s) =>
  s
    .replace(/[^\x20-\x7E]/g, (ch) => {
      const map = { "—": "-", "–": "-", "’": "'", "“": '"', "”": '"', "•": "-", "·": "-" };
      return map[ch] ?? "-";
    })
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const ops = [];
let y = H - 58;

const text = (str, { font = "F1", size = 10, x = 56, color = [0.1, 0.11, 0.13], gap = 0, lead = 0 } = {}) => {
  if (lead) y -= lead;
  ops.push(
    `BT /${font} ${size} Tf ${color.join(" ")} rg 1 0 0 1 ${x} ${y.toFixed(2)} Tm (${esc(str)}) Tj ET`,
  );
  y -= gap;
};

const rule = (color = [0.85, 0.86, 0.88], gap = 14) => {
  y -= gap;
  ops.push(
    `${color.join(" ")} RG 0.8 w 56 ${y.toFixed(2)} m ${W - 56} ${y.toFixed(2)} l S`,
  );
  y -= 6;
};

const section = (title) => {
  y -= 18;
  text(title.toUpperCase(), { font: "F2", size: 10.5, color: [0.04, 0.5, 0.55] });
  rule([0.85, 0.86, 0.88], 11);
};

const bullet = (str) => {
  y -= 12;
  ops.push(
    `BT /F1 9.6 Tf 0.35 0.37 0.42 rg 1 0 0 1 62 ${y.toFixed(2)} Tm (\\225) Tj ET`,
  );
  const words = str.split(" ");
  let line = "";
  const flush = () => {
    if (!line) return;
    ops.push(
      `BT /F1 9.6 Tf 0.24 0.26 0.3 rg 1 0 0 1 72 ${y.toFixed(2)} Tm (${esc(line)}) Tj ET`,
    );
    y -= 12.4;
    line = "";
  };
  for (const w of words) {
    if ((line + " " + w).length > 90) flush();
    line = line ? line + " " + w : w;
  }
  flush();
};

/* ---------------------------------------------------------------- content */

text("Tirth Makadia", {
  font: "F2",
  size: 25,
  color: [0.04, 0.05, 0.07],
  gap: 31,
});
text("Java Backend & Cloud DevOps Engineer", {
  font: "F1",
  size: 12,
  color: [0.04, 0.5, 0.55],
  gap: 15,
});
text(
  "Rajkot, India  |  tirthmakadia2006@gmail.com  |  github.com/Tirth-22  |  linkedin.com/in/tirth-makadia-769b0931b",
  { font: "F1", size: 8.8, color: [0.42, 0.44, 0.5], gap: 7 },
);
rule([0.04, 0.5, 0.55], 6);

section("Summary");
text(
  "Backend engineer building resilient distributed systems: high-throughput Java microservices,",
  { size: 9.8, gap: 13 },
);
text(
  "event-driven architectures and cloud-native AWS platforms - containerized, observable and automated",
  { size: 9.8, gap: 13 },
);
text("end to end with CI/CD pipelines and infrastructure as code.", { size: 9.8 });

section("Experience");
text("Java Backend & Cloud DevOps Engineer  —  Independent / Freelance", {
  font: "F2",
  size: 10.4,
  gap: 13,
});
text("2025 - Present  |  Remote, Rajkot IN", {
  size: 8.8,
  color: [0.45, 0.47, 0.53],
  gap: 13,
});
bullet("Designed a multi-service Spring Boot platform routed through a Spring Cloud API Gateway with stateless JWT authentication and independent data ownership per service.");
bullet("Containerized services with Docker and deployed multi-tier AWS infrastructure (S3 static frontend, EC2 application tier, RDS PostgreSQL) behind CloudWatch observability.");
bullet("Automated CI/CD with GitHub Actions: lint, test, image build and environment-gated deployment stages.");

text("B.Tech, Computer Science & Engineering  —  University", {
  font: "F2",
  size: 10.4,
  lead: 8,
  gap: 13,
});
text("2023 - Present  |  India", {
  size: 8.8,
  color: [0.45, 0.47, 0.53],
  gap: 13,
});
bullet("Coursework across Data Structures & Algorithms, DBMS, Operating Systems and Computer Networks.");
bullet("Consistent problem solving on LeetCode focused on backend-relevant patterns (122+ problems solved).");

section("Featured Projects");
text("Neighborhood Microservices Exchange Platform", { font: "F2", size: 10, gap: 13 });
bullet("Distributed platform: API Gateway routing, JWT security, Dockerized services, PostgreSQL and React client.");
text("Doctor Appointment Management System", { font: "F2", size: 10, lead: 6, gap: 13 });
bullet("Cloud-native scheduler with RBAC and AWS multi-tier deployment (S3 + EC2 + RDS).");
text("Java StreamAPI Hierarchical Grouping Utility", { font: "F2", size: 10, lead: 6, gap: 13 });
bullet("Single-pass multi-level grouping pipelines with bounded memory complexity.");
text("Automated Football Formation Generator", { font: "F2", size: 10, lead: 6, gap: 13 });
bullet("Heuristic decision engine scoring tactical formations from squad dynamics and constraints.");

section("Skills");
text("Java 17/21 · Spring Boot · Spring Cloud · Hibernate/JPA · REST · JWT · Stream API", {
  size: 9.4,
  gap: 13,
});
text("PostgreSQL · MySQL · Redis · Apache Kafka · RabbitMQ · AWS (EC2 · S3 · RDS · ECS · CloudWatch)", {
  size: 9.4,
  gap: 13,
});
text("Docker · Kubernetes · Terraform · GitHub Actions · Jenkins · Linux · Nginx · Git · React", {
  size: 9.4,
  gap: 13,
});

if (y < 58) {
  console.warn(`! content ends at y=${y.toFixed(0)} — may collide with footer`);
}

y = Math.max(y - 14, 42);
text(
  "NOTE: placeholder document generated for the portfolio - replace public/resume.pdf with your real resume.",
  { size: 7.6, color: [0.55, 0.57, 0.62] },
);

const stream = ops.join("\n");

/* ---------------------------------------------------------------- build */

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W.toFixed(2)} ${H.toFixed(2)}] ` +
    "/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
];

let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
const offsets = [0];

objects.forEach((body, i) => {
  offsets.push(Buffer.byteLength(pdf, "latin1"));
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefPos = Buffer.byteLength(pdf, "latin1");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (let i = 1; i <= objects.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, Buffer.from(pdf, "latin1"));
console.log(`✓ wrote ${OUT} (${Buffer.byteLength(pdf, "latin1")} bytes)`);
