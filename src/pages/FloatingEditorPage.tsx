import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  X,
  Plus,
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
  FolderOpen
} from "lucide-react";
import { NoteEditor } from "../features/notes/components/NoteEditor";
import { useNotesStore } from "../features/notes/stores/useNotesStore";
import { NOTE_STATUSES } from "../features/notes/types/note.types";
import { useConfirmationStore } from "../shared/hooks/useConfirmationStore";
import { ConfirmationModal } from "../shared/components/ConfirmationModal";

export function FloatingEditorPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();

  // Read initial tab IDs and active tab from URL
  const initialTabs = useMemo(() => {
    const tabsParam = searchParams.get("tabs");
    const noteIdParam = searchParams.get("noteId");
    if (tabsParam) return tabsParam.split(",").filter(Boolean);
    if (noteIdParam) return [noteIdParam];
    return [];
  }, [searchParams]);

  const initialActive = useMemo(() => {
    return searchParams.get("active") || searchParams.get("noteId") || initialTabs[0] || null;
  }, [searchParams, initialTabs]);

  const {
    notes,
    projects,
    load,
    isLoaded,
    createNote,
    updateNote,
    moveNote,
    removeNote
  } = useNotesStore();

  const confirm = useConfirmationStore((state) => state.confirm);
  const tabStripRef = useRef<HTMLDivElement | null>(null);

  const [openNoteIds, setOpenNoteIds] = useState<string[]>(initialTabs);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialActive);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saving" | "saved" | null>(null);

  const [fontFamily, setFontFamily] = useState<string>(() => {
    return localStorage.getItem("notepad_font_family") || "Geist";
  });
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem("notepad_theme") || "dark";
  });
  const [wordWrap, setWordWrap] = useState<boolean>(() => {
    return localStorage.getItem("notepad_word_wrap") !== "false";
  });
  const [showStatusBar, setShowStatusBar] = useState<boolean>(() => {
    return localStorage.getItem("notepad_status_bar") !== "false";
  });
  const [zoomPercent, setZoomPercent] = useState<number>(() => {
    return Number(localStorage.getItem("notepad_zoom_percent")) || 100;
  });

  // Load notes database on mount
  useEffect(() => {
    void load();
  }, [load]);

  // Synchronize dynamic updates to browser themes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
    }
  }, [theme]);

  // Synchronize local settings storage events
  useEffect(() => {
    const handleStorageChange = () => {
      setFontFamily(localStorage.getItem("notepad_font_family") || "Geist");
      setTheme(localStorage.getItem("notepad_theme") || "dark");
      setWordWrap(localStorage.getItem("notepad_word_wrap") !== "false");
      setShowStatusBar(localStorage.getItem("notepad_status_bar") !== "false");
      setZoomPercent(Number(localStorage.getItem("notepad_zoom_percent")) || 100);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Set window title to active note name
  useEffect(() => {
    const activeNote = notes.find((n) => n.id === selectedNoteId);
    if (activeNote) {
      document.title = `${activeNote.title || "Untitled Note"} - MY Note Notepad`;
    } else {
      document.title = "MY Note Notepad";
    }
  }, [selectedNoteId, notes]);

  // Auto-remove open tabs whose notes have been deleted externally
  useEffect(() => {
    if (!isLoaded) return;
    const noteIds = new Set(notes.map((n) => n.id));
    const validTabs = openNoteIds.filter((id) => noteIds.has(id));
    if (validTabs.length !== openNoteIds.length) {
      setOpenNoteIds(validTabs);
      if (selectedNoteId && !noteIds.has(selectedNoteId)) {
        setSelectedNoteId(validTabs[0] || null);
      }
    }
    // Close window if all tabs are gone
    if (validTabs.length === 0 && isLoaded && initialTabs.length > 0) {
      window.close();
    }
  }, [isLoaded, notes, openNoteIds, selectedNoteId, initialTabs.length]);

  // Scroll tab strip to end when new tabs added
  useEffect(() => {
    const el = tabStripRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [openNoteIds.length]);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  );

  // ── Helper Functions ─────────────────────────

  function handleCloseTab(noteId: string): void {
    const nextTabs = openNoteIds.filter((id) => id !== noteId);
    setOpenNoteIds(nextTabs);

    if (selectedNoteId === noteId) {
      if (nextTabs.length > 0) {
        const idx = openNoteIds.indexOf(noteId);
        const newActiveId = nextTabs[Math.min(idx, nextTabs.length - 1)];
        setSelectedNoteId(newActiveId ?? null);
      } else {
        setSelectedNoteId(null);
        // Close window when last tab is closed
        setTimeout(() => window.close(), 100);
      }
    }
  }

  async function handleNewTab(): Promise<void> {
    await createNote();
    // The new note will be the first in the notes array after creation
    // We need to wait for the store to update
    const latestNotes = useNotesStore.getState().notes;
    const newNote = latestNotes[0];
    if (newNote) {
      setOpenNoteIds((prev) => [...prev, newNote.id]);
      setSelectedNoteId(newNote.id);
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

  // ── Loading / Empty States ─────────────────────────

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#090d12] text-[#00dbe9] select-none">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#00dbe9] animate-spin" />
        <span className="mt-3 text-xs tracking-wider uppercase font-mono mono-ui">Hydrating...</span>
      </div>
    );
  }

  if (openNoteIds.length === 0) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#090d12] text-[#b9cacb] font-sans gap-3">
        <p className="text-sm">No notes open.</p>
        <button
          onClick={() => void handleNewTab()}
          className="px-4 py-1.5 bg-[#00dbe9]/10 hover:bg-[#00dbe9]/20 border border-[#00dbe9]/30 rounded-full text-xs text-[#00dbe9] transition"
        >
          Create New Note
        </button>
        <button
          onClick={() => window.close()}
          className="mt-1 px-4 py-1.5 bg-[#201f1f] hover:bg-[#2a2a2a] border border-[#3b494b]/60 rounded-full text-xs text-white transition"
        >
          Close Window
        </button>
      </div>
    );
  }

  // ── Main Render ─────────────────────────

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#131313] text-[#e5e2e1] font-sans">
      {/* ─── Title / Tab Bar ─── */}
      <div className="flex h-11 items-center border-b border-[#3b494b] bg-[#1a1a1a] select-none flex-shrink-0 min-w-0">
        {/* App icon */}
        <div className="flex-shrink-0 pl-4 pr-2 text-[#00dbe9]">
          <FileText size={15} />
        </div>

        {/* Tab strip */}
        <div ref={tabStripRef} className="flex items-end gap-1 h-full overflow-x-auto no-scrollbar flex-1 min-w-0">
          {openNoteIds.map((id) => {
            const tabNote = notes.find((n) => n.id === id);
            if (!tabNote) return null;
            const isActive = id === selectedNoteId;
            const isTabPinned = tabNote.tags?.includes("pinned");
            return (
              <div
                key={id}
                onClick={() => setSelectedNoteId(id)}
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

          {/* + New Tab */}
          <button
            onClick={() => void handleNewTab()}
            className="self-center ml-1 flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-md hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-[#00dbe9] transition"
            title="New Tab"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-3 text-[#b9cacb] text-xs pr-2">
          <span className="mono-ui text-[9px] uppercase tracking-wider text-[#00dbe9] select-none mr-1">
            Independent Notepad
          </span>
          <button
            onClick={() => window.close()}
            className="w-8 h-8 rounded hover:bg-red-600 hover:text-white flex items-center justify-center transition"
            title="Close Window"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ─── Transparent Backdrop to close opened dropdowns ─── */}
      {openMenu && (
        <div
          className="fixed inset-0 z-45 bg-transparent"
          onClick={() => setOpenMenu(null)}
        />
      )}

      {selectedNote ? (
        <>
          {/* ─── Unified Menu & Formatting Toolbar ─── */}
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
                        if (selectedNoteId) handleCloseTab(selectedNoteId);
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
                        window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "undo" } }));
                        setOpenMenu(null);
                      }}
                      className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                    >
                      <span>Undo</span>
                      <span className="text-[#849495] text-[10px]">Ctrl+Z</span>
                    </button>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "redo" } }));
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
                        window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "datetime" } }));
                        setOpenMenu(null);
                      }}
                      className="flex justify-between w-full px-4 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] transition text-left"
                    >
                      <span>Time/Date</span>
                      <span className="text-[#849495] text-[10px]">F5</span>
                    </button>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "clear-all" } }));
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

            {/* ─── Formatting Toolbar Items ─── */}
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
                    {(["h1", "h2", "h3", "h4"] as const).map((h) => (
                      <button
                        key={h}
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: h } }));
                          setOpenMenu(null);
                        }}
                        className="w-full px-3 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] text-left transition font-semibold"
                      >
                        Header {h.charAt(1)}
                      </button>
                    ))}
                    <div className="border-t border-[#3b494b]/40 my-1" />
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "paragraph" } }));
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
                        window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "bullet-list" } }));
                        setOpenMenu(null);
                      }}
                      className="w-full px-3 py-1.5 hover:bg-[#00dbe9]/10 hover:text-[#00dbe9] text-left transition"
                    >
                      Bullet List
                    </button>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "number-list" } }));
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
                onClick={() => window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "bold" } }))}
                className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                title="Bold"
              >
                <Bold size={14} className="font-bold" />
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "italic" } }))}
                className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                title="Italic"
              >
                <Italic size={14} className="italic" />
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "strikethrough" } }))}
                className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                title="Strikethrough"
              >
                <Strikethrough size={14} />
              </button>

              {/* Divider */}
              <div className="w-[1px] h-4 bg-[#3b494b]/40 mx-1 flex-shrink-0" />

              {/* Link & Table */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "link" } }))}
                className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                title="Insert Link"
              >
                <Link size={14} />
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "table" } }))}
                className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                title="Insert Table"
              >
                <Table size={14} />
              </button>

              {/* Divider */}
              <div className="w-[1px] h-4 bg-[#3b494b]/40 mx-1 flex-shrink-0" />

              {/* Clear Formatting */}
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("format-editor", { detail: { type: "clear-formatting" } }))}
                className="p-1 rounded hover:bg-[#2a2a2a] text-[#b9cacb] hover:text-white transition flex items-center justify-center"
                title="Clear formatting"
              >
                <Type size={14} />
              </button>
            </div>

            {/* ─── Project + Status dropdowns (right side) ─── */}
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

          {/* ─── Note Editor Content ─── */}
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
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-[#849495] text-sm select-none">
          Select a tab to start editing
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
}
