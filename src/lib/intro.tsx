import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setScrollLock } from "./scroll";

const STORAGE_KEY = "tm-intro-seen";

/**
 * "intro"  — loader playing, page content not mounted yet
 * "reveal" — loader is wiping away, hero mounts and staggers in
 * "done"   — loader unmounted, scroll + interaction unlocked
 */
export type Phase = "intro" | "reveal" | "done";

type IntroCtx = {
  phase: Phase;
  /** True once the hero is allowed to mount/animate. */
  ready: boolean;
  /** True once the loader is gone for good. */
  done: boolean;
  reveal: () => void;
  complete: () => void;
  /** Re-trigger the intro sequence (called from footer "Replay Intro"). */
  replay: () => void;
};

const IntroContext = createContext<IntroCtx | null>(null);

export function IntroProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window === "undefined") return "intro";
    return window.matchMedia("(pointer: coarse)").matches ? "done" : "intro";
  });

  const reveal = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode */
    }
    setPhase((p) => (p === "intro" ? "reveal" : p));
  }, []);

  const complete = useCallback(() => {
    setPhase("done");
    setScrollLock(false, "intro");
  }, []);

  const replay = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setScrollLock(true, "intro");
    window.scrollTo({ top: 0, behavior: "instant" });
    setPhase("intro");
  }, []);

  const value = useMemo(
    () => ({
      phase,
      ready: phase !== "intro",
      done: phase === "done",
      reveal,
      complete,
      replay,
    }),
    [phase, reveal, complete, replay],
  );

  return (
    <IntroContext.Provider value={value}>{children}</IntroContext.Provider>
  );
}

export function useIntro(): IntroCtx {
  const ctx = useContext(IntroContext);
  if (!ctx) throw new Error("useIntro must be used within IntroProvider");
  return ctx;
}
