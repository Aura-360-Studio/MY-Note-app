import React, { useEffect, useState } from "react";

export function SplashScreen(): React.JSX.Element | null {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out after 1800ms
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // Unmount splash screen after 2400ms (1800ms + 600ms transition)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2400);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#090d12] transition-all duration-700 ease-out select-none ${
        isFadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center max-w-sm px-6">
        {/* Logo container with pulse & neon glow */}
        <div className="relative animate-in fade-in zoom-in-95 duration-700 ease-out">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-[#00dbe9] to-indigo-500 opacity-20 blur-xl animate-pulse" />
          <img
            src="/imges/MY Note logo for splash screen.png"
            alt="MY Note Splash Logo"
            className="relative w-48 h-auto object-contain drop-shadow-[0_0_15px_rgba(0,219,233,0.15)]"
          />
        </div>

        {/* Slogan or description */}
        <div className="mt-8 flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both text-center">
          <span className="mono-ui text-[10px] uppercase tracking-[0.25em] text-[#00dbe9] font-bold">
            Procedural Workspace
          </span>
          <span className="text-[11px] text-[#849495] font-light">
            by Aura Labs
          </span>
        </div>

        {/* Sleek Progress Line */}
        <div className="w-32 h-[2px] bg-[#3b494b]/30 rounded-full mt-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-[#00dbe9] to-indigo-500 rounded-full animate-[loading-bar_1.5s_infinite_linear]" />
        </div>
      </div>
    </div>
  );
}
