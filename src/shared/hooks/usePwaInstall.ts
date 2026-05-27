import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallState = "idle" | "accepted" | "dismissed" | "installed";

export function usePwaInstall(): {
  canInstall: boolean;
  installState: InstallState;
  promptInstall: () => Promise<void>;
} {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>(() => {
    try {
      return localStorage.getItem("pwa_installed") === "true" ? "installed" : "idle";
    } catch {
      return "idle";
    }
  });

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event): void => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = (): void => {
      setInstallState("installed");
      setDeferredPrompt(null);
      try {
        localStorage.setItem("pwa_installed", "true");
      } catch (e) {
        console.error("Failed to save PWA install state:", e);
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canInstall = useMemo(() => deferredPrompt !== null, [deferredPrompt]);

  async function promptInstall(): Promise<void> {
    if (!deferredPrompt) {
      return;
    }
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setInstallState(choice.outcome === "accepted" ? "installed" : choice.outcome);
    if (choice.outcome === "accepted") {
      try {
        localStorage.setItem("pwa_installed", "true");
      } catch (e) {
        console.error("Failed to save PWA install state:", e);
      }
    }
    setDeferredPrompt(null);
  }

  return { canInstall, installState, promptInstall };
}
