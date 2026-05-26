import Dexie, { type Table } from "dexie";
import type { Note } from "../features/notes/types/note.types";
import type { UserProfile } from "../features/profile/types/profile.types";
import type { Project } from "../features/projects/types/project.types";
import { DEFAULT_PROJECT_ID, DEFAULT_PROJECT_NAME } from "../features/projects/types/project.types";

export class MyNoteDatabase extends Dexie {
  notes!: Table<Note, string>;
  profiles!: Table<UserProfile, string>;
  projects!: Table<Project, string>;

  public constructor() {
    super("my-note-db");
    this.version(1).stores({
      notes: "id, status, updatedAt"
    });
    this.version(2).stores({
      notes: "id, status, updatedAt",
      profiles: "id, updatedAt"
    });
    this.version(3)
      .stores({
        notes: "id, projectId, status, updatedAt",
        profiles: "id, updatedAt",
        projects: "id, name, updatedAt"
      })
      .upgrade(async (tx) => {
        const notesTable = tx.table<Note, string>("notes");
        const projectsTable = tx.table<Project, string>("projects");
        const now = new Date().toISOString();
        await projectsTable.put({
          id: DEFAULT_PROJECT_ID,
          name: DEFAULT_PROJECT_NAME,
          createdAt: now,
          updatedAt: now
        });
        await notesTable.toCollection().modify((note) => {
          if (!note.projectId) {
            note.projectId = DEFAULT_PROJECT_ID;
          }
        });
      });
  }
}

export const db = new MyNoteDatabase();
