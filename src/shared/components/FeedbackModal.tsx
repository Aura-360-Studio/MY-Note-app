import type React from "react";
import { X, MessageSquare, Mail, Github, Heart, ExternalLink } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-[6px] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-[#17161b] border border-[#3b494b]/60 flex flex-col max-h-[80vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#3b494b]/40 bg-[#1e1d23] rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-tight">Send Feedback</h3>
              <p className="text-[10px] text-rose-400 font-mono tracking-wider uppercase mt-0.5">Tell us what you think</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#849495] hover:text-white hover:bg-white/10 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-[#849495] leading-relaxed text-center">
            Your ideas, feedback, and bug reports keep MY Note moving forward. Since this app runs completely on your own machine, your opinion is extremely valuable to us!
          </p>

          <div className="flex flex-col gap-2.5">
            {/* Option 1: Direct Email support */}
            <a 
              href="mailto:aura360studio@gmail.com?subject=MY%20Note%20-%20User%20Feedback"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a31] border border-[#3b494b]/20 hover:border-rose-500/30 transition duration-200 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#2b2a31] text-[#b9cacb] group-hover:text-rose-400 transition">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="font-semibold text-white text-[12px] block">Direct Email support</span>
                  <span className="text-[10px] text-[#849495] block mt-0.5">Email aura360studio@gmail.com</span>
                </div>
              </div>
              <ExternalLink size={12} className="text-[#849495] group-hover:text-white transition" />
            </a>

            {/* Option 2: Report Bug on GitHub */}
            <a 
              href="https://github.com/Aura-360-Studio/MY-Note-app/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl bg-[#201f24] hover:bg-[#2b2a31] border border-[#3b494b]/20 hover:border-[#00dbe9]/30 transition duration-200 text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#2b2a31] text-[#b9cacb] group-hover:text-[#00dbe9] transition">
                  <Github size={16} />
                </div>
                <div>
                  <span className="font-semibold text-white text-[12px] block">Submit GitHub Issue</span>
                  <span className="text-[10px] text-[#849495] block mt-0.5">Report bugs & request features</span>
                </div>
              </div>
              <ExternalLink size={12} className="text-[#849495] group-hover:text-white transition" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-1.5 pt-2 text-[10px] text-rose-500 font-bold uppercase tracking-widest text-center">
            <Heart size={10} className="fill-rose-500 animate-pulse" />
            <span>Built by Aura Labs</span>
          </div>
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
