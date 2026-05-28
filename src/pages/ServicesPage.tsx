import type React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";

export function ServicesPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#090d12] text-[#b9cacb] font-sans antialiased selection:bg-[#00dbe9]/30 selection:text-white pb-20">
      {/* Background radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,219,233,0.03),transparent_45%)] pointer-events-none" />

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
            <div className="p-3 rounded-xl bg-[#00dbe9]/10 border border-[#00dbe9]/30 text-[#00dbe9] shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Services Agreement</h1>
              <p className="text-[10px] text-[#00dbe9] font-mono tracking-wider uppercase mt-1">Laboratory Experiment Terms • Active Version</p>
            </div>
          </div>

          {/* Document Content */}
          <div className="space-y-6 text-sm leading-relaxed">
            
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">1. Experimental Lab Project</h2>
              <p>
                <strong>MY Note</strong> is an experimental workspace developed by Aura Labs to explore procedural interfaces. It is provided strictly on an as-is, experimental basis. Features may evolve, change, or be discontinued over time.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">2. Client-Side Operations & Storage</h2>
              <p>
                The application runs entirely inside your local browser environment. All your notebooks, projects, text settings, and profiles are saved on your own physical computer using browser database engines (IndexedDB and CacheStorage).
              </p>
              <div className="p-4 bg-amber-500/5 border border-amber-500/25 text-amber-300 rounded-xl mt-3 text-xs">
                <strong>CRITICAL WARNING:</strong> Browser caching mechanisms, database cleanups, or manual cache purges (e.g. "Clear Browser History") may completely prune your local databases and erase your note collections.
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">3. Backup Obligation</h2>
              <p>
                It is the user's absolute responsibility to take frequent manual backups by downloading workspace `.json` backup files via the settings panel. Aura Labs has no means to recover, synchronize, or restore any data lost due to local device resets or browser clearing.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">4. Limitation of Liability</h2>
              <p>
                In no event shall Aura Labs, its developers, or contributors be held liable for any data loss, workflow disruption, or consequential damages resulting from the use or inability to use this experimental application.
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
