import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Monitor,
  Type,
  User,
  Download,
  Upload,
  Info,
  ExternalLink,
  Check,
  X,
  Globe,
  Wifi,
  WifiOff,
  Smartphone,
  Activity,
  CirclePlay,
  HelpCircle,
  MessageSquare,
  ShieldAlert,
  Cloud,
  RefreshCw,
  LogOut,
  Key
} from "lucide-react";
import { useNotesStore } from "../features/notes/stores/useNotesStore";
import { useOnlineStatus } from "../shared/hooks/useOnlineStatus";
import { usePwaInstall } from "../shared/hooks/usePwaInstall";
import { usePwaUpdate } from "../shared/hooks/usePwaUpdate";
import { useConfirmationStore } from "../shared/hooks/useConfirmationStore";
import { LegalModal, LegalModalType } from "../shared/components/LegalModal";
import { useSyncStore } from "../features/backup/stores/useSyncStore";
import { GOOGLE_CLIENT_ID } from "../shared/config/google";
import { HelpModal } from "../shared/components/HelpModal";
import { FeedbackModal } from "../shared/components/FeedbackModal";

function formatTimeDifference(lastBackupStr: string | null): {
  days: number;
  months: number;
  years: number;
  formatted: string;
  totalDays: number;
} {
  if (!lastBackupStr) {
    return { days: 0, months: 0, years: 0, formatted: "Never backed up", totalDays: Infinity };
  }
  const lastBackup = new Date(lastBackupStr);
  const now = new Date();
  
  const totalDays = Math.floor((now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));
  if (totalDays === 0) {
    return { days: 0, months: 0, years: 0, formatted: "Today", totalDays: 0 };
  }
  
  let years = now.getFullYear() - lastBackup.getFullYear();
  let months = now.getMonth() - lastBackup.getMonth();
  let days = now.getDate() - lastBackup.getDate();
  
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  
  return {
    days,
    months,
    years,
    formatted: parts.join(", ") + " ago",
    totalDays
  };
}

type SettingsPageProps = {
  onClose: () => void;
  initialSection?: "profile" | "appearance" | "font" | "backup" | "network" | null;
  wordWrap: boolean;
  setWordWrap: (wrap: boolean) => void;
  showStatusBar: boolean;
  setShowStatusBar: (show: boolean) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onExport: () => void;
};

