import { create } from "zustand";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak";

type PomodoroState = {
  timeLeft: number;
  duration: number;
  isRunning: boolean;
  mode: PomodoroMode;
  targetNoteId: string | null;
  targetNoteTitle: string | null;
  startTimer: (noteId: string | null, noteTitle: string | null) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setMode: (mode: PomodoroMode) => void;
  setTimeLeft: (seconds: number) => void;
  syncState: (data: Partial<PomodoroState>) => void;
};

const POMODORO_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

const syncChannel = typeof window !== "undefined" ? new BroadcastChannel("my-note-pomodoro") : null;

export const usePomodoroStore = create<PomodoroState>((set, get) => {
  // Load initial state from localStorage if available to persist across sessions
  let initialMode: PomodoroMode = "focus";
  let initialDuration = POMODORO_DURATIONS.focus;
  let initialTimeLeft = POMODORO_DURATIONS.focus;
  let initialTargetNoteId: string | null = null;
  let initialTargetNoteTitle: string | null = null;
  let initialIsRunning = false;

  if (typeof localStorage !== "undefined") {
    try {
      const mode = localStorage.getItem("pomodoro_mode") as PomodoroMode | null;
      if (mode && POMODORO_DURATIONS[mode]) {
        initialMode = mode;
        initialDuration = POMODORO_DURATIONS[mode];
      }
      
      const targetNoteId = localStorage.getItem("pomodoro_target_note_id");
      initialTargetNoteId = targetNoteId || null;
      
      const targetNoteTitle = localStorage.getItem("pomodoro_target_note_title");
      initialTargetNoteTitle = targetNoteTitle || null;

      const isRunningStr = localStorage.getItem("pomodoro_is_running");
      initialIsRunning = isRunningStr === "true";

      const endTimeStr = localStorage.getItem("pomodoro_end_time");
      const pausedTimeLeftStr = localStorage.getItem("pomodoro_paused_time_left");

      if (initialIsRunning && endTimeStr) {
        const endTime = parseInt(endTimeStr, 10);
        const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
        initialTimeLeft = remaining;
        if (remaining === 0) {
          initialIsRunning = false;
        }
      } else if (pausedTimeLeftStr) {
        initialTimeLeft = parseInt(pausedTimeLeftStr, 10);
      } else {
        initialTimeLeft = POMODORO_DURATIONS[initialMode];
      }
    } catch (e) {
      console.error("Failed to load initial Pomodoro state:", e);
    }
  }

  const broadcastState = (changes: Partial<PomodoroState>) => {
    syncChannel?.postMessage({ type: "sync-state", changes });
  };

  return {
    timeLeft: initialTimeLeft,
    duration: initialDuration,
    isRunning: initialIsRunning,
    mode: initialMode,
    targetNoteId: initialTargetNoteId,
    targetNoteTitle: initialTargetNoteTitle,

    startTimer: (noteId, noteTitle) => {
      const { timeLeft, mode } = get();
      const endTime = Date.now() + timeLeft * 1000;
      
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("pomodoro_is_running", "true");
        localStorage.setItem("pomodoro_end_time", endTime.toString());
        localStorage.removeItem("pomodoro_paused_time_left");
        if (noteId) {
          localStorage.setItem("pomodoro_target_note_id", noteId);
          localStorage.setItem("pomodoro_target_note_title", noteTitle || "Untitled note");
        }
      }

      const updates = {
        isRunning: true,
        targetNoteId: noteId || get().targetNoteId,
        targetNoteTitle: noteTitle || get().targetNoteTitle
      };

      set(updates);
      broadcastState(updates);
    },

    pauseTimer: () => {
      const { timeLeft } = get();
      
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("pomodoro_is_running", "false");
        localStorage.setItem("pomodoro_paused_time_left", timeLeft.toString());
        localStorage.removeItem("pomodoro_end_time");
      }

      const updates = { isRunning: false };
      set(updates);
      broadcastState(updates);
    },

    resetTimer: () => {
      const { mode } = get();
      const defaultDuration = POMODORO_DURATIONS[mode];

      if (typeof localStorage !== "undefined") {
        localStorage.setItem("pomodoro_is_running", "false");
        localStorage.setItem("pomodoro_paused_time_left", defaultDuration.toString());
        localStorage.removeItem("pomodoro_end_time");
      }

      const updates = {
        timeLeft: defaultDuration,
        isRunning: false
      };

      set(updates);
      broadcastState(updates);
    },

    setMode: (mode) => {
      const duration = POMODORO_DURATIONS[mode];

      if (typeof localStorage !== "undefined") {
        localStorage.setItem("pomodoro_mode", mode);
        localStorage.setItem("pomodoro_is_running", "false");
        localStorage.setItem("pomodoro_paused_time_left", duration.toString());
        localStorage.removeItem("pomodoro_end_time");
      }

      const updates = {
        mode,
        duration,
        timeLeft: duration,
        isRunning: false
      };

      set(updates);
      broadcastState(updates);
    },

    setTimeLeft: (seconds) => {
      set({ timeLeft: seconds });
    },

    syncState: (data) => {
      set(data);
    }
  };
});

// Broadcast Channel event listener to keep open tabs in sync
if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data?.type === "sync-state") {
      usePomodoroStore.getState().syncState(event.data.changes);
    } else if (event.data?.type === "timer-complete") {
      // Trigger a local UI or state update if timer completes in another tab
      usePomodoroStore.getState().syncState({ isRunning: false, timeLeft: 0 });
    }
  };
}
