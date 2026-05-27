import { create } from "zustand";
import { noteRepository } from "../../../data/repositories/note.repository";
import type { Note, NoteStatus } from "../types/note.types";
import { profileRepository } from "../../../data/repositories/profile.repository";
import type { UserProfile } from "../../profile/types/profile.types";
import type { Project } from "../../projects/types/project.types";
import { DEFAULT_PROJECT_ID } from "../../projects/types/project.types";
import { projectRepository } from "../../../data/repositories/project.repository";

type NotesState = {
  notes: Note[];
  profile: UserProfile;
  projects: Project[];
  selectedProjectId: string;
  selectedNoteId: string | null;
  isLoaded: boolean;
  load: () => Promise<void>;
  createNote: (title?: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  updateNote: (id: string, changes: Partial<Note>) => Promise<void>;
  moveNote: (id: string, status: NoteStatus) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  replaceAll: (notes: Note[], projects?: Project[]) => Promise<void>;
  updateProfile: (changes: Pick<UserProfile, "firstName" | "lastName">) => Promise<void>;
  replaceProfile: (profile: Pick<UserProfile, "firstName" | "lastName">) => Promise<void>;
  selectProject: (projectId: string) => void;
  createProject: (name: string) => Promise<void>;
  removeProject: (projectId: string) => Promise<void>;
  lastBackupTime: string | null;
  lastEditTime: string;
  recordBackup: () => void;
  recordEdit: () => void;
};

const syncChannel = typeof window !== "undefined" ? new BroadcastChannel("my-note-sync") : null;

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  profile: {
    id: "default-profile",
    firstName: "",
    lastName: "",
    updatedAt: new Date().toISOString()
  },
  projects: [],
  selectedProjectId: DEFAULT_PROJECT_ID,
  selectedNoteId: null,
  isLoaded: false,
  lastBackupTime: typeof localStorage !== "undefined" ? localStorage.getItem("notepad_last_backup_time") : null,
  lastEditTime: (typeof localStorage !== "undefined" ? localStorage.getItem("notepad_last_edit_time") : null) || new Date().toISOString(),
  recordBackup: () => {
    const now = new Date().toISOString();
    localStorage.setItem("notepad_last_backup_time", now);
    set({ lastBackupTime: now });
  },
  recordEdit: () => {
    const now = new Date().toISOString();
    localStorage.setItem("notepad_last_edit_time", now);
    set({ lastEditTime: now });
  },
  load: async () => {
    const [notes, profile, projects] = await Promise.all([noteRepository.list(), profileRepository.get(), projectRepository.list()]);
    const currentSelectedNote = get().selectedNoteId;
    const currentSelectedProject = get().selectedProjectId;
    set({
      notes,
      profile,
      projects,
      selectedProjectId: currentSelectedProject && projects.some((p) => p.id === currentSelectedProject) ? currentSelectedProject : (projects[0]?.id ?? DEFAULT_PROJECT_ID),
      selectedNoteId: currentSelectedNote && notes.some((n) => n.id === currentSelectedNote) ? currentSelectedNote : null,
      isLoaded: true
    });
  },
  createNote: async (title) => {
    const note = await noteRepository.create({
      projectId: get().selectedProjectId,
      title: title?.trim() || "Untitled note"
    });
    set((state) => ({
      notes: [note, ...state.notes],
      selectedNoteId: title ? null : note.id
    }));
    get().recordEdit();
    syncChannel?.postMessage({ type: "sync-notes" });
  },
  selectNote: (id) => set({ selectedNoteId: id }),
  updateNote: async (id, changes) => {
    await noteRepository.update(id, changes);
    const notes = await noteRepository.list();
    const selected = get().selectedNoteId;
    set({ notes, selectedNoteId: selected && notes.some((n) => n.id === selected) ? selected : null });
    get().recordEdit();
    syncChannel?.postMessage({ type: "sync-notes" });
  },
  moveNote: async (id, status) => {
    await noteRepository.move(id, status);
    set({ notes: await noteRepository.list() });
    get().recordEdit();
    syncChannel?.postMessage({ type: "sync-notes" });
  },
  removeNote: async (id) => {
    await noteRepository.remove(id);
    const notes = await noteRepository.list();
    const selected = get().selectedNoteId;
    set({ notes, selectedNoteId: selected === id ? null : selected });
    get().recordEdit();
    syncChannel?.postMessage({ type: "sync-notes" });
  },
  replaceAll: async (notes, projects) => {
    await noteRepository.replaceAll(notes);
    if (projects && projects.length > 0) {
      await projectRepository.replaceAll(projects);
    }
    const [updatedNotes, updatedProjects] = await Promise.all([
      noteRepository.list(),
      projectRepository.list()
    ]);
    const now = new Date().toISOString();
    localStorage.setItem("notepad_last_backup_time", now);
    localStorage.setItem("notepad_last_edit_time", now);
    set({
      notes: updatedNotes,
      projects: updatedProjects,
      selectedProjectId: updatedProjects[0]?.id ?? DEFAULT_PROJECT_ID,
      selectedNoteId: null,
      lastBackupTime: now,
      lastEditTime: now
    });
    syncChannel?.postMessage({ type: "sync-notes" });
  },
  updateProfile: async (changes) => {
    const profile = await profileRepository.update(changes);
    set({ profile });
    syncChannel?.postMessage({ type: "sync-notes" });
  },
  replaceProfile: async (profile) => {
    const replaced = await profileRepository.replace(profile);
    set({ profile: replaced });
    syncChannel?.postMessage({ type: "sync-notes" });
  },
  selectProject: (projectId) => {
    set({
      selectedProjectId: projectId,
      selectedNoteId: null
    });
  },
  createProject: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const project = await projectRepository.create(trimmed);
    set((state) => ({ projects: [...state.projects, project], selectedProjectId: project.id }));
    syncChannel?.postMessage({ type: "sync-notes" });
  },
  removeProject: async (projectId) => {
    if (projectId === DEFAULT_PROJECT_ID) {
      return;
    }
    await noteRepository.moveProjectNotes(projectId, DEFAULT_PROJECT_ID);
    await projectRepository.remove(projectId);
    const [notes, projects] = await Promise.all([noteRepository.list(), projectRepository.list()]);
    const nextProjectId = projects.some((p) => p.id === get().selectedProjectId) ? get().selectedProjectId : DEFAULT_PROJECT_ID;
    set({
      notes,
      projects,
      selectedProjectId: nextProjectId,
      selectedNoteId: null
    });
    syncChannel?.postMessage({ type: "sync-notes" });
  }
}));

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data?.type === "sync-notes") {
      void useNotesStore.getState().load();
    }
  };
}
