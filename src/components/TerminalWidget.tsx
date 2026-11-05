import { useEffect, useState } from "react";
import { SquareTerminal } from "lucide-react";

type Line = { text: string; tone?: "ok" | "dim" | "accent" };
type Scene = { cmd: string; out: Line[] };

const SCENES: Scene[] = [
  {
    cmd: "kubectl get pods -n production",
    out: [
      { text: "NAME                READY   STATUS    RESTARTS", tone: "dim" },
      { text: "api-gateway-7d9f    2/2     Running   0", tone: "ok" },
      { text: "auth-service-5b8c   2/2     Running   0", tone: "ok" },
      { text: "order-service-1f6a  2/2     Running   1", tone: "ok" },
    ],
  },
  {
    cmd: "curl -X POST api.tirth.dev/v1/orders -H 'auth: ***'",
    out: [
      { text: "HTTP/1.1 201 Created · 47ms", tone: "ok" },
      { text: '{ "id": "ord_8812", "state": "CONFIRMED" }', tone: "accent" },
      { text: "gateway → order-service → kafka → ledger", tone: "dim" },
    ],
  },
  {
    cmd: "./deploy.sh --env prod --strategy blue-green",
    out: [
      { text: "✓ image built (cache hit) · 3/3 services healthy", tone: "ok" },
      { text: "✓ migrations applied · rollback armed", tone: "ok" },
      { text: "→ traffic shifted in 12.4s", tone: "accent" },
    ],
  },
];

const toneClass: Record<string, string> = {
  ok: "text-[var(--c-accent-2)]",
  dim: "text-faint",
  accent: "text-[var(--c-accent)]",
};

/** Auto-cycling terminal with a character-by-character typing effect. */
export default function TerminalWidget() {
  const [scene, setScene] = useState(0);
  const [typed, setTyped] = useState("");
  const [lines, setLines] = useState(0);

  const current = SCENES[scene % SCENES.length];

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(current.cmd);
      setLines(current.out.length);
      return;
    }

    let alive = true;
    const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

    const run = async () => {
      while (alive) {
        setTyped("");
        setLines(0);
        await sleep(520);
        for (let i = 1; i <= current.cmd.length; i++) {
          if (!alive) return;
          setTyped(current.cmd.slice(0, i));
          await sleep(26);
        }
        await sleep(420);
        for (let i = 1; i <= current.out.length; i++) {
          if (!alive) return;
          setLines(i);
          await sleep(190);
        }
        await sleep(2800);
        if (!alive) return;
        setScene((s) => s + 1);
        break;
      }
    };

    void run();
    return () => {
      alive = false;
    };
  }, [scene, current]);

  return (
    <div className="panel group flex h-full flex-col overflow-hidden rounded-2xl">
      {/* title bar */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono text-[10.5px] text-faint">
            tirth@prod — zsh
          </span>
        </div>
        <SquareTerminal className="size-3.5 text-faint transition-colors duration-300 group-hover:text-[var(--c-accent)]" />
      </div>

      {/* body */}
      <div className="code-block min-h-[186px] flex-1 px-4 py-4">
        <div className="flex gap-2">
          <span className="shrink-0 text-[var(--c-accent-2)]">➜</span>
          <span className="shrink-0 text-[var(--c-accent)]">~</span>
          <span className="min-w-0 break-all text-[var(--c-ink)]">
            {typed}
            <span
              className="ml-0.5 inline-block h-3.5 w-[6px] translate-y-[2px] bg-[var(--c-accent)]"
              style={{ animation: "caret-blink 1.05s steps(1) infinite" }}
            />
          </span>
        </div>

        <div className="mt-2.5 space-y-1.5">
          {current.out.slice(0, lines).map((l, i) => (
            <div
              key={`${scene}-${i}`}
              className={`whitespace-pre ${toneClass[l.tone ?? ""] ?? "text-muted"}`}
              style={{
                animation: "fade-up-in .4s cubic-bezier(.16,1,.3,1) both",
              }}
            >
              {l.text}
            </div>
          ))}
        </div>
      </div>

      {/* footer */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line px-4 py-3 font-mono text-[9.5px] tracking-[0.12em] text-faint uppercase">
        <span>region ap-south-1</span>
        <span>replicas 3</span>
        <span className="text-[var(--c-accent-2)]">p99 47ms</span>
        <span className="ml-auto">uptime 99.98%</span>
      </div>
    </div>
  );
}
