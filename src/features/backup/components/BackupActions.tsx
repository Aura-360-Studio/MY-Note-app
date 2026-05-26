import type React from "react";
import { Download, Upload } from "lucide-react";

type BackupActionsProps = {
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
};

export function BackupActions({ onExport, onImport }: BackupActionsProps): React.JSX.Element {
  async function handleFileInput(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    await onImport(file);
    event.target.value = "";
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onExport}
        className="inline-flex items-center gap-2 rounded border border-border bg-panel px-3 py-2 text-sm transition hover:border-accent hover:text-accent"
      >
        <Download size={16} />
        Export
      </button>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-border bg-panel px-3 py-2 text-sm transition hover:border-accent hover:text-accent">
        <Upload size={16} />
        Import
        <input type="file" accept=".json,application/json" className="hidden" onChange={(event) => void handleFileInput(event)} />
      </label>
    </div>
  );
}
