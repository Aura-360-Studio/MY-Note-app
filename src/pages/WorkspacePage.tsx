import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleUserRound,
  Download,
  FolderOpen,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  Wifi,
  WifiOff,
  X,
  Menu,
  Check,
  FileText,
  Pin,
  ChevronDown,
  Bold,
  Italic,
  Strikethrough,
  Link,
  Table,
  List,
  Type,
  Bell,
  BellRing,
  ShieldAlert,
  ExternalLink,
  Monitor
} from "lucide-react";
import { BoardView } from "../features/board/components/BoardView";
import { NoteEditor } from "../features/notes/components/NoteEditor";
import { useNotesStore } from "../features/notes/stores/useNotesStore";
import { NOTE_STATUSES } from "../features/notes/types/note.types";
import {
  exportWorkspace,
  importWorkspace
} from "../features/backup/services/backup.service";
import {
  isTypingTarget,
  useKeyboardShortcuts
} from "../shared/hooks/useKeyboardShortcuts";
import { usePwaInstall } from "../shared/hooks/usePwaInstall";
import { usePwaUpdate } from "../shared/hooks/usePwaUpdate";
import { useOnlineStatus } from "../shared/hooks/useOnlineStatus";
import { DEFAULT_PROJECT_ID } from "../features/projects/types/project.types";
import { useConfirmationStore } from "../shared/hooks/useConfirmationStore";
import { ConfirmationModal } from "../shared/components/ConfirmationModal";
import { SyncConflictModal } from "../shared/components/SyncConflictModal";
import { SplashScreen } from "../shared/components/SplashScreen";
import { SettingsPage } from "./SettingsPage";

type MainView = "board" | "projects";

