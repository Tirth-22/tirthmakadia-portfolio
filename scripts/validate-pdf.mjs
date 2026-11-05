import { readFileSync } from "node:fs";

const buf = readFileSync("public/resume.pdf");
const s = buf.toString("latin1");

const start = s.lastIndexOf("startxref");
const xrefPos = Number(s.slice(start + 9).trim().split(/\s+/)[0]);

if (s.slice(xrefPos, xrefPos + 4) !== "xref") {
  console.error("BAD startxref:", xrefPos, JSON.stringify(s.slice(xrefPos, xrefPos + 10)));
  process.exit(1);
}

const lines = s.slice(xrefPos).split("\n");
const count = Number(lines[1].split(" ")[1]);
let ok = true;

for (let i = 1; i < count; i++) {
  const entry = lines[2 + i];
  const off = Number(entry.slice(0, 10));
  const expect = `${i} 0 obj`;
  const actual = s.slice(off, off + expect.length);
  if (actual !== expect) {
    ok = false;
    console.error(`obj ${i}: offset ${off} → ${JSON.stringify(actual)}`);
  }
}

console.log(ok ? `✓ xref valid — ${count - 1} objects` : "✗ xref invalid");
console.log("pages:", /\/Count 1/.test(s) ? 1 : "?", "| stream:", /\/Length \d+/.test(s) ? "ok" : "missing");
