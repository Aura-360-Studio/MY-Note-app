export const NOTE_STATUSES = ["inbox", "todo", "doing", "done", "archive"] as const;

export type NoteStatus = (typeof NOTE_STATUSES)[number];

export type Note = {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: NoteStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};
