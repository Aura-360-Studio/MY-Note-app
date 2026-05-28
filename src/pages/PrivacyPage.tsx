import type React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Check } from "lucide-react";

export function PrivacyPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#090d12] text-[#b9cacb] font-sans antialiased selection:bg-[#00dbe9]/30 selection:text-white pb-20">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.03),transparent_45%)] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-[#090d12]/80 backdrop-blur-md border-b border-[#1f292e]/40 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#849495] hover:text-white transition duration-150 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition duration-150" />
            Back to App
          </Link>
          <span className="text-[10px] font-bold text-[#00dbe9] tracking-widest uppercase">MY Note</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 mt-12 relative">
        <div className="rounded-2xl bg-[#131216]/60 border border-[#1f292e]/50 p-8 shadow-2xl backdrop-blur-sm">
          
          {/* Document Header */}
          <div className="flex items-center gap-3.5 border-b border-[#1f292e]/50 pb-6 mb-6">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Privacy Statement</h1>
              <p className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase mt-1">100% Client-Side Privacy • Active Version</p>
            </div>
          </div>

          {/* Document Content */}
          <div className="space-y-6 text-sm leading-relaxed">
            
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/25 rounded-xl flex items-start gap-3 text-xs leading-normal text-indigo-300">
              <Shield className="text-indigo-400 mt-0.5 shrink-0" size={16} />
              <div>
                <strong className="text-white block mb-0.5">Absolute Local Sovereignty</strong>
                Your data is exclusively yours. Because we do not use remote note databases, your information never travels over the web to us.
              </div>
            </div>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">1. Zero Server-Side Note Tracking</h2>
              <p>
                We do not run database sync servers, analytics trackers, or telemetry scripts. The text notes you compile, search, edit, or delete never cross the wire.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">2. Local Storage Utilizations</h2>
              <p>
                To deliver high-performance offline editing and persistent settings, MY Note leverages standard client API capabilities:
              </p>
              <ul className="space-y-3.5 mt-3">
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-[#1f292e]/30 text-emerald-400 mt-0.5 shrink-0">
                    <Check size={12} />
                  </div>
                  <div>
                    <strong className="text-white block text-[13px]">IndexedDB (Dexie):</strong>
                    Stores notes, tasks, projects, and active modifications locally on your device.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-[#1f292e]/30 text-emerald-400 mt-0.5 shrink-0">
                    <Check size={12} />
                  </div>
                  <div>
                    <strong className="text-white block text-[13px]">LocalStorage:</strong>
                    Holds user interface states, active workspace selections, themes, and font configurations.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-[#1f292e]/30 text-emerald-400 mt-0.5 shrink-0">
                    <Check size={12} />
                  </div>
                  <div>
                    <strong className="text-white block text-[13px]">Service Worker & Cache API:</strong>
                    Empowers offline application loading and instant startup without requiring remote server downloads on every load.
                  </div>
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">3. External Links & Integrations</h2>
              <p>
                Clicking external hyperlinked resources (such as Aura Labs portals or open-source repositories) will navigate you to those respective domains, which govern their own privacy and cookies structures.
              </p>
            </section>

          </div>

          {/* Document Footer */}
          <div className="mt-8 pt-6 border-t border-[#1f292e]/40 flex items-center justify-between text-[10px] text-[#849495]">
            <span>Last Updated: May 2026</span>
            <span>Aura Labs © 2026</span>
          </div>

        </div>
      </main>
    </div>
  );
}
