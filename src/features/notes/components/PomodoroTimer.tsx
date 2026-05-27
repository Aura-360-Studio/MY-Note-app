import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Check } from "lucide-react";
import { usePomodoroStore, type PomodoroMode } from "../stores/usePomodoroStore";
import { useNotesStore } from "../stores/useNotesStore";
import { playChimeSound } from "../utils/audio";

export function PomodoroTimer(): React.JSX.Element {
  const {
    timeLeft,
    duration,
    isRunning,
    mode,
    targetNoteId,
    targetNoteTitle,
    startTimer,
    pauseTimer,
    resetTimer,
    setMode,
    setTimeLeft
  } = usePomodoroStore();

  const { notes, updateNote, selectedNoteId } = useNotesStore();
  const [showPopover, setShowPopover] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem("pomodoro_sound_enabled") !== "false";
    }
    return true;
  });

  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Sync sound settings
  useEffect(() => {
    localStorage.setItem("pomodoro_sound_enabled", String(soundEnabled));
  }, [soundEnabled]);

  // Request notifications permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }
  }, []);

  // Click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle countdown ticks reliably
  useEffect(() => {
    let timerId: number | undefined;

    if (isRunning) {
      timerId = window.setInterval(() => {
        const endTimeStr = localStorage.getItem("pomodoro_end_time");
        if (endTimeStr) {
          const endTime = parseInt(endTimeStr, 10);
          const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
          
          if (remaining !== timeLeft) {
            setTimeLeft(remaining);
          }

          if (remaining <= 0) {
            clearInterval(timerId);
            void handleTimerComplete();
          }
        }
      }, 250); // High frequency check to avoid skips
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, timeLeft, mode, targetNoteId]);

  const handleTimerComplete = async () => {
    // 1. Play premium focal chime sound
    if (soundEnabled) {
      playChimeSound();
    }

    // 2. Browser Push Notification
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(
          mode === "focus" ? "Focus Session Completed! 🍅" : "Break Completed! ⚡",
          {
            body: mode === "focus"
              ? `Congratulations! You focused on "${targetNoteTitle || "your notes"}". Take a well-deserved break.`
              : "Ready to get back to writing? Start a new focus block now.",
            icon: "/imges/MY Note logo landscape.png" // Fallback to logo
          }
        );
      } catch (err) {
        console.error("Failed to trigger desktop notification:", err);
      }
    }

    // 3. Increment focus sessions in IndexedDB if mode was "focus"
    if (mode === "focus" && targetNoteId) {
      const note = notes.find((n) => n.id === targetNoteId);
      if (note) {
        const currentSessions = note.focusSessions || 0;
        await updateNote(targetNoteId, { focusSessions: currentSessions + 1 });
      }
    }

    // 4. Automatically switch to next logical mode
    if (mode === "focus") {
      setMode("shortBreak");
    } else {
      setMode("focus");
    }
  };

  const handleStart = () => {
    // If starting a focus session, bind to the currently active note
    if (mode === "focus") {
      const activeNote = notes.find((n) => n.id === selectedNoteId);
      const noteId = activeNote?.id || null;
      const noteTitle = activeNote?.title || "Scratchpad";
      startTimer(noteId, noteTitle);
    } else {
      startTimer(null, null);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // SVG Circular Ring details
  const radius = 15;
  const strokeWidth = 2.5;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = ((duration - timeLeft) / duration) * 100;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Active note session count details
  const currentActiveNote = notes.find((n) => n.id === selectedNoteId);
  const currentNoteSessions = currentActiveNote?.focusSessions || 0;

  return (
    <div className="relative" ref={popoverRef}>
      {/* Mini Circle Status Button */}
      <button
        onClick={() => setShowPopover((prev) => !prev)}
        className={`flex items-center gap-2 p-1.5 rounded-full border transition-all duration-200 select-none ${
          isRunning
            ? "border-[#00dbe9]/30 bg-[#00dbe9]/[0.03] text-[#00dbe9] shadow-sm shadow-[#00dbe9]/5"
            : "border-[#3b494b] hover:border-[#00dbe9]/50 hover:bg-[#201f24] text-[#b9cacb] hover:text-white"
        }`}
        title={`Pomodoro Timer: ${mode === "focus" ? "Focus Block" : "Break Mode"} (${formatTime(timeLeft)})`}
      >
        <div className="relative w-9 h-9 flex items-center justify-center">
          {/* Background Ring */}
          <svg className="absolute transform -rotate-90 w-full h-full">
            <circle
              cx="18"
              cy="18"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className={isRunning ? "text-[#00dbe9]/10" : "text-[#3b494b]/30"}
            />
            {/* Active Progress Ring */}
            <circle
              cx="18"
              cy="18"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                mode === "focus"
                  ? "text-[#00dbe9]"
                  : "text-emerald-400"
              }`}
            />
          </svg>
          {/* Centered Mode Status Icon */}
          <span className="text-[10px] font-mono tracking-tighter select-none font-bold">
            {formatTime(timeLeft).slice(0, 2)}
          </span>
        </div>

        {/* Display Text next to circle if active */}
        {isRunning && (
          <span className="text-[10px] font-bold uppercase tracking-wider pr-3 font-mono animate-pulse">
            {mode === "focus" ? "Focus" : "Break"}
          </span>
        )}
      </button>

      {/* Aesthetic Frosted Glass Dropdown Popover */}
      {showPopover && (
        <div className="absolute right-0 top-12 w-72 bg-[#1a1a1a] border border-[#3b494b] rounded-2xl shadow-2xl p-4 z-[70] flex flex-col gap-4 animate-in fade-in slide-in-from-top-3 duration-250 select-none">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1 bg-[#0c0c0e] rounded-full p-1 border border-[#3b494b]/40">
            {(["focus", "shortBreak", "longBreak"] as PomodoroMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest transition duration-150 ${
                  mode === m
                    ? m === "focus"
                      ? "bg-[#00dbe9] text-[#00363a] font-black"
                      : "bg-emerald-400 text-[#003a18] font-black"
                    : "text-[#b9cacb] hover:text-white"
                }`}
              >
                {m === "focus" ? "Focus" : m === "shortBreak" ? "Short" : "Long"}
              </button>
            ))}
          </div>

          {/* Time Counter Display */}
          <div className="flex flex-col items-center justify-center py-2.5 bg-[#0e0e11] rounded-xl border border-[#3b494b]/30">
            <span className="text-4xl font-light font-mono text-white tracking-widest">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[9px] font-semibold text-[#849495] uppercase tracking-widest mt-1">
              {mode === "focus" ? "Focus Block" : "Break Interval"}
            </span>
          </div>

          {/* Targeted Note Context Indicator */}
          {mode === "focus" && (
            <div className="text-left text-[11px] px-1 text-[#849495] flex items-center justify-between border-b border-[#3b494b]/20 pb-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#b9cacb]">Linked Note</span>
                <span className="text-white font-medium truncate max-w-[160px]">
                  {isRunning ? targetNoteTitle : currentActiveNote?.title || "Scratchpad"}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#00dbe9]/10 border border-[#00dbe9]/20 px-2 py-0.5 rounded-full text-[9px] text-[#00dbe9] font-mono">
                <span>🍅 {isRunning ? (notes.find(n => n.id === targetNoteId)?.focusSessions || 0) : currentNoteSessions}</span>
              </div>
            </div>
          )}

          {/* Control Buttons row */}
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={pauseTimer}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition"
              >
                <Pause size={12} />
                Pause
              </button>
            ) : (
              <button
                onClick={handleStart}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition ${
                  mode === "focus"
                    ? "bg-[#00dbe9] hover:bg-[#00dbe9]/85 text-[#00363a]"
                    : "bg-emerald-400 hover:bg-emerald-300 text-[#003a18]"
                }`}
              >
                <Play size={12} />
                Start Focus
              </button>
            )}

            <button
              onClick={resetTimer}
              className="p-2 rounded-full border border-[#3b494b] hover:border-[#849495] text-[#b9cacb] hover:text-white transition"
              title="Reset timer"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Sound settings & session stats summary */}
          <div className="flex items-center justify-between pt-1 border-t border-[#3b494b]/20 text-[10px] text-[#849495]">
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              {soundEnabled ? (
                <>
                  <Volume2 size={12} className="text-[#00dbe9]" />
                  <span>Sound Enabled</span>
                </>
              ) : (
                <>
                  <VolumeX size={12} />
                  <span>Muted</span>
                </>
              )}
            </button>

            {mode === "focus" && (
              <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#b9cacb] font-bold">
                <Sparkles size={11} className="text-amber-400" />
                <span>Distraction Free</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