export function WorkspacePage(): React.JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [mainView, setMainView] = useState<MainView>("board");
  const [showSettingsPage, setShowSettingsPage] = useState(false);
  const [settingsInitialSection, setSettingsInitialSection] = useState<"profile" | "appearance" | "font" | "backup" | "network" | null>(null);
  const [fontFamily, setFontFamily] = useState<string>(() => {
    return localStorage.getItem("notepad_font_family") || "Geist";
  });
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("notepad_theme") || "dark";
  });
  const [newProjectName, setNewProjectName] = useState("");
  const [importSummary, setImportSummary] = useState<string | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCatalogCreatingProject, setIsCatalogCreatingProject] =
    useState(false);
  const [inlineProjectName, setInlineProjectName] = useState("");
  const [isBoardCreatingNote, setIsBoardCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const confirm = useConfirmationStore((state) => state.confirm);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const tabStripRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isOnline = useOnlineStatus();
  const { canInstall, installState, promptInstall } = usePwaInstall();
  const { applyUpdate, isUpdateAvailable } = usePwaUpdate();

  const isPwaInstalled = useMemo(() => {
    if (typeof window === "undefined") return false;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
                         window.matchMedia("(display-mode: minimal-ui)").matches ||
                         (navigator as any).standalone === true;
    return isStandalone || installState === "installed";
  }, [installState]);
  const {
    createNote,
    createProject,
    isLoaded,
    load,
    moveNote,
    notes,
    profile,
    projects,
    removeNote,
    removeProject,
    replaceAll,
    replaceProfile,
    selectedNoteId,
    selectedProjectId,
    selectNote,
    selectProject,
    updateNote,
    updateProfile,
    lastBackupTime,
    lastEditTime,
    recordBackup,
    recordEdit
  } = useNotesStore();

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  const backupDiff = useMemo(() => {
    if (!lastBackupTime) {
      return { days: 0, months: 0, years: 0, formatted: "Never backed up", totalDays: Infinity };
    }
    const lastBackup = new Date(lastBackupTime);
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
  }, [lastBackupTime]);

  const hasBackupAlert = useMemo(() => {
    if (!lastBackupTime) return true;
    const hasEdits = new Date(lastEditTime).getTime() > new Date(lastBackupTime).getTime();
    return hasEdits && backupDiff.totalDays >= 1;
  }, [lastBackupTime, lastEditTime, backupDiff.totalDays]);

  const handleTriggerQuickBackup = () => {
    exportWorkspace(notes, profile, projects, {
      theme,
      fontFamily,
      wordWrap,
      showStatusBar,
      zoomPercent
    });
    recordBackup();
  };

  const [openNoteIds, setOpenNoteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("notepad_open_note_ids");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isMaximized, setIsMaximized] = useState(false);
  const [minimizedNoteIds, setMinimizedNoteIds] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | null>(null);
  const [zoomPercent, setZoomPercent] = useState<number>(() => {
    const saved = localStorage.getItem("notepad_zoom");
    return saved ? Number(saved) : 100;
  });
  const [wordWrap, setWordWrap] = useState<boolean>(() => {
    const saved = localStorage.getItem("notepad_wordwrap");
    return saved ? saved === "true" : true;
  });
  const [showStatusBar, setShowStatusBar] = useState<boolean>(() => {
    const saved = localStorage.getItem("notepad_statusbar");
    return saved ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("notepad_open_note_ids", JSON.stringify(openNoteIds));
  }, [openNoteIds]);

  useEffect(() => {
    localStorage.setItem("notepad_zoom", String(zoomPercent));
  }, [zoomPercent]);

  useEffect(() => {
    localStorage.setItem("notepad_wordwrap", String(wordWrap));
  }, [wordWrap]);

  useEffect(() => {
    localStorage.setItem("notepad_statusbar", String(showStatusBar));
  }, [showStatusBar]);

  useEffect(() => {
    localStorage.setItem("notepad_font_family", fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem("notepad_theme", theme);
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
  }, [theme]);

  useEffect(() => {
    if (selectedNoteId && !openNoteIds.includes(selectedNoteId)) {
      setOpenNoteIds((prev) => [...prev, selectedNoteId]);
    }
  }, [selectedNoteId, openNoteIds]);

  // When user clicks a minimized note from the board, restore it automatically
  useEffect(() => {
    if (selectedNoteId && minimizedNoteIds.includes(selectedNoteId)) {
      setMinimizedNoteIds((prev) => prev.filter((id) => id !== selectedNoteId));
    }
  }, [selectedNoteId]);

  // Scroll tab strip to end so new tab is always visible after creation
  useEffect(() => {
    const el = tabStripRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [openNoteIds.length]);


  async function handleNewTab(): Promise<void> {
    await createNote();
  }

  function handleCloseTab(noteId: string): void {
    const nextTabs = openNoteIds.filter((id) => id !== noteId);
    setOpenNoteIds(nextTabs);
    
    if (selectedNoteId === noteId) {
      if (nextTabs.length > 0) {
        const idx = openNoteIds.indexOf(noteId);
        const newActiveId = nextTabs[Math.min(idx, nextTabs.length - 1)];
        selectNote(newActiveId ?? null);
      } else {
        selectNote(null);
      }
    }
  }

  function handleSaveVisual(): void {
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    }, 800);
  }

  function handleZoomChange(action: "in" | "out" | "reset"): void {
    if (action === "in") {
      setZoomPercent((z) => Math.min(z + 10, 300));
    } else if (action === "out") {
      setZoomPercent((z) => Math.max(z - 10, 50));
    } else {
      setZoomPercent(100);
    }
  }

  function toggleMenu(name: string): void {
    setOpenMenu(openMenu === name ? null : name);
  }

  function handlePopOutNotepad(): void {
    const tabIds = openNoteIds.join(",");
    const activeId = selectedNoteId || openNoteIds[0] || "";
    const width = 1024;
    const height = 720;
    const left = Math.round((window.screen.width - width) / 2 + ((window.screen as any).availLeft || 0));
    const top = Math.round((window.screen.height - height) / 2 + ((window.screen as any).availTop || 0));
    const features = `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`;
    window.open(
      `/editor?tabs=${encodeURIComponent(tabIds)}&active=${encodeURIComponent(activeId)}`,
      "my-note-floating-notepad",
      features
    );
    // Close the editor panel in the main window
    selectNote(null);
    setIsMaximized(false);
  }

  const visibleNotes = useMemo(() => {
    const projectNotes = notes.filter(
      (note) => note.projectId === selectedProjectId
    );
    if (!query.trim()) {
      return projectNotes;
    }
    const lowered = query.toLowerCase();
    return projectNotes.filter((note) =>
      `${note.title}\n${note.content}\n${note.tags.join(" ")}`
        .toLowerCase()
        .includes(lowered)
    );
  }, [notes, query, selectedProjectId]);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );

  useEffect(() => {
    if (!isLoaded) {
      void load();
    }
  }, [isLoaded, load]);

  async function handleImport(file: File): Promise<void> {
    try {
      const imported = await importWorkspace(file);
      await replaceAll(imported.notes, imported.projects);
      await replaceProfile(imported.profile);
      if (imported.settings) {
        if (imported.settings.theme) setTheme(imported.settings.theme);
        if (imported.settings.fontFamily) setFontFamily(imported.settings.fontFamily);
        if (imported.settings.wordWrap !== undefined) setWordWrap(imported.settings.wordWrap);
        if (imported.settings.showStatusBar !== undefined) setShowStatusBar(imported.settings.showStatusBar);
        if (imported.settings.zoomPercent !== undefined) setZoomPercent(imported.settings.zoomPercent);
      }
      setImportSummary(
        `Imported backup for ${imported.profile.firstName || "-"} ${imported.profile.lastName || "-"}`.trim()
      );
      setError(null);
    } catch {
      setError("Import failed. Please use a valid MY Note backup file.");
    }
  }

  async function handleCreateProject(): Promise<void> {
    const trimmed = newProjectName.trim();
    if (!trimmed) {
      return;
    }
    await createProject(trimmed);
    setNewProjectName("");
    setIsCatalogCreatingProject(false);
  }

  async function handleCreateProjectInline(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    await createProject(trimmed);
    setInlineProjectName("");
    setIsCreatingProject(false);
    setMainView("board");
  }

  async function handleCreateNoteInline(): Promise<void> {
    const trimmed = newNoteTitle.trim();
    if (!trimmed) {
      return;
    }
    await createNote(trimmed);
    setNewNoteTitle("");
    setIsBoardCreatingNote(false);
  }

  useKeyboardShortcuts([
    {
      key: "n",
      ctrlOrMeta: true,
      handler: (event) => {
        event.preventDefault();
        void handleNewTab();
      }
    },
    {
      key: "t",
      ctrlOrMeta: true,
      handler: (event) => {
        if (selectedNoteId) {
          event.preventDefault();
          void handleNewTab();
        }
      }
    },
    {
      key: "w",
      ctrlOrMeta: true,
      handler: (event) => {
        if (selectedNoteId) {
          event.preventDefault();
          handleCloseTab(selectedNoteId);
        }
      }
    },
    {
      key: "f",
      ctrlOrMeta: true,
      handler: (event) => {
        event.preventDefault();
        searchRef.current?.focus();
      }
    },
    {
      key: "s",
      ctrlOrMeta: true,
      handler: (event) => {
        event.preventDefault();
        if (selectedNoteId) {
          handleSaveVisual();
        } else {
          exportWorkspace(notes, profile, projects, {
            theme,
            fontFamily,
            wordWrap,
            showStatusBar,
            zoomPercent
          });
          recordBackup();
        }
      }
    },
    {
      key: "f5",
      handler: (event) => {
        if (selectedNoteId) {
          event.preventDefault();
          window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "datetime" } }));
        }
      }
    },
    {
      key: "delete",
      handler: (event) => {
        if (isTypingTarget(event.target) || !selectedNote) {
          return;
        }
        event.preventDefault();
        void removeNote(selectedNote.id);
      }
    },
    {
      key: "escape",
      handler: () => {
        selectNote(null);
      }
    }
  ]);

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#131313] text-[#e5e2e1]">
      <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#3b494b] bg-[#131313]/90 px-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsSidebarCollapsed((v) => !v)}
            className="rounded-full p-2 text-[#b9cacb] hover:bg-[#2a2a2a] hover:text-[#00dbe9] transition"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu size={20} />
          </button>
          <h1 className="flex items-center select-none" title="MY Note">
            <img
              src="/imges/MY Note logo landscape.png"
              alt="MY Note Logo"
              className="h-7 w-auto object-contain"
            />
          </h1>
          <div className="flex items-center gap-1.5 bg-[#0e0e0e]/90 border border-[#3b494b]/60 rounded-full p-1">
            <button
              onClick={() => setMainView("board")}
              className={`mono-ui px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                mainView === "board"
                  ? "bg-[#00dbe9] text-[#00363a] shadow-sm shadow-[#00dbe9]/10"
                  : "text-[#b9cacb] hover:text-white"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setMainView("projects")}
              className={`mono-ui px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                mainView === "projects"
                  ? "bg-[#00dbe9] text-[#00363a] shadow-sm shadow-[#00dbe9]/10"
                  : "text-[#b9cacb] hover:text-white"
              }`}
            >
              Projects
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 rounded-full border border-[#3b494b] bg-[#0e0e0e] px-3 py-1.5">
            <Search size={16} className="text-[#b9cacb]" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search . . ."
              className="mono-ui w-44 bg-transparent text-sm text-white outline-none placeholder:text-[#849495]"
            />
          </label>
          <button
            onClick={() => void createNote()}
            className="mono-ui inline-flex items-center gap-2 rounded-full border border-[#00dbe9] px-4 py-1.5 text-[11px] uppercase tracking-wider text-[#00dbe9] hover:bg-[#00dbe9]/10"
          >
            <Plus size={14} />
            New Task
          </button>
          <div className="ml-2 flex items-center gap-3 border-l border-[#3b494b] pl-4 text-[#b9cacb]">
            
            {/* Notification Bell Button */}
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => setShowNotificationDropdown((v) => !v)}
                className={`relative rounded-full p-2 text-[#b9cacb] hover:bg-[#2a2a2a] hover:text-[#00dbe9] transition ${
                  showNotificationDropdown ? "bg-[#2a2a2a] text-[#00dbe9]" : ""
                }`}
                title="Workspace Alerts"
              >
                {hasBackupAlert ? (
                  <BellRing size={16} className="text-[#00dbe9]" />
                ) : (
                  <Bell size={16} />
                )}
                {hasBackupAlert ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-[#131313] animate-pulse" />
                ) : !isPwaInstalled ? (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00dbe9] border border-[#131313]" />
                ) : null}
              </button>

              {/* Notification Dropdown overlay clickaway handler */}
              {showNotificationDropdown && (
                <div
                  className="fixed inset-0 z-50 bg-transparent cursor-default"
                  onClick={() => setShowNotificationDropdown(false)}
                />
              )}

              {/* Notification Dropdown overlay */}
              {showNotificationDropdown && (
                <div className="absolute right-0 top-11 w-80 bg-[#1a1a1a] border border-[#3b494b] rounded-2xl shadow-2xl py-3 px-4 z-[60] flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-[#3b494b]/40">
                    <span className="mono-ui text-[10px] font-bold text-[#00dbe9] tracking-[0.14em] uppercase">
                      Workspace Alerts
                    </span>
                    <button
                      onClick={() => setShowNotificationDropdown(false)}
                      className="text-[#849495] hover:text-white transition"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  {!isPwaInstalled || hasBackupAlert ? (
                    <div className="flex flex-col gap-3">
                      {/* PWA Install Notification */}
                      {!isPwaInstalled && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-[#00dbe9]/[0.03] border border-[#00dbe9]/20 text-[#00dbe9]">
                            <Monitor size={16} className="text-[#00dbe9] flex-shrink-0 mt-0.5" />
                            <div className="flex-1 text-[11px] leading-relaxed text-left">
                              <p className="font-semibold text-white">Install Desktop App</p>
                              <p className="text-[#849495] mt-1">
                                Install it as a desktop app — since it's a Progressive Web App, you can install it from your browser for a native-like experience with its own window and taskbar icon.
                              </p>
                            </div>
                          </div>
                          {canInstall && (
                            <button
                              onClick={() => {
                                void promptInstall();
                                setShowNotificationDropdown(false);
                              }}
                              className="w-full flex items-center justify-center gap-2 bg-[#00dbe9]/10 hover:bg-[#00dbe9]/20 text-[#00dbe9] border border-[#00dbe9]/30 font-bold text-[10px] uppercase tracking-wider py-1.5 rounded-full transition duration-150"
                            >
                              <Download size={12} />
                              Install App
                            </button>
                          )}
                        </div>
                      )}

                      {/* Divider if both are present */}
                      {!isPwaInstalled && hasBackupAlert && (
                        <div className="border-t border-[#3b494b]/30 my-1" />
                      )}

                      {/* Backup Alert */}
                      {hasBackupAlert && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-500/[0.03] border border-rose-500/20 text-rose-300">
                            <ShieldAlert size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 text-[11px] leading-relaxed text-left">
                              <p className="font-semibold text-white">Backup Highly Recommended</p>
                              <p className="text-[#849495] mt-1">
                                Your workspace contains unsaved changes since your last backup, posing a data loss risk if browser cache is cleared.
                              </p>
                              <p className="mt-2 text-white font-medium">
                                Last Backed Up: <span className="text-[#849495]">{lastBackupTime ? `${backupDiff.formatted} (${new Date(lastBackupTime).toLocaleDateString()})` : "Never"}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              handleTriggerQuickBackup();
                              setShowNotificationDropdown(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-[#00dbe9] hover:bg-[#00dbe9]/85 text-[#00363a] font-bold text-[10px] uppercase tracking-wider py-2 rounded-full shadow-lg shadow-[#00dbe9]/10 transition duration-150"
                          >
                            <Download size={13} />
                            Backup Now
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-[11px] text-[#849495] gap-2">
                      <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white">All Caught Up!</p>
                        <p className="mt-0.5 text-[#849495]">Your workspace is fully backed up. No alerts active.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={() => {
              setSettingsInitialSection("appearance");
              setShowSettingsPage(true);
            }}>
              <Settings size={16} />
            </button>
            <button
              onClick={() => {
                setSettingsInitialSection("profile");
                setShowSettingsPage(true);
              }}
              className="rounded-full border border-[#3b494b] overflow-hidden flex items-center justify-center transition hover:border-[#00dbe9]"
              title={profile.firstName || profile.lastName ? `Profile: ${profile.firstName} ${profile.lastName}`.trim() : "Profile"}
            >
              {profile.firstName?.trim() || profile.lastName?.trim() ? (
                <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-[#00dbe9] to-[#006e78] text-[#00363a] font-bold text-[10px] tracking-wider uppercase select-none">
                  {((profile.firstName?.trim().charAt(0) || "") + (profile.lastName?.trim().charAt(0) || "")).toUpperCase()}
                </div>
              ) : (
                <div className="p-1 text-[#b9cacb] hover:text-white flex items-center justify-center">
                  <CircleUserRound size={16} />
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-64px)] w-[240px] border-r border-[#3b494b] bg-[#201f1f] p-4 flex flex-col justify-between transition-all duration-300 z-40 ${
          isSidebarCollapsed ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-thin">
          <div className="flex flex-col gap-2.5 mb-6 px-2 select-none">
            <img
              src="/imges/MY Note logo landscape.png"
              alt="MY Note Logo"
              className="h-8 w-auto object-contain self-start"
            />
            <p className="mono-ui text-[9px] text-[#849495] uppercase tracking-[0.25em] font-bold pl-0.5">
              WORKSPACE
            </p>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setMainView("board")}
              className={`mono-ui w-full rounded-full px-4 py-2.5 text-left text-[11px] uppercase tracking-wider transition ${mainView === "board" ? "bg-[#00dbe9] text-[#00363a]" : "text-[#b9cacb] hover:bg-[#2a2a2a]"}`}
            >
              Board
            </button>
            <button
              onClick={() => setMainView("projects")}
              className={`mono-ui w-full rounded-full px-4 py-2.5 text-left text-[11px] uppercase tracking-wider transition ${mainView === "projects" ? "bg-[#00dbe9] text-[#00363a]" : "text-[#b9cacb] hover:bg-[#2a2a2a]"}`}
            >
              Projects
            </button>
          </div>

          <div className="pt-4 border-t border-[#3b494b]/60">
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="mono-ui text-[10px] uppercase tracking-widest text-[#849495] font-semibold">
                Projects
              </h3>
              <button
                onClick={() => {
                  setIsCreatingProject((prev) => !prev);
                  if (isCreatingProject) setInlineProjectName("");
                }}
                className="rounded-full p-1 text-[#b9cacb] hover:bg-[#2a2a2a] hover:text-[#00dbe9] transition"
                title={isCreatingProject ? "Cancel" : "Create Project"}
              >
                {isCreatingProject ? <X size={14} /> : <Plus size={14} />}
              </button>
            </div>

            {isCreatingProject && (
              <div className="mb-3 px-2 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <input
                  autoFocus
                  value={inlineProjectName}
                  onChange={(e) => setInlineProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      void handleCreateProjectInline(inlineProjectName);
                    } else if (e.key === "Escape") {
                      setIsCreatingProject(false);
                      setInlineProjectName("");
                    }
                  }}
                  placeholder="New Project Name..."
                  className="flex-1 rounded-lg border border-[#3b494b] bg-[#131313] px-3 py-1.5 text-xs text-white outline-none focus:border-[#00dbe9] transition placeholder:text-[#555] min-w-0"
                />
                <button
                  onClick={() =>
                    void handleCreateProjectInline(inlineProjectName)
                  }
                  disabled={!inlineProjectName.trim()}
                  className="rounded-lg bg-[#00dbe9] hover:bg-[#00dbe9]/80 text-[#00363a] p-1.5 transition flex-shrink-0 disabled:opacity-40 disabled:hover:bg-[#00dbe9]"
                  title="Create Project"
                >
                  <Check size={13} />
                </button>
              </div>
            )}

            <div className="space-y-1 max-h-[220px] overflow-y-auto">
              {projects.map((project) => {
                const isActive =
                  project.id === selectedProjectId && mainView === "board";
                return (
                  <div
                    key={project.id}
                    className={`group flex items-center justify-between rounded-full px-3 py-1.5 transition ${
                      isActive
                        ? "bg-[#2a2a2a] border border-[#00dbe9]/40 text-[#00dbe9]"
                        : "text-[#b9cacb] hover:bg-[#2a2a2a]/60 hover:text-white"
                    }`}
                  >
                    <button
                      onClick={() => {
                        selectProject(project.id);
                        setMainView("board");
                      }}
                      className="flex-1 text-left truncate text-[12px] font-medium"
                      title={project.name}
                    >
                      {project.name}
                    </button>
                    {project.id !== DEFAULT_PROJECT_ID && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirm({
                            title: "Delete project?",
                            message: "This will delete",
                            targetName: project.name,
                            helperText:
                              "All its tasks will be moved to the General workspace.",
                            confirmText: "Delete",
                            onConfirm: () => void removeProject(project.id)
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-[#b9cacb] hover:text-red-400 rounded transition"
                        title="Delete Project"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => void createNote()}
            className="mono-ui w-full rounded-full border border-dashed border-[#3b494b] py-2.5 text-[11px] uppercase tracking-wider text-[#b9cacb] hover:border-[#00dbe9] hover:text-[#00dbe9] transition"
          >
            + New Note
          </button>
        </div>

        <div className="pt-4 border-t border-[#3b494b] space-y-1">
          <button
            onClick={() => {
              setSettingsInitialSection("appearance");
              setShowSettingsPage(true);
            }}
            className={`mono-ui w-full rounded-full px-4 py-2 text-left text-[11px] uppercase tracking-wider transition ${showSettingsPage ? "bg-[#2a2a2a] text-[#00dbe9]" : "text-[#b9cacb] hover:bg-[#2a2a2a]"}`}
          >
            Settings
          </button>
          <div className="px-4 py-2 flex items-center justify-between text-[11px] text-[#849495] uppercase tracking-wider mono-ui">
            <span>Offline mode</span>
            <span className={isOnline ? "text-[#00dbe9]" : "text-amber-500"}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="px-4 pt-2.5 pb-1 flex items-center justify-center gap-2.5 border-t border-[#3b494b]/30 text-[9px] text-[#849495]/70 uppercase tracking-widest font-semibold mono-ui select-none">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dbe9] hover:underline transition duration-150">Privacy</a>
            <span>•</span>
            <a href="/services" target="_blank" rel="noopener noreferrer" className="hover:text-[#00dbe9] hover:underline transition duration-150">Terms</a>
          </div>
        </div>
      </aside>

      <div
        className={`mt-16 h-[calc(100vh-64px)] overflow-auto p-6 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-0" : "ml-[240px]"
        }`}
      >
        {error ? (
          <p className="mb-4 rounded border border-red-400/60 bg-red-900/20 p-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}
        {importSummary ? (
          <p className="mb-4 rounded border border-[#00dbe9]/60 bg-[#00dbe9]/10 p-2 text-sm text-[#00dbe9]">
            {importSummary}
          </p>
        ) : null}



        {mainView === "projects" ? (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#3b494b]/60 pb-3 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="mono-ui text-xs font-semibold uppercase tracking-widest text-[#00dbe9]">
                  Active Workspace
                </span>
                <span className="text-[#3b494b]">/</span>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  All Projects
                </h2>
                <span className="rounded-full bg-[#00dbe9]/10 border border-[#00dbe9]/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#00dbe9] mono-ui">
                  Catalog
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-xs text-[#b9cacb] mono-ui">
                  {projects.length} Project{projects.length !== 1 ? "s" : ""}
                </div>

                <div className="flex items-center gap-2">
                  {isCatalogCreatingProject && (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-200">
                      <input
                        autoFocus
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            void handleCreateProject();
                          } else if (e.key === "Escape") {
                            setIsCatalogCreatingProject(false);
                            setNewProjectName("");
                          }
                        }}
                        placeholder="New Project Name..."
                        className="rounded-full border border-[#3b494b] bg-[#131313] px-3 py-1.5 text-xs text-white outline-none focus:border-[#00dbe9] transition placeholder:text-[#555] min-w-0 w-44"
                      />
                      <button
                        onClick={() => void handleCreateProject()}
                        disabled={!newProjectName.trim()}
                        className="rounded-full bg-[#00dbe9] hover:bg-[#00dbe9]/80 text-[#00363a] p-1.5 transition flex-shrink-0 disabled:opacity-40 disabled:hover:bg-[#00dbe9]"
                        title="Create Project"
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setIsCatalogCreatingProject((prev) => !prev);
                      if (isCatalogCreatingProject) setNewProjectName("");
                    }}
                    className="rounded-full p-1.5 text-[#b9cacb] hover:bg-[#2a2a2a] hover:text-[#00dbe9] transition flex items-center justify-center border border-[#3b494b]/60"
                    title={
                      isCatalogCreatingProject ? "Cancel" : "Create Project"
                    }
                  >
                    {isCatalogCreatingProject ? (
                      <X size={14} />
                    ) : (
                      <Plus size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="rounded-3xl border border-[#3b494b] bg-[#201f1f] p-6"
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div className="rounded-full bg-[#2a2a2a] p-3">
                      <FolderOpen size={18} className="text-[#00dbe9]" />
                    </div>
                    {project.id === DEFAULT_PROJECT_ID ? (
                      <span className="mono-ui rounded-full bg-[#00dbe9] px-3 py-1 text-[10px] uppercase tracking-wider text-[#00363a]">
                        System Default
                      </span>
                    ) : null}
                  </div>
                  <button
                    onClick={() => {
                      selectProject(project.id);
                      setMainView("board");
                    }}
                    className="mb-1 text-left text-4xl font-semibold hover:text-[#00dbe9]"
                  >
                    {project.name}
                  </button>
                  <p className="text-lg text-[#b9cacb]">
                    Project workspace for notes and task stages.
                  </p>
                  {project.id !== DEFAULT_PROJECT_ID ? (
                    <button
                      onClick={() => {
                        confirm({
                          title: "Delete project?",
                          message: "This will delete",
                          targetName: project.name,
                          helperText:
                            "All its tasks will be moved to the General workspace.",
                          confirmText: "Delete",
                          onConfirm: () => void removeProject(project.id)
                        });
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#3b494b] px-3 py-1 text-sm text-[#b9cacb] hover:border-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#3b494b]/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="mono-ui text-xs font-semibold uppercase tracking-widest text-[#00dbe9]">
                  Active Workspace
                </span>
                <span className="text-[#3b494b]">/</span>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  {projects.find((p) => p.id === selectedProjectId)?.name ||
                    "General"}
                </h2>
                <span className="rounded-full bg-[#00dbe9]/10 border border-[#00dbe9]/30 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#00dbe9] mono-ui">
                  Board
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-xs text-[#b9cacb] mono-ui">
                  {visibleNotes.length} Note
                  {visibleNotes.length !== 1 ? "s" : ""}
                </div>

                <div className="flex items-center gap-2">
                  {isBoardCreatingNote && (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1 duration-200">
                      <input
                        autoFocus
                        value={newNoteTitle}
                        onChange={(e) => setNewNoteTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            void handleCreateNoteInline();
                          } else if (e.key === "Escape") {
                            setIsBoardCreatingNote(false);
                            setNewNoteTitle("");
                          }
                        }}
                        placeholder="New Note Title..."
                        className="rounded-full border border-[#3b494b] bg-[#131313] px-3 py-1.5 text-xs text-white outline-none focus:border-[#00dbe9] transition placeholder:text-[#555] min-w-0 w-44"
                      />
                      <button
                        onClick={() => void handleCreateNoteInline()}
                        disabled={!newNoteTitle.trim()}
                        className="rounded-full bg-[#00dbe9] hover:bg-[#00dbe9]/80 text-[#00363a] p-1.5 transition flex-shrink-0 disabled:opacity-40 disabled:hover:bg-[#00dbe9]"
                        title="Create Note"
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setIsBoardCreatingNote((prev) => !prev);
                      if (isBoardCreatingNote) setNewNoteTitle("");
                    }}
                    className="rounded-full p-1.5 text-[#b9cacb] hover:bg-[#2a2a2a] hover:text-[#00dbe9] transition flex items-center justify-center border border-[#3b494b]/60"
                    title={isBoardCreatingNote ? "Cancel" : "Create Note"}
                  >
                    {isBoardCreatingNote ? <X size={14} /> : <Plus size={14} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="relative">
              <BoardView
                notes={visibleNotes}
                selectedNoteId={selectedNoteId}
                onSelectNote={(id) => {
                  // If the note is minimized, restore it
                  if (minimizedNoteIds.includes(id)) {
                    setMinimizedNoteIds((prev) => prev.filter((mid) => mid !== id));
                  }
                  selectNote(id);
                }}
                onMoveNote={moveNote}
              />
            </div>
          </section>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleImport(file);
          }
          event.target.value = "";
        }}
      />

      {selectedNote && !minimizedNoteIds.includes(selectedNoteId ?? "") ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 sm:p-6 md:p-8">
          <div
            className={`w-full overflow-hidden transition-all duration-300 border border-[#3b494b] bg-[#131313] flex flex-col ${
              isMaximized
                ? "fixed inset-0 z-[60] h-screen w-screen max-w-none rounded-none border-none"
                : "max-w-5xl h-[85vh] rounded-3xl shadow-2xl"
            }`}
          >
            {/* Title / Tab Bar */}
            <div className="flex h-11 items-center border-b border-[#3b494b] bg-[#1a1a1a] select-none flex-shrink-0 min-w-0">
              {/* App icon */}
              <div className="flex-shrink-0 pl-4 pr-2 text-[#00dbe9]">
                <FileText size={15} />
              </div>


              {/* Tab strip — + button lives inside so it stays right after the last tab */}
              <div ref={tabStripRef} className="flex items-end gap-1 h-full overflow-x-auto no-scrollbar flex-1 min-w-0">
                {openNoteIds.map((id) => {
                  const tabNote = notes.find((n) => n.id === id);
                  if (!tabNote) return null;
                  const isActive = id === selectedNoteId;
                  const isTabPinned = tabNote.tags?.includes("pinned");
                  return (
                    <div
                      key={id}
                      onClick={() => selectNote(id)}
                      className={`group flex items-center gap-2 h-9 px-3 border-t border-x rounded-t-lg text-[11px] font-medium cursor-pointer transition-all duration-200 select-none flex-shrink-0 ${
                        isActive
                          ? "bg-[#131313] border-[#3b494b] text-white"
                          : "bg-[#252525] border-transparent text-[#b9cacb] hover:bg-[#2d2d2d] hover:text-white"
                      }`}
                      style={{ minWidth: "120px", maxWidth: "160px" }}
                    >
                      {isTabPinned && (
                        <Pin size={9} className="text-[#00dbe9] flex-shrink-0 rotate-[45deg]" />
                      )}
                      <span className="truncate flex-1">
                        {tabNote.title || "Untitled note"}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(id);
                        }}
                        className="opacity-0 group-hover:opacity-100 hover:bg-[#333] rounded-full p-0.5 text-[#b9cacb] hover:text-white transition flex-shrink-0"
                        title="Close tab"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                })}

                {/* + New Tab — right next to the last tab */}
                <button
                  onClick={handleNewTab}
                  className="self-center ml-1 flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-[#00dbe9] transition"
                  title="New Tab (Ctrl+N)"
                >
                  <Plus size={13} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-[#b9cacb] text-xs">
                <button
                  onClick={() => {
                    if (selectedNoteId) {
                      setMinimizedNoteIds((prev) =>
                        prev.includes(selectedNoteId) ? prev : [...prev, selectedNoteId]
                      );
                    }
                  }}
                  className="w-8 h-8 rounded hover:bg-[#2a2a2a] flex items-center justify-center transition text-base"
                  title="Minimize"
                >
                  –
                </button>
                <button
                  onClick={() => handlePopOutNotepad()}
                  className="w-8 h-8 rounded hover:bg-[#00dbe9]/15 hover:text-[#00dbe9] flex items-center justify-center transition"
                  title="Pop out notepad to floating window"
                >
                  <ExternalLink size={13} />
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="w-8 h-8 rounded hover:bg-[#2a2a2a] flex items-center justify-center transition font-mono"
                  title={isMaximized ? "Restore" : "Maximize"}
                >
                  {isMaximized ? "❐" : "⬜"}
                </button>
                <button
                  onClick={() => {
                    if (selectedNoteId) {
                      setMinimizedNoteIds((prev) => prev.filter((id) => id !== selectedNoteId));
                    }
                    selectNote(null);
                    setIsMaximized(false);
                  }}
                  className="w-8 h-8 rounded hover:bg-red-600 hover:text-white flex items-center justify-center transition"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Transparent Backdrop to close opened dropdowns */}
            {openMenu && (
              <div
                className="fixed inset-0 z-45 bg-transparent"
                onClick={() => setOpenMenu(null)}
              />
            )}

            {/* Unified Menu & Formatting Toolbar Line */}
            <div className="relative flex h-10 items-center border-b border-[#3b494b] bg-[#1a1a1a] px-4 text-xs text-[#b9cacb] select-none flex-shrink-0 gap-1.5 z-48">
              {/* Menu items */}
              <div className="flex items-center gap-1">
                {/* File Menu */}
                <div className="relative h-full flex items-center">
                  <button
                    onClick={() => toggleMenu("file")}
                    onMouseEnter={() => openMenu && openMenu !== "heading" && openMenu !== "list" && setOpenMenu("file")}
                    className={`px-3 py-1.5 rounded transition ${
                      openMenu === "file"
                        ? "bg-[#2a2a2a] text-white"
                        : "hover:bg-[#2a2a2a] hover:text-white"
                    }`}
                  >
                    File
                  </button>
                  {openMenu === "file" && (
                    <div className="absolute left-0 top-8 w-48 bg-[#1a1a1a] border border-[#3b494b] rounded-lg shadow-xl py-1 z-50 text-[11px] text-[#b9cacb] animate-in fade-in duration-100 flex flex-col">
                      <button
                        onClick={() => {
                          void handleNewTab();
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>New Tab</span>
                        <span className="text-[#849495] text-[10px]">Ctrl+N</span>
                      </button>
                      <button
                        onClick={() => {
                          handleCloseTab(selectedNoteId!);
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>Close Tab</span>
                        <span className="text-[#849495] text-[10px]">Ctrl+W</span>
                      </button>
                      <button
                        onClick={() => {
                          handleSaveVisual();
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>Save</span>
                        <span className="text-[#849495] text-[10px]">Ctrl+S</span>
                      </button>
                      <div className="border-t border-[#3b494b]/40 my-1" />
                      <button
                        onClick={() => {
                          setOpenMenu(null);
                          confirm({
                            title: "Delete note?",
                            message: "This will delete",
                            targetName: selectedNote.title || "Untitled note",
                            helperText: "This action cannot be undone.",
                            confirmText: "Delete",
                            onConfirm: () => void removeNote(selectedNote.id)
                          });
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-red-500/10 hover:text-red-400 transition text-left"
                      >
                        <span>Delete Note</span>
                        <span className="text-red-400/50 text-[10px]">Delete</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Edit Menu */}
                <div className="relative h-full flex items-center">
                  <button
                    onClick={() => toggleMenu("edit")}
                    onMouseEnter={() => openMenu && openMenu !== "heading" && openMenu !== "list" && setOpenMenu("edit")}
                    className={`px-3 py-1.5 rounded transition ${
                      openMenu === "edit"
                        ? "bg-[#2a2a2a] text-white"
                        : "hover:bg-[#2a2a2a] hover:text-white"
                    }`}
                  >
                    Edit
                  </button>
                  {openMenu === "edit" && (
                    <div className="absolute left-0 top-8 w-48 bg-[#1a1a1a] border border-[#3b494b] rounded-lg shadow-xl py-1 z-50 text-[11px] text-[#b9cacb] animate-in fade-in duration-100 flex flex-col">
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "undo" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>Undo</span>
                        <span className="text-[#849495] text-[10px]">Ctrl+Z</span>
                      </button>
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "redo" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>Redo</span>
                        <span className="text-[#849495] text-[10px]">Ctrl+Y</span>
                      </button>
                      <div className="border-t border-[#3b494b]/40 my-1" />
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "datetime" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>Time/Date</span>
                        <span className="text-[#849495] text-[10px]">F5</span>
                      </button>
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "clear-all" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>Clear All</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Format Menu */}
                <div className="relative h-full flex items-center">
                  <button
                    onClick={() => toggleMenu("format")}
                    onMouseEnter={() => openMenu && openMenu !== "heading" && openMenu !== "list" && setOpenMenu("format")}
                    className={`px-3 py-1.5 rounded transition ${
                      openMenu === "format"
                        ? "bg-[#2a2a2a] text-white"
                        : "hover:bg-[#2a2a2a] hover:text-white"
                    }`}
                  >
                    Format
                  </button>
                  {openMenu === "format" && (
                    <div className="absolute left-0 top-8 w-44 bg-[#1a1a1a] border border-[#3b494b] rounded-lg shadow-xl py-1 z-50 text-[11px] text-[#b9cacb] animate-in fade-in duration-100 flex flex-col">
                      <button
                        onClick={() => {
                          setWordWrap(!wordWrap);
                          setOpenMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span className="w-3">{wordWrap ? "✓" : ""}</span>
                        <span>Word Wrap</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* View Menu */}
                <div className="relative h-full flex items-center">
                  <button
                    onClick={() => toggleMenu("view")}
                    onMouseEnter={() => openMenu && openMenu !== "heading" && openMenu !== "list" && setOpenMenu("view")}
                    className={`px-3 py-1.5 rounded transition ${
                      openMenu === "view"
                        ? "bg-[#2a2a2a] text-white"
                        : "hover:bg-[#2a2a2a] hover:text-white"
                    }`}
                  >
                    View
                  </button>
                  {openMenu === "view" && (
                    <div className="absolute left-0 top-8 w-48 bg-[#1a1a1a] border border-[#3b494b] rounded-lg shadow-xl py-1 z-50 text-[11px] text-[#b9cacb] animate-in fade-in duration-100 flex flex-col">
                      <button
                        onClick={() => {
                          handleZoomChange("in");
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>Zoom In</span>
                        <span className="text-[#849495] text-[10px]">Ctrl+Plus</span>
                      </button>
                      <button
                        onClick={() => {
                          handleZoomChange("out");
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>Zoom Out</span>
                        <span className="text-[#849495] text-[10px]">Ctrl+Minus</span>
                      </button>
                      <button
                        onClick={() => {
                          handleZoomChange("reset");
                          setOpenMenu(null);
                        }}
                        className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span>Restore Default Zoom</span>
                        <span className="text-[#849495] text-[10px]">Ctrl+0</span>
                      </button>
                      <div className="border-t border-[#3b494b]/40 my-1" />
                      <button
                        onClick={() => {
                          setShowStatusBar(!showStatusBar);
                          setOpenMenu(null);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                      >
                        <span className="w-3">{showStatusBar ? "✓" : ""}</span>
                        <span>Status Bar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Separator line */}
              <div className="w-[1px] h-4 bg-[#3b494b]/40 mx-2 flex-shrink-0" />

              {/* Formatting Toolbar Items */}
              <div className="flex items-center gap-1">
                {/* H1 Dropdown */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => toggleMenu("heading")}
                    className={`p-1 rounded transition flex items-center gap-1 text-xs px-2 font-semibold ${
                      openMenu === "heading" ? "bg-[#2a2a2a] text-white" : "hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white"
                    }`}
                    title="Headers"
                  >
                    <span>H1</span>
                    <ChevronDown size={11} />
                  </button>
                  {openMenu === "heading" && (
                    <div className="absolute left-0 top-8 w-32 bg-[#1a1a1a] border border-[#3b494b] rounded-lg shadow-xl py-1 z-50 text-[11px] text-[#b9cacb] flex flex-col animate-in fade-in duration-100">
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "h1" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] text-left transition font-semibold"
                      >
                        Header 1
                      </button>
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "h2" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] text-left transition font-semibold"
                      >
                        Header 2
                      </button>
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "h3" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] text-left transition font-semibold"
                      >
                        Header 3
                      </button>
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "h4" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] text-left transition font-semibold"
                      >
                        Header 4
                      </button>
                      <div className="border-t border-[#3b494b]/40 my-1" />
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "paragraph" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] text-left transition"
                      >
                        Paragraph
                      </button>
                    </div>
                  )}
                </div>

                {/* List Dropdown */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => toggleMenu("list")}
                    className={`p-1 rounded transition flex items-center gap-1 px-1.5 ${
                      openMenu === "list" ? "bg-[#2a2a2a] text-white" : "hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white"
                    }`}
                    title="Lists"
                  >
                    <List size={14} />
                    <ChevronDown size={11} />
                  </button>
                  {openMenu === "list" && (
                    <div className="absolute left-0 top-8 w-32 bg-[#1a1a1a] border border-[#3b494b] rounded-lg shadow-xl py-1 z-50 text-[11px] text-[#b9cacb] flex flex-col animate-in fade-in duration-100">
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "bullet-list" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] text-left transition"
                      >
                        Bullet List
                      </button>
                      <button
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("format-editor", {
                              detail: { type: "number-list" }
                            })
                          );
                          setOpenMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] text-left transition"
                      >
                        Numbered List
                      </button>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="w-[1px] h-4 bg-[#3b494b]/40 mx-1 flex-shrink-0" />

                {/* Formatting Action Buttons */}
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("format-editor", {
                        detail: { type: "bold" }
                      })
                    )
                  }
                  className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                  title="Bold"
                >
                  <Bold size={14} className="font-bold" />
                </button>
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("format-editor", {
                        detail: { type: "italic" }
                      })
                    )
                  }
                  className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                  title="Italic"
                >
                  <Italic size={14} className="italic" />
                </button>
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("format-editor", {
                        detail: { type: "strikethrough" }
                      })
                    )
                  }
                  className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                  title="Strikethrough"
                >
                  <Strikethrough size={14} />
                </button>

                {/* Divider */}
                <div className="w-[1px] h-4 bg-[#3b494b]/40 mx-1 flex-shrink-0" />

                {/* Link & Table */}
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("format-editor", {
                        detail: { type: "link" }
                      })
                    )
                  }
                  className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                  title="Insert Link"
                >
                  <Link size={14} />
                </button>
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("format-editor", {
                        detail: { type: "table" }
                      })
                    )
                  }
                  className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                  title="Insert Table"
                >
                  <Table size={14} />
                </button>

                {/* Divider */}
                <div className="w-[1px] h-4 bg-[#3b494b]/40 mx-1 flex-shrink-0" />

                {/* Clear Formatting */}
                <button
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent("format-editor", {
                        detail: { type: "clear-formatting" }
                      })
                    )
                  }
                  className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                  title="Clear formatting"
                >
                  <Type size={14} />
                </button>
              </div>

              {/* Project + Status dropdowns — pushed to the right side of the toolbar */}
              <div className="ml-auto flex items-center gap-2 flex-shrink-0">

                {/* Project selector */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === "proj-picker" ? null : "proj-picker")}
                    className="flex items-center gap-1.5 bg-[#181f20] border border-[#3b494b] hover:border-[#00dbe9]/50 rounded-lg px-2.5 py-1.5 text-[10px] text-[#b9cacb] hover:text-white transition-all duration-150"
                    title="Change project"
                  >
                    <FolderOpen size={11} className="text-[#00dbe9] flex-shrink-0" />
                    <span className="max-w-[80px] truncate">
                      {projects.find((p) => p.id === selectedNote.projectId)?.name ?? "Project"}
                    </span>
                    <ChevronDown size={9} className={`text-[#849495] transition-transform duration-150 ${openMenu === "proj-picker" ? "rotate-180" : ""}`} />
                  </button>
                  {openMenu === "proj-picker" && (
                    <div className="absolute right-0 top-[calc(100%+4px)] min-w-[160px] max-h-[220px] overflow-y-auto bg-[#141c1d] border border-[#3b494b] rounded-xl shadow-2xl py-1 z-[200] animate-in fade-in slide-in-from-top-1 duration-100">
                      {projects.map((p) => {
                        const isSelected = p.id === selectedNote.projectId;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              void updateNote(selectedNote.id, { projectId: p.id });
                              setOpenMenu(null);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-[11px] text-left transition ${
                              isSelected
                                ? "bg-[#00dbe9]/10 text-[#00dbe9]"
                                : "text-[#b9cacb] hover:bg-[#1e2a2b] hover:text-white"
                            }`}
                          >
                            <FolderOpen size={11} className={isSelected ? "text-[#00dbe9]" : "text-[#849495]"} />
                            <span className="truncate">{p.name}</span>
                            {isSelected && <span className="ml-auto text-[#00dbe9] text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Status selector */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === "status-picker" ? null : "status-picker")}
                    className="flex items-center gap-1.5 bg-[#181f20] border border-[#3b494b] hover:border-[#00dbe9]/50 rounded-lg px-2.5 py-1.5 text-[10px] text-[#b9cacb] hover:text-white transition-all duration-150"
                    title="Change status"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      selectedNote.status === "done" ? "bg-emerald-400" :
                      selectedNote.status === "doing" ? "bg-amber-400" :
                      selectedNote.status === "todo" ? "bg-blue-400" :
                      selectedNote.status === "archive" ? "bg-[#849495]" :
                      "bg-[#3b494b]"
                    }`} />
                    <span className="capitalize">{selectedNote.status}</span>
                    <ChevronDown size={9} className={`text-[#849495] transition-transform duration-150 ${openMenu === "status-picker" ? "rotate-180" : ""}`} />
                  </button>
                  {openMenu === "status-picker" && (
                    <div className="absolute right-0 top-[calc(100%+4px)] min-w-[130px] bg-[#141c1d] border border-[#3b494b] rounded-xl shadow-2xl py-1 z-[200] animate-in fade-in slide-in-from-top-1 duration-100">
                      {NOTE_STATUSES.map((s) => {
                        const isSelected = s === selectedNote.status;
                        const dotColor =
                          s === "done" ? "bg-emerald-400" :
                          s === "doing" ? "bg-amber-400" :
                          s === "todo" ? "bg-blue-400" :
                          s === "archive" ? "bg-[#849495]" :
                          "bg-[#3b494b]";
                        return (
                          <button
                            key={s}
                            onClick={() => {
                              void moveNote(selectedNote.id, s);
                              setOpenMenu(null);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-left transition ${
                              isSelected
                                ? "bg-[#00dbe9]/10 text-[#00dbe9]"
                                : "text-[#b9cacb] hover:bg-[#1e2a2b] hover:text-white"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                            <span className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                            {isSelected && <span className="ml-auto text-[#00dbe9] text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Pin note button */}
              <button
                onClick={() => {
                  const isPinned = selectedNote.tags?.includes("pinned");
                  const nextTags = isPinned
                    ? selectedNote.tags.filter((t) => t !== "pinned")
                    : [...(selectedNote.tags || []), "pinned"];
                  void updateNote(selectedNote.id, { tags: nextTags });
                }}
                className={`ml-2 p-1 rounded transition flex items-center justify-center ${
                  selectedNote.tags?.includes("pinned")
                    ? "bg-[#00dbe9]/10 text-[#00dbe9] border border-[#00dbe9]/30"
                    : "hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white"
                }`}
                title={
                  selectedNote.tags?.includes("pinned")
                    ? "Unpin note"
                    : "Pin note"
                }
              >
                <Pin
                  size={14}
                  className={
                    selectedNote.tags?.includes("pinned") ? "rotate-[45deg]" : ""
                  }
                />
              </button>

              {/* Saved Status Indicator */}
              <span className="mono-ui text-[10px] uppercase tracking-wider text-[#00dbe9] select-none ml-2">
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "saved"
                    ? "✓ Saved"
                    : "Saved"}
              </span>
            </div>

            {/* Note Editor Content */}
            <div className="flex-1 min-h-0">
              <NoteEditor
                note={selectedNote}
                onChange={updateNote}
                zoomPercent={zoomPercent}
                wordWrap={wordWrap}
                showStatusBar={showStatusBar}
                onZoomChange={handleZoomChange}
                fontFamily={fontFamily}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Minimized Dock Chips — bottom-left, one chip per minimized note */}
      {minimizedNoteIds.length > 0 && (
        <div className="fixed bottom-3 left-4 z-[70] flex items-end gap-2 flex-wrap">
          {minimizedNoteIds.map((noteId) => {
            const minNote = notes.find((n) => n.id === noteId);
            if (!minNote) return null;
            return (
              <div
                key={noteId}
                className="flex items-center gap-0 bg-[#1a1a1a] border border-[#3b494b] rounded-xl shadow-2xl shadow-black/60 overflow-hidden animate-in slide-in-from-bottom-2 duration-200"
                style={{ backdropFilter: "blur(12px)" }}
              >
                {/* Restore button */}
                <button
                  onClick={() => {
                    setMinimizedNoteIds((prev) => prev.filter((id) => id !== noteId));
                    selectNote(noteId);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-[#00dbe9]/10 transition group"
                  title="Restore"
                >
                  <span className="text-[#00dbe9] opacity-80 group-hover:opacity-100 transition">
                    <FileText size={12} />
                  </span>
                  <span className="text-[12px] font-medium text-white max-w-[150px] truncate">
                    {minNote.title || "Untitled note"}
                  </span>
                </button>

                {/* Divider */}
                <div className="w-[1px] h-5 bg-[#3b494b]/80" />



                {/* Close button */}
                <button
                  onClick={() => {
                    setMinimizedNoteIds((prev) => prev.filter((id) => id !== noteId));
                    handleCloseTab(noteId);
                  }}
                  className="flex items-center justify-center w-8 py-2 hover:bg-red-600/80 text-[#b9cacb] hover:text-white transition"
                  title="Close"
                >
                  <X size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showSettingsPage && (
        <SettingsPage
          onClose={() => setShowSettingsPage(false)}
          initialSection={settingsInitialSection}
          wordWrap={wordWrap}
          setWordWrap={setWordWrap}
          showStatusBar={showStatusBar}
          setShowStatusBar={setShowStatusBar}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          theme={theme}
          setTheme={setTheme}
          fileInputRef={fileInputRef}
          onExport={() => {
            exportWorkspace(notes, profile, projects, {
              theme,
              fontFamily,
              wordWrap,
              showStatusBar,
              zoomPercent
            });
            recordBackup();
          }}
        />
      )}

      <ConfirmationModal />
      <SyncConflictModal />
      <SplashScreen />
    </main>
  );
}
