import type React from "react";

type PwaDiagnosticsProps = {
  isOnline: boolean;
  canInstall: boolean;
  isUpdateAvailable: boolean;
  installState: "idle" | "accepted" | "dismissed" | "installed";
};

function getDisplayMode(): string {
  if (typeof window === "undefined") {
    return "unknown";
  }
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return "standalone";
  }
  return "browser";
}

export function PwaDiagnostics({ canInstall, installState, isOnline, isUpdateAvailable }: PwaDiagnosticsProps): React.JSX.Element {
  const displayMode = getDisplayMode();
  const swSupported = typeof navigator !== "undefined" && "serviceWorker" in navigator;

  return (
    <section className="space-y-2 rounded-md border border-border bg-panel p-4">
      <h2 className="font-mono text-sm uppercase tracking-wide text-muted">PWA diagnostics</h2>
      <ul className="space-y-1 text-sm">
        <li>
          Online: <span className={isOnline ? "text-accent" : "text-amber-300"}>{isOnline ? "yes" : "no"}</span>
        </li>
        <li>
          Display mode: <span className="text-muted">{displayMode}</span>
        </li>
        <li>
          Install prompt available: <span className="text-muted">{canInstall ? "yes" : "no"}</span>
        </li>
        <li>
          Install state: <span className="text-muted">{installState}</span>
        </li>
        <li>
          Service Worker supported: <span className="text-muted">{swSupported ? "yes" : "no"}</span>
        </li>
        <li>
          App update waiting: <span className={isUpdateAvailable ? "text-accent" : "text-muted"}>{isUpdateAvailable ? "yes" : "no"}</span>
        </li>
      </ul>
    </section>
  );
}
