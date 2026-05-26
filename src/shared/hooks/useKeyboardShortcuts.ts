import { useEffect, useRef } from "react";

type Keymap = {
  key: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  handler: (event: KeyboardEvent) => void;
};

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || target.isContentEditable;
}

export function useKeyboardShortcuts(maps: Keymap[]): void {
  const mapsRef = useRef<Keymap[]>(maps);
  mapsRef.current = maps;

  useEffect(() => {
    function onKeydown(event: KeyboardEvent): void {
      for (const map of mapsRef.current) {
        const keyMatch = event.key.toLowerCase() === map.key.toLowerCase();
        if (!keyMatch) {
          continue;
        }
        if (map.ctrlOrMeta && !(event.ctrlKey || event.metaKey)) {
          continue;
        }
        if (map.shift !== undefined && event.shiftKey !== map.shift) {
          continue;
        }
        map.handler(event);
      }
    }

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);
}

export { isTypingTarget };
