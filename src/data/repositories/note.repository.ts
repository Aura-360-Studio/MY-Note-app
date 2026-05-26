import { db } from "../db";
import type { Note, NoteStatus } from "../../features/notes/types/note.types";
import { DEFAULT_PROJECT_ID } from "../../features/projects/types/project.types";

export const noteRepository = {
  async list(): Promise<Note[]> {
    return db.notes.orderBy("updatedAt").reverse().toArray();
  },

  async create(partial?: Partial<Note>): Promise<Note> {
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      projectId: partial?.projectId ?? DEFAULT_PROJECT_ID,
      title: partial?.title ?? "Untitled note",
      content: partial?.content ?? "",
      status: partial?.status ?? "inbox",
      tags: partial?.tags ?? [],
      createdAt: now,
      updatedAt: now,
      archivedAt: null
    };
    await db.notes.add(note);
    return note;
  },

  async update(id: string, changes: Partial<Note>): Promise<void> {
    await db.notes.update(id, { ...changes, updatedAt: new Date().toISOString() });
  },

  async move(id: string, status: NoteStatus): Promise<void> {
    await db.notes.update(id, {
      status,
      updatedAt: new Date().toISOString(),
      archivedAt: status === "archive" ? new Date().toISOString() : null
    });
  },

  async remove(id: string): Promise<void> {
    await db.notes.delete(id);
  },

  async replaceAll(notes: Note[]): Promise<void> {
    await db.transaction("rw", db.notes, async () => {
      await db.notes.clear();
      await db.notes.bulkPut(notes);
    });
  }
  ,
  async moveProjectNotes(fromProjectId: string, toProjectId: string): Promise<void> {
    await db.notes.where("projectId").equals(fromProjectId).modify({ projectId: toProjectId, updatedAt: new Date().toISOString() });
  }
};
