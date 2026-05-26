import { useCallback, useEffect, useRef, useState } from "react";

export function usePwaUpdate(): {
  isUpdateAvailable: boolean;
  applyUpdate: () => void;
} {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    function markIfWaiting(registration: ServiceWorkerRegistration): void {
      if (registration.waiting) {
        waitingWorkerRef.current = registration.waiting;
        setIsUpdateAvailable(true);
      }
    }

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) {
        return;
      }

      markIfWaiting(registration);

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) {
          return;
        }
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            markIfWaiting(registration);
          }
        });
      });
    });

    const onControllerChange = (): void => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  const applyUpdate = useCallback(() => {
    const waitingWorker = waitingWorkerRef.current;
    if (!waitingWorker) {
      return;
    }
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }, []);

  return { isUpdateAvailable, applyUpdate };
}
