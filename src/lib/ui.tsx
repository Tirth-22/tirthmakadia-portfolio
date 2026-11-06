import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

type Toast = { id: number; title: string; description?: string };

type ToastCtx = { push: (t: Omit<Toast, "id">) => void };

const ToastContext = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] z-[95] flex flex-col items-center gap-3 px-4 sm:inset-x-auto sm:right-6 sm:items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]"
          style={{ animation: "fade-up-in .45s cubic-bezier(.16,1,.3,1) both" }}
        >
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--c-accent-2)] shadow-[0_0_12px_var(--c-accent-2)]" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{t.title}</span>
            {t.description && (
              <span className="mt-0.5 block font-mono text-[11px] text-muted">
                {t.description}
              </span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ------------------------------------------------------------------ */
/* Resume modal                                                        */
/* ------------------------------------------------------------------ */

type ResumeCtx = { open: boolean; setOpen: (v: boolean) => void };

const ResumeContext = createContext<ResumeCtx | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used within ResumeProvider");
  return ctx;
}
