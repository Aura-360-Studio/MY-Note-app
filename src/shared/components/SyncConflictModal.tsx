import React from "react";
import { Cloud, AlertTriangle, ArrowRight, Laptop } from "lucide-react";
import { useSyncStore } from "../../features/backup/stores/useSyncStore";
import { useNotesStore } from "../../features/notes/stores/useNotesStore";

export function SyncConflictModal(): React.JSX.Element | null {
  const { conflictPayload, resolveConflict, isSyncing } = useSyncStore();
  const { lastEditTime } = useNotesStore();

  if (!conflictPayload) return null;

  const cloudTime = new Date(conflictPayload.exportedAt || 0);
  const localTime = new Date(lastEditTime);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-none">
      {/* Modal Card */}
      <div className="w-full max-w-lg bg-[#1a1a1a] border border-[#3b494b] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Warning Header */}
        <div className="px-6 py-5 border-b border-[#3b494b]/40 bg-amber-500/[0.02] flex items-center gap-3.5 text-amber-400">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle size={18} />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Cloud Sync Conflict
            </h3>
            <p className="text-[10px] text-[#849495] uppercase tracking-wider font-semibold mt-0.5">
              Latest-Modified-Wins Conflict Detected
            </p>
          </div>
        </div>

        {/* Modal Description */}
        <div className="p-6 flex flex-col gap-4 text-left">
          <p className="text-xs text-[#b9cacb] leading-relaxed">
            Your Google Drive backup has edits that are newer than your local workspace changes. Please choose which version you want to preserve:
          </p>

          {/* Cards Comparison layout */}
          <div className="grid grid-cols-2 gap-3.5 mt-2">
            
            {/* Local Version Card */}
            <div className="p-4 rounded-xl border border-[#3b494b]/30 bg-[#131313] flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-[#849495]">
                <Laptop size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Local Workspace</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white truncate">Local Device</span>
                <span className="text-[10px] text-[#849495] mt-1 font-mono">
                  {localTime.toLocaleTimeString()}
                </span>
                <span className="text-[9px] text-[#849495] font-mono mt-0.5">
                  {localTime.toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Cloud Version Card */}
            <div className="p-4 rounded-xl border border-[#00dbe9]/20 bg-[#00dbe9]/[0.02] flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-[#00dbe9]">
                <Cloud size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Cloud Backup</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white truncate">Google Drive</span>
                <span className="text-[10px] text-[#00dbe9] mt-1 font-mono font-bold">
                  {cloudTime.toLocaleTimeString()}
                </span>
                <span className="text-[9px] text-[#00dbe9]/80 font-mono mt-0.5">
                  {cloudTime.toLocaleDateString()}
                </span>
              </div>
            </div>

          </div>

          <div className="p-3.5 rounded-lg bg-[#0e0e0e] border border-[#3b494b]/30 text-[11px] leading-relaxed text-[#849495] flex flex-col gap-1.5 mt-1">
            <span className="font-semibold text-[#b9cacb]">Important Considerations:</span>
            <span>• <b>Use Cloud Data</b> will overwrite your local notes with the backup stored in Google Drive.</span>
            <span>• <b>Keep Local Workspace</b> will overwrite your Google Drive backup with your current local notes.</span>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-4 bg-[#0e0e0e] border-t border-[#3b494b]/40 flex items-center justify-end gap-3">
          <button
            onClick={() => resolveConflict("keepLocal")}
            disabled={isSyncing}
            className="px-4 py-2 rounded-full border border-[#3b494b] hover:border-[#849495] text-[10px] font-bold uppercase tracking-wider text-[#b9cacb] hover:text-white transition disabled:opacity-50"
          >
            Keep Local Workspace
          </button>
          
          <button
            onClick={() => resolveConflict("useCloud")}
            disabled={isSyncing}
            className="px-5 py-2 rounded-full bg-[#00dbe9] hover:bg-[#00dbe9]/85 text-[#00363a] font-extrabold text-[10px] uppercase tracking-wider transition shadow-lg shadow-[#00dbe9]/10 disabled:opacity-50"
          >
            Use Cloud Data
          </button>
        </div>

      </div>
    </div>
  );
}