export function SettingsPage({
  onClose,
  initialSection = null,
  wordWrap,
  setWordWrap,
  showStatusBar,
  setShowStatusBar,
  fontFamily,
  setFontFamily,
  theme,
  setTheme,
  fileInputRef,
  onExport
}: SettingsPageProps): React.JSX.Element {
  // Accordion expanded states
  const [expandedSection, setExpandedSection] = useState<string | null>(
    initialSection || "backup"
  );

  const { profile, updateProfile, lastBackupTime, lastEditTime } = useNotesStore();
  const isOnline = useOnlineStatus();
  const { canInstall, installState, promptInstall } = usePwaInstall();
  const { applyUpdate, isUpdateAvailable } = usePwaUpdate();

  const {
    accessToken,
    clientId,
    isSyncing,
    lastSyncTime: cloudLastSyncTime,
    syncError,
    autoSyncEnabled,
    setClientId,
    setAutoSync,
    connectDrive,
    disconnectDrive,
    sync: triggerSync
  } = useSyncStore();

  const isStandalone = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches;
  const isAlreadyInstalled = installState === "installed" || isStandalone;

  const backupDiff = formatTimeDifference(lastBackupTime);
  const hasUnsavedEdits = !lastBackupTime || (new Date(lastEditTime).getTime() > new Date(lastBackupTime).getTime());

  const showConfirmModal = useConfirmationStore((state) => state.confirm);

  // Legal modal states
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType | null>(null);
  const [showAdvancedSync, setShowAdvancedSync] = useState(false);

  // Help and Feedback modal states
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const openLegalModal = (type: LegalModalType) => {
    setLegalModalType(type);
    setIsLegalModalOpen(true);
  };

  const handleInstallClick = async () => {
    if (canInstall) {
      await promptInstall();
    } else {
      alert(
        "To install MY Note on your device:\n\n" +
        "1. If you are using Chrome/Edge, look for the 'Install' icon in the address bar (right side).\n" +
        "2. On Safari (iOS), tap the Share button and select 'Add to Home Screen'.\n" +
        "3. On Safari (macOS), go to File > Add to Dock.\n\n" +
        "This Progressive Web App (PWA) runs fully offline-first in your browser even without installation!"
      );
    }
  };

  // Temporary inputs state for Profile fields to enable cancel/confirm actions
  const [tempFirstName, setTempFirstName] = useState(profile.firstName || "");
  const [tempLastName, setTempLastName] = useState(profile.lastName || "");
  const [lastSavedFirstName, setLastSavedFirstName] = useState(profile.firstName);
  const [lastSavedLastName, setLastSavedLastName] = useState(profile.lastName);

  const firstNameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialSection === "profile") {
      firstNameInputRef.current?.focus();
    }
  }, [initialSection]);

  if (profile.firstName !== lastSavedFirstName) {
    setLastSavedFirstName(profile.firstName);
    setTempFirstName(profile.firstName);
  }
  if (profile.lastName !== lastSavedLastName) {
    setLastSavedLastName(profile.lastName);
    setTempLastName(profile.lastName);
  }

  const handleSaveFirstName = () => {
    void updateProfile({
      firstName: tempFirstName,
      lastName: profile.lastName
    });
  };

  const handleCancelFirstName = () => {
    setTempFirstName(profile.firstName);
  };

  const handleSaveLastName = () => {
    void updateProfile({
      firstName: profile.firstName,
      lastName: tempLastName
    });
  };

  const handleCancelLastName = () => {
    setTempLastName(profile.lastName);
  };

  const handleForceReload = () => {
    showConfirmModal({
      title: "Hard Refresh Application",
      message: "This will unregister active offline service workers and purge the browser's asset cache to retrieve the latest version of the app from the server.",
      helperText: "Your notes, projects, settings, and other local data will NOT be deleted.",
      confirmText: "Hard Refresh",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
          }
          if ("caches" in window) {
            const keys = await caches.keys();
            for (const key of keys) {
              await caches.delete(key);
            }
          }
        } catch (e) {
          console.error("Failed to clear PWA cache:", e);
        }
        // Force bypass browser cache
        window.location.href = window.location.origin + window.location.pathname + "?v=" + Date.now();
      }
    });
  };

  const handleFactoryReset = () => {
    showConfirmModal({
      title: "Factory Reset & Wipe Database",
      message: "This will permanently delete all your local notes, projects, user configurations, and IndexedDB database files. You will lose everything in this workspace.",
      helperText: "It is highly recommended that you take a full JSON backup of your notes before proceeding. This action CANNOT be undone.",
      confirmText: "Confirm & Reset All",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              await registration.unregister();
            }
          }
          if ("caches" in window) {
            const keys = await caches.keys();
            for (const key of keys) {
              await caches.delete(key);
            }
          }
        } catch (e) {
          console.error("Failed to clear service workers or caches:", e);
        }

        try {
          const { db } = await import("../data/db");
          db.close();
          await new Promise((resolve) => setTimeout(resolve, 500));
          window.indexedDB.deleteDatabase("my-note-db");
        } catch (e) {
          console.error("Failed to clear local IndexedDB database", e);
        }

        window.location.href = window.location.origin + window.location.pathname + "?reset=" + Date.now();
      }
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  const fontFamilies = [
    { name: "Geist (Modern Clean)", value: "Geist" },
    { name: "JetBrains Mono (Developer)", value: "JetBrains Mono" },
    { name: "Segoe UI (Windows Default)", value: "Segoe UI" },
    { name: "Consolas (Monospace Classic)", value: "Consolas" },
    { name: "Courier New (Classic Typewriter)", value: "Courier New" }
  ];

  return (
    <div className="fixed inset-0 z-[100] h-screen w-screen bg-gradient-to-br from-[#1b1a1f] to-[#121215] text-[#e5e2e1] overflow-y-auto px-6 py-8 md:px-12 md:py-12 animate-in fade-in duration-300 select-none">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-[#3b494b]/40 pb-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="rounded-lg p-2.5 bg-[#252429] hover:bg-[#343339] border border-[#3b494b]/40 hover:border-[#00dbe9]/60 text-[#b9cacb] hover:text-[#00dbe9] transition-all duration-200"
            title="Go back to Workspace"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Settings</h1>
            <p className="text-xs text-[#849495] mt-1">Configure MY Note behavior, appearance, and workspace profile</p>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Settings Options (3/4 width) */}
          <main className="lg:col-span-3 flex flex-col gap-6">
            
            {/* 4. BACKUP & SYSTEM SECTION */}
            <section className="flex flex-col animate-in fade-in duration-300">
              <h2 className="text-[10px] font-semibold text-[#849495] tracking-[0.14em] uppercase mb-2">
                Data & Backups
              </h2>

              <div className="flex flex-col gap-2.5">
                
                {/* Backup / Restore card */}
                <div className="rounded-xl border border-[#3b494b]/40 bg-[#201f24] overflow-hidden">
                  <button
                    onClick={() => toggleSection("backup")}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#2a2930] transition text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-lg bg-[#2b2a31] border border-[#3b494b]/40 text-[#00dbe9]">
                        <Upload size={16} />
                      </div>
                      <div>
                        <h3 className="text-[13px] font-medium text-white">Import & export workspace</h3>
                        <p className="text-[11px] text-[#849495] mt-0.5">Safeguard notes, stages, and settings via a backup file</p>
                      </div>
                    </div>
                    <div className="text-[#849495]">
                      {expandedSection === "backup" ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>

                  {expandedSection === "backup" && (
                    <div className="px-5 pb-5 pt-3 border-t border-[#3b494b]/20 bg-[#1b1a1f] flex flex-col gap-3 animate-in slide-in-from-top-1 duration-200">
                      <p className="text-[11px] text-[#849495]">
                        Exporting downloads a structured JSON containing all your active projects, tasks, profile information, and config schemas.
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="mono-ui inline-flex items-center justify-center gap-2 rounded-lg border border-[#3b494b] hover:border-[#00dbe9] hover:text-[#00dbe9] bg-[#252429] px-4 py-2 text-xs font-semibold text-[#b9cacb] transition-all duration-150"
                        >
                          <Upload size={13} />
                          Import Backup
                        </button>
                        <button
                          onClick={onExport}
                          className="mono-ui inline-flex items-center justify-center gap-2 rounded-lg border border-[#3b494b] hover:border-[#00dbe9] hover:text-[#00dbe9] bg-[#252429] px-4 py-2 text-xs font-semibold text-[#b9cacb] transition-all duration-150"
                        >
                          <Download size={13} />
                          Export Backup
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Local Storage & Data Safety warning card */}
                <div className="rounded-xl border border-[#3b494b]/40 bg-[#201f24] p-5 flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 mt-0.5 flex-shrink-0">
                      <ShieldAlert size={16} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[13px] font-semibold text-white">Local Storage & Data Safety</h3>
                      <p className="text-[11px] text-[#849495] mt-1.5 leading-relaxed">
                        MY Note is a fully local, offline-first application. All your notes, projects, and custom configurations are stored securely inside your browser's local database (IndexedDB). Since there is no cloud database synchronization, clearing your browser cache, website storage, or cookies will permanently delete all your data. To safeguard your work, it is highly recommended to download a JSON backup regularly, especially after writing or editing critical notes.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#3b494b]/20 pt-4 flex flex-col gap-3.5">
                    <h4 className="mono-ui text-[10px] uppercase tracking-wider text-[#00dbe9] font-bold">
                      Backup Logging & Alerts
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                      {/* Last Backup Log */}
                      <div className="flex flex-col gap-1 bg-[#1b1a1f] p-3 rounded-lg border border-[#3b494b]/20">
                        <span className="text-[#849495] font-medium uppercase tracking-wider text-[9px]">Last Backed Up</span>
                        <span className="text-white font-semibold mt-1">
                          {lastBackupTime ? new Date(lastBackupTime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Never"}
                        </span>
                        <span className="text-[#849495] mt-0.5">
                          {backupDiff.formatted}
                        </span>
                      </div>

                      {/* Backup Required Warning */}
                      <div className={`flex flex-col justify-center p-3 rounded-lg border ${
                        hasUnsavedEdits 
                          ? "bg-rose-500/[0.03] border-rose-500/20 text-rose-300"
                          : "bg-emerald-500/[0.03] border-emerald-500/20 text-emerald-300"
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${hasUnsavedEdits ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`} />
                          <span className="font-semibold uppercase tracking-wider text-[9px] text-[#849495]">Status Alert</span>
                        </div>
                        <p className="mt-1.5 leading-relaxed text-[11px]">
                          {hasUnsavedEdits 
                            ? "Warning: You have unsaved workspace modifications since your last backup. Please download a backup to prevent data loss."
                            : "Your workspace is fully backed up and up to date. No pending modifications."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CLOUD SYNC SECTION */}
            <section className="flex flex-col">
              <h2 className="text-[10px] font-bold text-[#00dbe9] tracking-[0.14em] uppercase mb-2.5">
                Cloud Syncing (Google Drive)
              </h2>

              <div className="rounded-[20px] border border-[#3b494b]/40 bg-[#0c0c0e] overflow-hidden divide-y divide-[#3b494b]/20">
                
                {/* Credentials & Connection Info */}
                <div className="p-5 flex flex-col gap-5 bg-[#131216]/60">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 border ${
                      accessToken
                        ? "bg-[#0e2729] border-[#00dbe9]/20 text-[#00dbe9]"
                        : "bg-[#202024] border-white/5 text-[#849495]"
                    }`}>
                      <Cloud size={20} className={accessToken ? "animate-pulse" : ""} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">Google Drive Integration</h3>
                        {accessToken ? (
                          <span className="flex items-center gap-1 bg-[#00dbe9]/10 border border-[#00dbe9]/20 px-2 py-0.5 rounded-full text-[9px] text-[#00dbe9] font-mono font-bold uppercase">
                            <Check size={8} /> Connected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[9px] text-amber-500 font-mono font-bold uppercase">
                            Not Connected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#849495] mt-1.5 leading-relaxed">
                        Encrypt and sync your workspace data directly to your private Google Drive App Folder. Your data remains 100% private to you—we never host, see, or touch your notes.
                      </p>
                    </div>
                  </div>

                  {/* Connect / Disconnect Buttons row */}
                  <div className="flex flex-col gap-3 items-center justify-center border-t border-[#3b494b]/10 pt-4 w-full">
                    {syncError && (
                      <span className="text-[10px] text-rose-400 font-medium text-center w-full mb-1">
                        ⚠️ {syncError}
                      </span>
                    )}

                    {accessToken ? (
                      <div className="flex w-full items-center justify-end">
                        <button
                          onClick={disconnectDrive}
                          className="px-5 py-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition flex items-center gap-1.5"
                        >
                          <LogOut size={11} />
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 w-full max-w-[280px]">
                        {/* Official premium 'Continue with Google' button */}
                        <button
                          onClick={connectDrive}
                          disabled={!isOnline}
                          className="w-full flex items-center justify-center gap-3.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-2.5 rounded-lg text-xs font-bold font-sans transition shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-40"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 flex-shrink-0">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                            <path fill="#4285F4" d="M46.5 24c0-1.63-.15-3.2-.43-4.75H24v9.03h12.75c-.55 2.93-2.2 5.41-4.68 7.08l7.28 5.64C43.66 36.56 46.5 30.93 46.5 24z"/>
                            <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.98-6.19z"/>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.28-5.64c-2.11 1.42-4.81 2.3-8.61 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                          </svg>
                          Continue with Google
                        </button>
                        
                        {/* Toggle Advanced settings */}
                        <button
                          onClick={() => setShowAdvancedSync(!showAdvancedSync)}
                          className="text-[9px] uppercase tracking-wider font-extrabold text-[#849495] hover:text-[#00dbe9] transition mt-1"
                        >
                          {showAdvancedSync ? "Hide Advanced Settings" : "Configure Custom OAuth client"}
                        </button>

                        {/* Informative Configuration Guide Box if placeholder active */}
                        {clientId.includes("-default") && (
                          <div className="mt-3 p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 text-amber-300 text-left text-[11px] leading-relaxed w-full max-w-[400px] animate-in fade-in slide-in-from-top-1 duration-200">
                            <p className="font-bold text-white flex items-center gap-1.5">
                              <ShieldAlert size={13} className="text-amber-500" />
                              Setup Required: Client ID
                            </p>
                            <p className="text-[#849495] mt-1.5">
                              To activate direct Google Sign-in, please replace the default placeholder in your configuration file:
                            </p>
                            <p className="font-mono text-white bg-[#0e0e11] px-2 py-1 rounded border border-[#3b494b]/30 text-[10px] mt-1.5 select-all">
                              src/shared/config/google.ts
                            </p>
                            <p className="text-[#849495] mt-1.5">
                              with your real Google OAuth Client ID configured for <span className="text-white font-medium">note.aura360studio.com</span>.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Advanced Custom Client ID settings (collapsible) */}
                  {!accessToken && showAdvancedSync && (
                    <div className="border-t border-[#3b494b]/10 pt-4 flex flex-col gap-3.5 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-[#b9cacb] flex items-center gap-1">
                          <Key size={10} className="text-[#00dbe9]" />
                          Advanced Google OAuth Client ID
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            placeholder="E.g., 123456-abcdef.apps.googleusercontent.com"
                            className="flex-1 rounded-lg border border-[#3b494b] bg-[#131317] px-3 py-2 text-xs outline-none focus:border-[#00dbe9] text-white placeholder:text-[#555] transition-all font-mono"
                          />
                          <button
                            onClick={() => setClientId(GOOGLE_CLIENT_ID)}
                            className="px-3.5 py-2 bg-[#252429] hover:bg-[#2d2c34] border border-[#3b494b] rounded-lg text-[10px] font-bold text-[#b9cacb] hover:text-white uppercase tracking-wider transition whitespace-nowrap"
                            title="Reset to default codebase client ID"
                          >
                            Reset
                          </button>
                        </div>
                        <p className="text-[9px] text-[#849495] leading-normal">
                          For complete self-hosting isolation, you can input your own Google Cloud OAuth 2.0 Client ID here. Make sure your domain is listed under Google Console JavaScript Origins.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Cloud Sync Operations Panel */}
                {accessToken && (
                  <div className="p-5 flex flex-col gap-4 bg-[#131216]/40 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Last Sync Timestamp Display */}
                      <div className="flex flex-col gap-1 bg-[#1b1a1f] p-3 rounded-lg border border-[#3b494b]/20 text-left">
                        <span className="text-[#849495] font-semibold uppercase tracking-wider text-[9px]">Last Cloud Sync</span>
                        <span className="text-white font-bold mt-1">
                          {cloudLastSyncTime
                            ? new Date(cloudLastSyncTime).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                            : "Pending initial sync upload"}
                        </span>
                        <span className="text-[#849495] mt-0.5">
                          {cloudLastSyncTime ? "Workspace is locked to Google Cloud" : "Pending initial sync upload"}
                        </span>
                      </div>

                      {/* Auto-Sync Toggle Control */}
                      <div className="flex items-center justify-between p-3 bg-[#1b1a1f] rounded-lg border border-[#3b494b]/20">
                        <div className="text-left flex flex-col gap-0.5">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Auto-Sync Workspace</span>
                          <span className="text-[9px] text-[#849495]">Periodically back up changes automatically</span>
                        </div>
                        <button
                          onClick={() => setAutoSync(!autoSyncEnabled)}
                          className="flex items-center group cursor-pointer focus:outline-none"
                        >
                          <div className={`w-8 h-4.5 rounded-full p-0.5 transition-all duration-200 ${
                            autoSyncEnabled ? "bg-[#00dbe9]" : "bg-transparent border border-[#b9cacb]/80"
                          } relative flex items-center`}>
                            <div className={`w-3.5 h-3.5 rounded-full transition-all duration-200 shadow-sm ${
                              autoSyncEnabled ? "translate-x-3.5 bg-[#00363a]" : "translate-x-0.5 bg-[#b9cacb]"
                            }`} />
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Manual Sync Trigger Button */}
                    <div className="flex items-center justify-end">
                      <button
                        onClick={triggerSync}
                        disabled={isSyncing || !isOnline}
                        className="px-6 py-2 bg-white hover:bg-white/95 text-black rounded-full text-[10px] font-extrabold uppercase tracking-widest transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,255,255,0.4)] disabled:opacity-40"
                      >
                        <RefreshCw size={11} className={isSyncing ? "animate-spin" : ""} />
                        {isSyncing ? "Syncing..." : "Sync Now"}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </section>

            {/* APP STATUS SECTION */}
            <section className="flex flex-col">
              <h2 className="text-[10px] font-bold text-[#00dbe9] tracking-[0.14em] uppercase mb-2.5">
                App Status
              </h2>

              <div className="rounded-[20px] border border-[#1f1e24] bg-[#0c0c0e] overflow-hidden divide-y divide-[#1e1e22]">
                
                {/* Row 1: Network State */}
                <div className="p-5 flex items-center justify-between bg-[#131216]/60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-[#0e2729] border border-[#00dbe9]/10 text-[#00dbe9] flex items-center justify-center flex-shrink-0">
                      {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">Network State</h3>
                      <p className="text-[11px] text-[#849495] mt-0.5">
                        {isOnline ? "Online & Syncing" : "Offline mode active"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Row 2: App Installation */}
                <div className="p-5 flex items-center justify-between bg-[#131216]/60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-[#202024] border border-white/5 text-[#849495] flex items-center justify-center flex-shrink-0">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">App Installation</h3>
                      <p className="text-[11px] text-[#849495] mt-0.5">
                        {isAlreadyInstalled ? "Installed & Running locally" : "Running in Browser"}
                      </p>
                    </div>
                  </div>
                  {!isAlreadyInstalled && (
                    <button
                      onClick={handleInstallClick}
                      className="bg-white hover:bg-white/95 text-black px-6 py-2 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 shadow-[0_0_12px_rgba(255,255,255,0.45)] hover:shadow-[0_0_18px_rgba(255,255,255,0.65)] hover:scale-[1.03] active:scale-95"
                    >
                      Install App
                    </button>
                  )}
                </div>

                {/* Row 3: Hard Refresh System */}
                <div className="p-5 flex items-center justify-between bg-[#1c0c0e]/80">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-[#3b1216] border border-rose-500/10 text-rose-500 flex items-center justify-center flex-shrink-0">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-rose-400">Hard Refresh System</h3>
                      <p className="text-[10px] text-[#849495] mt-0.5 uppercase tracking-wider font-semibold">
                        Clear Cache & Reload
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleForceReload}
                    className="border border-[#3b191c] hover:border-rose-500/40 text-white/90 hover:bg-rose-500/10 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.03] active:scale-95"
                  >
                    Force Reload
                  </button>
                </div>

                {/* Row 4: Factory Reset System */}
                <div className="p-5 flex items-center justify-between bg-[#150a0b]/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[14px] bg-[#220d0f] border border-red-500/10 text-red-500 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-red-400">Factory Reset System</h3>
                      <p className="text-[10px] text-[#849495] mt-0.5 uppercase tracking-wider font-semibold">
                        Delete database & Wipe data
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleFactoryReset}
                    className="border border-[#421b1e] hover:border-red-500/40 text-red-400 hover:bg-red-500/10 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 hover:scale-[1.03] active:scale-95"
                  >
                    Wipe All Data
                  </button>
                </div>

              </div>
            </section>



            {/* 1. APPEARANCE SECTION */}
            <section className="flex flex-col">
              <h2 className="text-[10px] font-semibold text-[#849495] tracking-[0.14em] uppercase mb-2">
                Appearance
              </h2>
              
              <div className="flex flex-col gap-2.5">
                {/* App Theme Accordion */}
                <div className="rounded-xl border border-[#3b494b]/40 bg-[#201f24] overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => toggleSection("appearance")}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#2a2930] transition text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-lg bg-[#2b2a31] border border-[#3b494b]/40 text-[#00dbe9]">
                        <Monitor size={16} />
                      </div>
                      <div>
                        <h3 className="text-[13px] font-medium text-white">App theme</h3>
                        <p className="text-[11px] text-[#849495] mt-0.5">Select which app theme to display</p>
                      </div>
                    </div>
                    <div className="text-[#849495]">
                      {expandedSection === "appearance" ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>

                  {expandedSection === "appearance" && (
                    <div className="px-5 pb-5 pt-1 border-t border-[#3b494b]/20 bg-[#1b1a1f] flex flex-col gap-3.5 animate-in slide-in-from-top-1 duration-200">
                      {[
                        { label: "Light", value: "light" },
                        { label: "Dark (Recommended)", value: "dark" },
                        { label: "Use system setting", value: "system" }
                      ].map((t) => (
                        <label
                          key={t.value}
                          className="flex items-center gap-3 cursor-pointer text-xs group"
                        >
                          <input
                            type="radio"
                            name="theme"
                            checked={theme === t.value}
                            onChange={() => setTheme(t.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            theme === t.value
                              ? "border-[#00dbe9] bg-[#00dbe9]/10"
                              : "border-[#3b494b] group-hover:border-white"
                          }`}>
                            {theme === t.value && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#00dbe9]" />
                            )}
                          </div>
                          <span className={`${theme === t.value ? "text-white font-medium" : "text-[#b9cacb] group-hover:text-white"}`}>
                            {t.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 2. TEXT FORMATTING SECTION */}
            <section className="flex flex-col">
              <h2 className="text-[10px] font-semibold text-[#849495] tracking-[0.14em] uppercase mb-2">
                Text Formatting
              </h2>
              
              <div className="flex flex-col gap-2.5">
                
                {/* Font Family Accordion */}
                <div className="rounded-xl border border-[#3b494b]/40 bg-[#201f24] overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => toggleSection("font")}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#2a2a20]/10 transition text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-lg bg-[#2b2a31] border border-[#3b494b]/40 text-[#00dbe9]">
                        <Type size={16} />
                      </div>
                      <div>
                        <h3 className="text-[13px] font-medium text-white">Font family</h3>
                        <p className="text-[11px] text-[#849495] mt-0.5">Customize your writing font style</p>
                      </div>
                    </div>
                    <div className="text-[#849495] flex items-center gap-2">
                      <span className="text-[11px] bg-[#2a2930] px-2 py-0.5 rounded border border-[#3b494b]/40 text-[#00dbe9]">
                        {fontFamilies.find((f) => f.value === fontFamily)?.name.split(" ")[0]}
                      </span>
                      {expandedSection === "font" ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  </button>

                  {expandedSection === "font" && (
                    <div className="px-5 pb-5 pt-2 border-t border-[#3b494b]/20 bg-[#1b1a1f] flex flex-col gap-3 animate-in slide-in-from-top-1 duration-200">
                      {fontFamilies.map((f) => (
                        <button
                          key={f.value}
                          onClick={() => setFontFamily(f.value)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition ${
                            fontFamily === f.value
                              ? "bg-[#00dbe9]/5 border-[#00dbe9] text-white"
                              : "bg-[#252429]/40 border-transparent text-[#b9cacb] hover:bg-[#252429] hover:text-white hover:border-[#3b494b]/40"
                          }`}
                          style={{ fontFamily: f.value }}
                        >
                          <span className="text-xs">{f.name}</span>
                          {fontFamily === f.value && (
                            <Check size={14} className="text-[#00dbe9]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Word Wrap Card with Win11 Custom Toggle */}
                <div className="rounded-xl border border-[#3b494b]/40 bg-[#201f24] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-lg bg-[#2b2a31] border border-[#3b494b]/40 text-[#00dbe9]">
                      <span className="text-xs font-bold font-mono">Ab</span>
                    </div>
                    <div>
                      <h3 className="text-[13px] font-medium text-white">Word wrap</h3>
                      <p className="text-[11px] text-[#849495] mt-0.5">Fit text within the editor window by default</p>
                    </div>
                  </div>
                  
                  {/* Windows 11 Toggle Switch */}
                  <button
                    onClick={() => setWordWrap(!wordWrap)}
                    className="flex items-center group cursor-pointer focus:outline-none"
                  >
                    <span className="text-xs font-medium text-[#b9cacb] mr-3 uppercase tracking-wider min-w-[24px] text-right">
                      {wordWrap ? "On" : "Off"}
                    </span>
                    <div className={`w-10 h-5 rounded-full p-0.5 transition-all duration-200 ${
                      wordWrap ? "bg-[#00dbe9]" : "bg-transparent border border-[#b9cacb]/80"
                    } relative flex items-center`}>
                      <div className={`w-3.5 h-3.5 rounded-full transition-all duration-200 shadow-sm ${
                        wordWrap ? "translate-x-5 bg-[#00363a]" : "translate-x-0.5 bg-[#b9cacb]"
                      }`} />
                    </div>
                  </button>
                </div>

                {/* Status Bar Card with Win11 Toggle */}
                <div className="rounded-xl border border-[#3b494b]/40 bg-[#201f24] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-lg bg-[#2b2a31] border border-[#3b494b]/40 text-[#00dbe9]">
                      <span className="text-xs font-bold font-mono">Ln</span>
                    </div>
                    <div>
                      <h3 className="text-[13px] font-medium text-white">Status bar</h3>
                      <p className="text-[11px] text-[#849495] mt-0.5">Show helpful editor stats (cursor line/col, chars) at the bottom</p>
                    </div>
                  </div>
                  
                  {/* Windows 11 Toggle Switch */}
                  <button
                    onClick={() => setShowStatusBar(!showStatusBar)}
                    className="flex items-center group cursor-pointer focus:outline-none"
                  >
                    <span className="text-xs font-medium text-[#b9cacb] mr-3 uppercase tracking-wider min-w-[24px] text-right">
                      {showStatusBar ? "On" : "Off"}
                    </span>
                    <div className={`w-10 h-5 rounded-full p-0.5 transition-all duration-200 ${
                      showStatusBar ? "bg-[#00dbe9]" : "bg-transparent border border-[#b9cacb]/80"
                    } relative flex items-center`}>
                      <div className={`w-3.5 h-3.5 rounded-full transition-all duration-200 shadow-sm ${
                        showStatusBar ? "translate-x-5 bg-[#00363a]" : "translate-x-0.5 bg-[#b9cacb]"
                      }`} />
                    </div>
                  </button>
                </div>

              </div>
            </section>

          </main>

          {/* Right Column: About This App Sidebar (1/4 width) */}
          <aside className="lg:col-span-1 flex flex-col gap-6">
            
            {/* User Profile Card */}
            <div className="rounded-xl border border-[#3b494b]/40 bg-[#201f24] p-5 flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00dbe9]/10 border border-[#00dbe9]/30 text-[#00dbe9]">
                  <User size={16} />
                </div>
                <h2 className="text-[13px] font-semibold text-white tracking-wide">
                  Workspace profile
                </h2>
              </div>

              <p className="text-[11px] text-[#849495] leading-relaxed text-left">
                This profile is stored locally in Dexie database and included inside backup file metadata.
              </p>

              <div className="flex flex-col gap-3.5">
                {/* First Name Field */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#b9cacb]">First name</label>
                  <div className="relative flex items-center">
                    <input
                      ref={firstNameInputRef}
                      value={tempFirstName}
                      onChange={(e) => setTempFirstName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveFirstName();
                        } else if (e.key === "Escape") {
                          handleCancelFirstName();
                        }
                      }}
                      placeholder="E.g., John"
                      className="w-full rounded-lg border border-[#3b494b] hover:border-[#00dbe9]/50 bg-[#131317] pl-3 pr-16 py-2 text-xs outline-none focus:border-[#00dbe9] text-white placeholder:text-[#555] transition-all"
                    />
                    {tempFirstName !== profile.firstName && (
                      <div className="absolute right-1.5 flex items-center gap-1 animate-in fade-in zoom-in duration-150">
                        <button
                          onClick={handleSaveFirstName}
                          className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition"
                          title="Confirm (Enter)"
                        >
                          <Check size={11} />
                        </button>
                        <button
                          onClick={handleCancelFirstName}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition"
                          title="Cancel (Esc)"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Name Field */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-[#b9cacb]">Last name</label>
                  <div className="relative flex items-center">
                    <input
                      value={tempLastName}
                      onChange={(e) => setTempLastName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveLastName();
                        } else if (e.key === "Escape") {
                          handleCancelLastName();
                        }
                      }}
                      placeholder="E.g., Doe"
                      className="w-full rounded-lg border border-[#3b494b] hover:border-[#00dbe9]/50 bg-[#131317] pl-3 pr-16 py-2 text-xs outline-none focus:border-[#00dbe9] text-white placeholder:text-[#555] transition-all"
                    />
                    {tempLastName !== profile.lastName && (
                      <div className="absolute right-1.5 flex items-center gap-1 animate-in fade-in zoom-in duration-150">
                        <button
                          onClick={handleSaveLastName}
                          className="p-1 rounded bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition"
                          title="Confirm (Enter)"
                        >
                          <Check size={11} />
                        </button>
                        <button
                          onClick={handleCancelLastName}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 transition"
                          title="Cancel (Esc)"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About card */}
            <div className="rounded-xl border border-[#3b494b]/40 bg-[#201f24] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#00dbe9]/10 border border-[#00dbe9]/30 text-[#00dbe9]">
                  <Info size={16} />
                </div>
                <h2 className="text-[13px] font-semibold text-white tracking-wide">
                  About this app
                </h2>
              </div>

              <div className="flex flex-col gap-1 mt-1">
                <span className="text-sm font-bold text-[#00dbe9]">MY Note</span>
                <span className="text-[11px] text-[#849495]">Version 1.1.0</span>
                <span className="text-[10px] text-[#849495]/80 mt-1">
                  © 2026 MY Note. All rights reserved.
                </span>
              </div>

              {/* Aura Labs Experiment Info */}
              <div className="border-t border-[#3b494b]/20 pt-3.5 flex flex-col gap-2 text-[11px] leading-relaxed text-[#b9cacb] text-left">
                <p>
                  MY Note is an experiment from Aura Labs. To explore more procedural interfaces,{" "}
                  <a
                    href="https://labs.aura360studio.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00dbe9] hover:underline inline-flex items-center gap-0.5"
                  >
                    check our lab
                    <ExternalLink size={10} />
                  </a>
                  .
                </p>
                <div className="mono-ui text-[9px] uppercase tracking-[0.12em] text-[#849495] font-bold mt-1.5">
                  POWERED BY{" "}
                  <a
                    href="https://aura360studio.com/showcase"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00dbe9] hover:underline inline-flex items-center gap-0.5"
                  >
                    AURA360STUDIO
                    <ExternalLink size={8} />
                  </a>
                </div>
              </div>

              <div className="border-t border-[#3b494b]/30 pt-3 flex flex-col gap-2 text-[11px]">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalModal("license");
                  }}
                  className="inline-flex items-center gap-1.5 text-[#00dbe9] hover:underline cursor-pointer"
                >
                  Software License Terms
                  <ExternalLink size={10} />
                </a>
                <a
                  href="/services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#00dbe9] hover:underline cursor-pointer"
                >
                  Services Agreement
                  <ExternalLink size={10} />
                </a>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#00dbe9] hover:underline cursor-pointer"
                >
                  Privacy Statement
                  <ExternalLink size={10} />
                </a>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openLegalModal("acknowledgments");
                  }}
                  className="inline-flex items-center gap-1.5 text-[#00dbe9] hover:underline cursor-pointer"
                >
                  Third-Party Acknowledgments
                  <ExternalLink size={10} />
                </a>
              </div>

              <div className="border-t border-[#3b494b]/30 pt-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#2d2c34] hover:bg-[#383740] border border-[#3b494b]/40 rounded-lg py-2 text-xs font-semibold text-[#b9cacb] hover:text-white transition duration-150"
                >
                  <MessageSquare size={13} />
                  Send feedback
                </button>
                <button
                  onClick={() => setIsHelpModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#2d2c34] hover:bg-[#383740] border border-[#3b494b]/40 rounded-lg py-2 text-xs font-semibold text-[#b9cacb] hover:text-white transition duration-150"
                >
                  <HelpCircle size={13} />
                  Help
                </button>
              </div>
            </div>

          </aside>

        </div>

      </div>
      
      <LegalModal
        isOpen={isLegalModalOpen}
        type={legalModalType}
        onClose={() => setIsLegalModalOpen(false)}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
