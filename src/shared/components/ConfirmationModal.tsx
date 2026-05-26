import type React from "react";
import { useConfirmationStore } from "../hooks/useConfirmationStore";

export function ConfirmationModal(): React.JSX.Element | null {
  const { isOpen, options, close } = useConfirmationStore();

  if (!isOpen || !options) {
    return null;
  }

  const {
    title,
    message,
    targetName,
    helperText,
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm
  } = options;

  const handleConfirm = async (): Promise<void> => {
    try {
      await onConfirm();
    } finally {
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm rounded-[24px] bg-[#1a1a1a] border border-[#3b494b]/60 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[17px] font-semibold text-white tracking-tight">
          {title}
        </h3>
        <p className="mt-3 text-sm text-[#b9cacb] leading-relaxed">
          {message}{" "}
          {targetName && (
            <strong className="text-white font-semibold">{targetName}</strong>
          )}
        </p>
        {helperText && (
          <p className="mt-3 text-xs text-[#849495] leading-relaxed">
            {helperText}
          </p>
        )}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={close}
            className="mono-ui rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-wider bg-black border border-[#3b494b]/40 hover:bg-[#252424] text-white transition duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => void handleConfirm()}
            className="mono-ui rounded-full px-5 py-2 text-[10px] font-semibold uppercase tracking-wider bg-[#e12a2a] hover:bg-[#f23d3d] text-white transition duration-200 shadow-md shadow-red-950/20"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
