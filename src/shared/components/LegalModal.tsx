import type React from "react";
import { X, ExternalLink, Shield, FileText, Scale, Heart } from "lucide-react";

export type LegalModalType = "license" | "services" | "privacy" | "acknowledgments";

interface LegalModalProps {
  isOpen: boolean;
  type: LegalModalType | null;
  onClose: () => void;
}

export function LegalModal({ isOpen, type, onClose }: LegalModalProps): React.JSX.Element | null {
  if (!isOpen || !type) return null;

  const renderHeader = () => {
    switch (type) {
      case "license":
        return (
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scale size={16} />
            </div>
            <div>
              <h3 className="text-15px font-semibold text-white tracking-tight">Software License Terms</h3>
              <p className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase mt-0.5">Open Source • GPL v3.0</p>
            </div>
          </div>
        );
      case "services":
        return (
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#00dbe9]/10 border border-[#00dbe9]/30 text-[#00dbe9]">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-15px font-semibold text-white tracking-tight">Services Agreement</h3>
              <p className="text-[10px] text-[#00dbe9] font-mono tracking-wider uppercase mt-0.5">Laboratory Experiment Terms</p>
            </div>
          </div>
        );
      case "privacy":
        return (
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="text-15px font-semibold text-white tracking-tight">Privacy Statement</h3>
              <p className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase mt-0.5">100% Client-Side Privacy</p>
            </div>
          </div>
        );
      case "acknowledgments":
        return (
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Heart size={16} />
            </div>
            <div>
              <h3 className="text-15px font-semibold text-white tracking-tight">Third-Party Acknowledgments</h3>
              <p className="text-[10px] text-rose-400 font-mono tracking-wider uppercase mt-0.5">Open Source Credits</p>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => {
    switch (type) {
      case "license":
        return (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs leading-relaxed text-emerald-300/90">
              This application is open-source software and is tracked in version control on{" "}
              <a
                href="https://github.com/Aura-360-Studio/MY-Note-app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#00dbe9] hover:underline font-semibold inline-flex items-center gap-0.5"
              >
                GitHub
                <ExternalLink size={10} />
              </a>{" "}
              under the copyleft <strong>GNU General Public License v3.0 (GPLv3)</strong>. You are fully welcome to explore, clone, fork, modify, and distribute your own version under the same license terms.
            </div>
            <pre className="p-4 rounded-xl bg-black/40 border border-[#3b494b]/30 font-mono text-[11px] leading-relaxed text-[#b9cacb] overflow-x-auto whitespace-pre-wrap">
{`GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) 2026 Aura Labs

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.`}
            </pre>
          </div>
        );
      case "services":
        return (
          <div className="space-y-4 text-xs leading-relaxed text-[#b9cacb]">
            <h4 className="text-sm font-semibold text-white">1. Experimental Lab Project</h4>
            <p>
              <strong>MY Note</strong> is an experimental workspace developed by Aura Labs to explore procedural interfaces. It is provided strictly on an as-is, experimental basis. Features may evolve, change, or be discontinued over time.
            </p>
            <h4 className="text-sm font-semibold text-white mt-4">2. Client-Side Operations & Storage</h4>
            <p>
              The application runs entirely inside your local browser environment. All your notebooks, projects, text settings, and profiles are saved on your own physical computer using browser database engines (IndexedDB and CacheStorage).
            </p>
            <div className="p-3 bg-amber-500/5 border border-amber-500/25 text-amber-300 rounded-xl">
              <strong>CRITICAL WARNING:</strong> Browser caching mechanisms, database cleanups, or manual cache purges (e.g. "Clear Browser History") may completely prune your local databases and erase your note collections.
            </div>
            <h4 className="text-sm font-semibold text-white mt-4">3. Backup Obligation</h4>
            <p>
              It is the user's absolute responsibility to take frequent manual backups by downloading workspace `.json` backup files via the settings panel. Aura Labs has no means to recover, synchronize, or restore any data lost due to local device resets or browser clearing.
            </p>
            <h4 className="text-sm font-semibold text-white mt-4">4. Limitation of Liability</h4>
            <p>
              In no event shall Aura Labs, its developers, or contributors be held liable for any data loss, workflow disruption, or consequential damages resulting from the use or inability to use this experimental application.
            </p>
          </div>
        );
      case "privacy":
        return (
          <div className="space-y-4 text-xs leading-relaxed text-[#b9cacb]">
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/25 rounded-xl flex items-start gap-3">
              <Shield className="text-indigo-400 mt-0.5 shrink-0" size={16} />
              <div>
                <strong className="text-white block mb-0.5">Absolute Local Sovereignty</strong>
                Your data is exclusively yours. Because we do not use remote note databases, your information never travels over the web to us.
              </div>
            </div>
            
            <h4 className="text-sm font-semibold text-white mt-4">1. Zero Server-Side Note Tracking</h4>
            <p>
              We do not run database sync servers, analytics trackers, or telemetry scripts. The text notes you compile, search, edit, or delete never cross the wire.
            </p>
            
            <h4 className="text-sm font-semibold text-white mt-4">2. Local Storage Utilizations</h4>
            <p>
              To deliver high-performance offline editing and persistent settings, MY Note leverages standard client API capabilities:
            </p>
            <ul className="list-disc list-inside pl-2 space-y-1.5 text-[#849495]">
              <li><strong className="text-[#b9cacb]">IndexedDB (Dexie):</strong> Stores notes, tasks, projects, and active modifications.</li>
              <li><strong className="text-[#b9cacb]">LocalStorage:</strong> Holds user interface states, active workspace selections, themes, and font configurations.</li>
              <li><strong className="text-[#b9cacb]">Service Worker & Cache API:</strong> Empowers offline application loading and instant startup.</li>
            </ul>

            <h4 className="text-sm font-semibold text-white mt-4">3. External Links & Integrations</h4>
            <p>
              Clicking external hyperlinked resources (such as Aura Labs portals or open-source repositories) will navigate you to those respective domains, which govern their own privacy and cookies structures.
            </p>
          </div>
        );
      case "acknowledgments":
        return (
          <div className="space-y-4 text-xs leading-relaxed text-[#b9cacb]">
            <p>
              <strong>MY Note</strong> is built upon the incredible efforts of the global open-source software community. We gratefully acknowledge and credit the core technologies powering this application:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
              <div className="p-3 bg-[#201f24] rounded-xl border border-[#3b494b]/30">
                <span className="font-semibold text-white text-[13px] block">React & React DOM</span>
                <span className="text-[10px] text-[#849495] block mt-0.5">MIT License</span>
                <p className="text-[11px] text-[#849495] mt-1.5">Component-based UI assembly library.</p>
              </div>

              <div className="p-3 bg-[#201f24] rounded-xl border border-[#3b494b]/30">
                <span className="font-semibold text-white text-[13px] block">Zustand</span>
                <span className="text-[10px] text-[#849495] block mt-0.5">MIT License</span>
                <p className="text-[11px] text-[#849495] mt-1.5">Reactive, ultra-fast global state manager.</p>
              </div>

              <div className="p-3 bg-[#201f24] rounded-xl border border-[#3b494b]/30">
                <span className="font-semibold text-white text-[13px] block">Dexie.js</span>
                <span className="text-[10px] text-[#849495] block mt-0.5">Apache License 2.0</span>
                <p className="text-[11px] text-[#849495] mt-1.5 font-sans">IndexedDB wrapper enabling fluid offline note databases.</p>
              </div>

              <div className="p-3 bg-[#201f24] rounded-xl border border-[#3b494b]/30">
                <span className="font-semibold text-white text-[13px] block">CodeMirror Ecosystem</span>
                <span className="text-[10px] text-[#849495] block mt-0.5">MIT License</span>
                <p className="text-[11px] text-[#849495] mt-1.5">Extensible modular text editor powering markdown inputs.</p>
              </div>

              <div className="p-3 bg-[#201f24] rounded-xl border border-[#3b494b]/30">
                <span className="font-semibold text-white text-[13px] block">Tailwind CSS</span>
                <span className="text-[10px] text-[#849495] block mt-0.5">MIT License</span>
                <p className="text-[11px] text-[#849495] mt-1.5">Utility-first responsive design stylesheet system.</p>
              </div>

              <div className="p-3 bg-[#201f24] rounded-xl border border-[#3b494b]/30">
                <span className="font-semibold text-white text-[13px] block">Lucide Icons</span>
                <span className="text-[10px] text-[#849495] block mt-0.5">ISC License</span>
                <p className="text-[11px] text-[#849495] mt-1.5">Crisp, consistent vector iconography.</p>
              </div>

              <div className="p-3 bg-[#201f24] rounded-xl border border-[#3b494b]/30">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-[13px] block">GitHub</span>
                  <a
                    href="https://github.com/Aura-360-Studio/MY-Note-app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00dbe9] hover:underline text-[10px] flex items-center gap-0.5"
                  >
                    View Repo
                    <ExternalLink size={9} />
                  </a>
                </div>
                <span className="text-[10px] text-[#849495] block mt-0.5">Code Repository & Open Source Host</span>
                <p className="text-[11px] text-[#849495] mt-1.5">Hosting our open-source codebase, version history, and enabling community collaboration.</p>
              </div>

              <div className="p-3 bg-[#201f24] rounded-xl border border-[#3b494b]/30">
                <span className="font-semibold text-white text-[13px] block">Vercel</span>
                <span className="text-[10px] text-[#849495] block mt-0.5">Deployment & Hosting Platform</span>
                <p className="text-[11px] text-[#849495] mt-1.5">Providing instant edge-network cloud hosting and highly performant preview builds.</p>
              </div>

              <div className="p-3 bg-[#201f24] rounded-xl border border-[#3b494b]/30 col-span-1 md:col-span-2">
                <span className="font-semibold text-white text-[13px] block">Other Utilities</span>
                <p className="text-[11px] text-[#849495] mt-1.5">
                  Powered additionally by <strong className="text-[#b9cacb]">Zod</strong> (validation schema, MIT), <strong className="text-[#b9cacb]">dnd-kit</strong> (drag mechanics, MIT), and <strong className="text-[#b9cacb]">Vite</strong> (fast web building orchestration, MIT).
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-[6px] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl bg-[#17161b] border border-[#3b494b]/60 flex flex-col max-h-[80vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3b494b]/40 bg-[#1e1d23] rounded-t-2xl">
          {renderHeader()}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#849495] hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 py-5 flex-1 custom-scrollbar">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#3b494b]/20 bg-[#1e1d23]/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="mono-ui rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-wider bg-[#2d2c34] hover:bg-[#383740] border border-[#3b494b]/40 text-[#b9cacb] hover:text-white transition duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
