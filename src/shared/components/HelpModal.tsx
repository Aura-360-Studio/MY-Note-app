import type React from "react";
import { X, HelpCircle, Keyboard, BookOpen, Laptop, Cloud } from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-[6px] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#17161b] border border-[#3b494b]/60 flex flex-col max-h-[85vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3b494b]/40 bg-[#1e1d23] rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00dbe9]/10 border border-[#00dbe9]/30 text-[#00dbe9]">
              <HelpCircle size={16} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-tight">Help & Documentation</h3>
              <p className="text-[10px] text-[#00dbe9] font-mono tracking-wider uppercase mt-0.5">Quick guides & keyboard shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#849495] hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1 custom-scrollbar space-y-6">
          
          {/* Section 1: Keyboard Shortcuts */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Keyboard size={15} className="text-[#00dbe9]" />
              <h4>Keyboard Shortcuts</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { keys: ["Ctrl", "N"], desc: "Create a new note" },
                { keys: ["Ctrl", "F"], desc: "Search through notes" },
                { keys: ["Ctrl", "S"], desc: "Export manual JSON backup" },
                { keys: ["Ctrl", "B"], desc: "Toggle navigation sidebar" },
                { keys: ["Ctrl", "Alt", "P"], desc: "Toggle Pomodoro Focus timer" },
                { keys: ["Esc"], desc: "Close popup modals / editor" }
              ].map((shortcut, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#201f24] border border-[#3b494b]/20 hover:border-[#3b494b]/40 transition duration-150"
                >
                  <span className="text-[11px] text-[#849495] font-medium">{shortcut.desc}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, keyIdx) => (
                      <kbd 
                        key={keyIdx} 
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-[#131317] border border-[#3b494b]/40 text-white shadow-sm"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: PWA & Offline-First */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Laptop size={15} className="text-indigo-400" />
              <h4>Offline-First Workspace (PWA)</h4>
            </div>
            <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-[11px] leading-relaxed text-[#b9cacb] space-y-2">
              <p>
                <strong>MY Note</strong> is built as a Progressive Web App (PWA). All of your notes, database connections, and user preferences reside <strong>directly inside your browser</strong> (IndexedDB).
              </p>
              <p>
                * **100% Offline Capability**: The app works fully without any internet connection. You can add, edit, or delete notes anywhere.
              </p>
              <p>
                * **Direct Installation**: Click the "Install App" button in settings or the address bar icon to install MY Note onto your desktop, tablet, or phone as a dedicated local application!
              </p>
            </div>
          </div>

          {/* Section 3: Cloud Syncing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Cloud size={15} className="text-emerald-400" />
              <h4>Zero-Server Cloud Syncing</h4>
            </div>
            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-[11px] leading-relaxed text-[#b9cacb] space-y-2">
              <p>
                To provide safe, secure backups without hosting your notes on public servers, MY Note links directly to your personal <strong>Google Drive</strong>:
              </p>
              <p>
                * **Sandboxed AppData Directory**: We use the standard `appDataFolder` scope. This creates an isolated folder that only MY Note can see—we cannot read or edit any other files on your Google Drive.
              </p>
              <p>
                * **Conflict Resolution**: If you edit notes on another device, our sync engine will detect it and prompt a visually guided conflict selector, putting you in absolute control of your data.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#3b494b]/20 bg-[#1e1d23]/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="mono-ui rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-wider bg-[#2d2c34] hover:bg-[#383740] border border-[#3b494b]/40 text-[#b9cacb] hover:text-white transition duration-150"
          >
            Close Help
          </button>
        </div>
      </div>
    </div>
  );
}
