import { create } from "zustand";
import { googleDriveService } from "../services/googleDrive.service";
import { useNotesStore } from "../../notes/stores/useNotesStore";

type SyncState = {
  accessToken: string | null;
  clientId: string;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  cloudFileId: string | null;
  syncError: string | null;
  conflictPayload: any | null;
  autoSyncEnabled: boolean;
  setClientId: (clientId: string) => void;
  setAutoSync: (enabled: boolean) => void;
  connectDrive: () => Promise<void>;
  disconnectDrive: () => void;
  sync: () => Promise<void>;
  resolveConflict: (choice: "useCloud" | "keepLocal") => Promise<void>;
  setAccessToken: (token: string | null) => void;
};

const CLIENT_ID_KEY = "mynote_google_client_id";
const AUTO_SYNC_KEY = "mynote_auto_sync";
const LAST_SYNC_KEY = "mynote_last_sync_time";

export const useSyncStore = create<SyncState>((set, get) => {
  let initialClientId = "";
  let initialAutoSync = false;
  let initialLastSync: string | null = null;

  if (typeof localStorage !== "undefined") {
    initialClientId = localStorage.getItem(CLIENT_ID_KEY) || "";
    initialAutoSync = localStorage.getItem(AUTO_SYNC_KEY) === "true";
    initialLastSync = localStorage.getItem(LAST_SYNC_KEY);
  }

  // Inject Google GIS script dynamically if not present
  const loadGisScript = (): Promise<void> => {
    return new Promise((resolve) => {
      if ((window as any).google?.accounts?.oauth2) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  return {
    accessToken: null,
    clientId: initialClientId,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    isSyncing: false,
    lastSyncTime: initialLastSync,
    cloudFileId: null,
    syncError: null,
    conflictPayload: null,
    autoSyncEnabled: initialAutoSync,

    setClientId: (clientId) => {
      const trimmed = clientId.trim();
      set({ clientId: trimmed });
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(CLIENT_ID_KEY, trimmed);
      }
      // If client ID changes, disconnect existing connection to force re-auth
      get().disconnectDrive();
    },

    setAutoSync: (enabled) => {
      set({ autoSyncEnabled: enabled });
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(AUTO_SYNC_KEY, String(enabled));
      }
    },

    setAccessToken: (token) => {
      set({ accessToken: token });
      if (token) {
        void get().sync();
      }
    },

    connectDrive: async () => {
      const { clientId } = get();
      if (!clientId) {
        set({ syncError: "Please configure your Google OAuth Client ID in settings first." });
        return;
      }

      set({ isSyncing: true, syncError: null });

      try {
        await loadGisScript();

        const client = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "https://www.googleapis.com/auth/drive.appdata",
          callback: (response: any) => {
            if (response.error) {
              set({
                syncError: response.error_description || "Google Authentication failed",
                isSyncing: false
              });
              return;
            }
            if (response.access_token) {
              set({ accessToken: response.access_token });
              void get().sync();
            }
          }
        });

        client.requestAccessToken({ prompt: "consent" });
      } catch (err: any) {
        console.error("GIS connection error:", err);
        set({
          syncError: err.message || "Failed to initialize Google login popup.",
          isSyncing: false
        });
      }
    },

    disconnectDrive: () => {
      const { accessToken } = get();
      if (accessToken && (window as any).google?.accounts?.oauth2) {
        try {
          (window as any).google.accounts.oauth2.revoke(accessToken, () => {
            console.log("Google access token revoked successfully.");
          });
        } catch (e) {
          console.error("Failed to revoke token:", e);
        }
      }

      set({
        accessToken: null,
        cloudFileId: null,
        conflictPayload: null,
        syncError: null,
        isSyncing: false
      });
    },

    sync: async () => {
      const { accessToken, isSyncing, clientId } = get();
      if (!accessToken || !clientId) return;
      if (isSyncing) return;

      set({ isSyncing: true, syncError: null });

      try {
        const notesStore = useNotesStore.getState();
        const cloudFile = await googleDriveService.findBackupFile(accessToken);

        // Fetch current workspace payload
        const localSettings = {
          theme: localStorage.getItem("notepad_theme") || "dark",
          fontFamily: localStorage.getItem("notepad_font_family") || "Geist",
          wordWrap: localStorage.getItem("notepad_wordwrap") === "true",
          showStatusBar: localStorage.getItem("notepad_statusbar") === "true",
          zoomPercent: Number(localStorage.getItem("notepad_zoom")) || 100
        };

        const backupData = {
          app: "MY Note" as const,
          schemaVersion: 1 as const,
          exportedAt: new Date().toISOString(),
          profile: {
            firstName: notesStore.profile.firstName || "",
            lastName: notesStore.profile.lastName || ""
          },
          notes: notesStore.notes,
          projects: notesStore.projects,
          settings: localSettings
        };

        if (!cloudFile) {
          // No backup exists on Google Drive. Create a new one.
          const uploaded = await googleDriveService.saveBackup(accessToken, backupData);
          const now = new Date().toISOString();
          
          set({
            lastSyncTime: now,
            cloudFileId: uploaded.id,
            isSyncing: false
          });
          
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(LAST_SYNC_KEY, now);
          }
          notesStore.recordBackup();
          return;
        }

        // Backup exists. Let's download it.
        const cloudPayload = await googleDriveService.downloadBackupContent(accessToken, cloudFile.id);
        
        const cloudTime = new Date(cloudPayload.exportedAt || cloudFile.modifiedTime || 0).getTime();
        const localTime = new Date(notesStore.lastEditTime).getTime();

        // Safe time window comparison (2 seconds threshold to avoid tick drifts)
        if (cloudTime > localTime + 2000) {
          // Cloud is newer! Trigger conflict resolution popup
          set({
            conflictPayload: cloudPayload,
            cloudFileId: cloudFile.id,
            isSyncing: false
          });
        } else if (localTime > cloudTime + 2000 || !notesStore.lastBackupTime) {
          // Local is newer! Push local changes to cloud
          const updated = await googleDriveService.saveBackup(accessToken, backupData, cloudFile.id);
          const now = new Date().toISOString();
          
          set({
            lastSyncTime: now,
            cloudFileId: updated.id,
            isSyncing: false
          });

          if (typeof localStorage !== "undefined") {
            localStorage.setItem(LAST_SYNC_KEY, now);
          }
          notesStore.recordBackup();
        } else {
          // Both are already perfectly synced
          const now = new Date().toISOString();
          set({
            lastSyncTime: now,
            cloudFileId: cloudFile.id,
            isSyncing: false
          });
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(LAST_SYNC_KEY, now);
          }
          notesStore.recordBackup();
        }
      } catch (err: any) {
        console.error("Synchronization loop failed:", err);
        set({
          syncError: err.message || "Cloud connection failed. Please re-authenticate.",
          isSyncing: false
        });
      }
    },

    resolveConflict: async (choice) => {
      const { conflictPayload, accessToken, cloudFileId } = get();
      if (!conflictPayload || !accessToken) return;

      set({ isSyncing: true, conflictPayload: null });

      try {
        const notesStore = useNotesStore.getState();

        if (choice === "useCloud") {
          // Restore cloud backup to local Dexie database
          await notesStore.replaceAll(conflictPayload.notes, conflictPayload.projects || []);
          if (conflictPayload.profile) {
            await notesStore.replaceProfile(conflictPayload.profile);
          }
          if (conflictPayload.settings) {
            const s = conflictPayload.settings;
            if (s.theme) {
              localStorage.setItem("notepad_theme", s.theme);
              const root = document.documentElement;
              if (s.theme === "light") root.classList.add("light-theme");
              else root.classList.remove("light-theme");
            }
            if (s.fontFamily) localStorage.setItem("notepad_font_family", s.fontFamily);
            if (s.wordWrap !== undefined) localStorage.setItem("notepad_wordwrap", String(s.wordWrap));
            if (s.showStatusBar !== undefined) localStorage.setItem("notepad_statusbar", String(s.showStatusBar));
            if (s.zoomPercent !== undefined) localStorage.setItem("notepad_zoom", String(s.zoomPercent));
          }

          // Trigger full reload in notesStore
          await notesStore.load();
          const now = new Date().toISOString();
          set({ lastSyncTime: now, isSyncing: false });
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(LAST_SYNC_KEY, now);
          }
          notesStore.recordBackup();
        } else {
          // Overwrite Google Drive backup with current local workspace
          const localSettings = {
            theme: localStorage.getItem("notepad_theme") || "dark",
            fontFamily: localStorage.getItem("notepad_font_family") || "Geist",
            wordWrap: localStorage.getItem("notepad_wordwrap") === "true",
            showStatusBar: localStorage.getItem("notepad_statusbar") === "true",
            zoomPercent: Number(localStorage.getItem("notepad_zoom")) || 100
          };

          const backupData = {
            app: "MY Note" as const,
            schemaVersion: 1 as const,
            exportedAt: new Date().toISOString(),
            profile: {
              firstName: notesStore.profile.firstName || "",
              lastName: notesStore.profile.lastName || ""
            },
            notes: notesStore.notes,
            projects: notesStore.projects,
            settings: localSettings
          };

          const updated = await googleDriveService.saveBackup(accessToken, backupData, cloudFileId);
          const now = new Date().toISOString();
          
          set({
            lastSyncTime: now,
            cloudFileId: updated.id,
            isSyncing: false
          });

          if (typeof localStorage !== "undefined") {
            localStorage.setItem(LAST_SYNC_KEY, now);
          }
          notesStore.recordBackup();
        }
      } catch (err: any) {
        console.error("Conflict resolution failed:", err);
        set({
          syncError: err.message || "Failed to resolve workspace conflict.",
          isSyncing: false
        });
      }
    }
  };
});

// Network online/offline status listeners
if (typeof window !== "undefined") {
  window.addEventListener("online", () => useSyncStore.setState({ isOnline: true }));
  window.addEventListener("offline", () => useSyncStore.setState({ isOnline: false }));
}

// Debounced auto-sync trigger linked to local note modifications
let autoSyncDebounceTimeout: number | undefined;

useNotesStore.subscribe((state, prevState) => {
  const syncStore = useSyncStore.getState();
  if (
    syncStore.autoSyncEnabled &&
    syncStore.accessToken &&
    state.lastEditTime !== prevState.lastEditTime
  ) {
    if (autoSyncDebounceTimeout) {
      clearTimeout(autoSyncDebounceTimeout);
    }
    autoSyncDebounceTimeout = window.setTimeout(() => {
      void syncStore.sync();
    }, 7000); // 7 seconds debounce to prevent high-frequency write calls to Google API
  }
});
