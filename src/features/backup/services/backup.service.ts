import type { Note } from "../../notes/types/note.types";
import { workspaceBackupSchema } from "../../notes/validators/note.schema";
import type { UserProfile } from "../../profile/types/profile.types";
import type { Project } from "../../projects/types/project.types";

export function exportWorkspace(
  notes: Note[],
  profile: Pick<UserProfile, "firstName" | "lastName">,
  projects?: Project[],
  settings?: {
    theme?: string;
    fontFamily?: string;
    wordWrap?: boolean;
    showStatusBar?: boolean;
    zoomPercent?: number;
  }
): void {
  const payload = {
    app: "MY Note" as const,
    schemaVersion: 1 as const,
    exportedAt: new Date().toISOString(),
    profile,
    notes,
    projects,
    settings
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, "-");
  link.download = `my-note-backup-${dateStr}-${timeStr}.json`;

  link.click();
  URL.revokeObjectURL(url);
}

export async function importWorkspace(file: File): Promise<{
  notes: Note[];
  profile: Pick<UserProfile, "firstName" | "lastName">;
  projects?: Project[];
  settings?: {
    theme?: string;
    fontFamily?: string;
    wordWrap?: boolean;
    showStatusBar?: boolean;
    zoomPercent?: number;
  };
}> {
  const content = await file.text();
  const data = JSON.parse(content) as unknown;
  const parsed = workspaceBackupSchema.parse(data);
  return {
    notes: parsed.notes,
    profile: parsed.profile,
    projects: parsed.projects,
    settings: parsed.settings
  };
}
