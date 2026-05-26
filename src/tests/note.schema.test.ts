import { describe, it, expect } from "vitest";
import {
  noteSchema,
  workspaceBackupSchema
} from "../features/notes/validators/note.schema";

describe("noteSchema validation", () => {
  it("should validate a valid note successfully", () => {
    const validNote = {
      id: "note-1",
      projectId: "project-1",
      title: "Test Note",
      content: "This is a test content",
      status: "todo",
      tags: ["test", "zod"],
      createdAt: "2026-05-26T10:30:00.000Z",
      updatedAt: "2026-05-26T10:30:00.000Z",
      archivedAt: null
    };

    const result = noteSchema.safeParse(validNote);
    expect(result.success).toBe(true);
  });

  it("should fail validation if status is invalid", () => {
    const invalidNote = {
      id: "note-2",
      projectId: "project-1",
      title: "Test Note 2",
      content: "This is a test content",
      status: "invalid-status",
      tags: [],
      createdAt: "2026-05-26T10:30:00.000Z",
      updatedAt: "2026-05-26T10:30:00.000Z",
      archivedAt: null
    };

    const result = noteSchema.safeParse(invalidNote);
    expect(result.success).toBe(false);
  });
});

describe("workspaceBackupSchema validation", () => {
  it("should validate a valid backup successfully", () => {
    const validBackup = {
      app: "MY Note",
      schemaVersion: 1,
      exportedAt: "2026-05-26T10:30:00.000Z",
      profile: {
        firstName: "John",
        lastName: "Doe"
      },
      notes: [
        {
          id: "note-1",
          projectId: "project-1",
          title: "Test Note",
          content: "This is a test content",
          status: "todo",
          tags: ["test"],
          createdAt: "2026-05-26T10:30:00.000Z",
          updatedAt: "2026-05-26T10:30:00.000Z",
          archivedAt: null
        }
      ]
    };

    const result = workspaceBackupSchema.safeParse(validBackup);
    expect(result.success).toBe(true);
  });

  it("should fail validation if schema version or app name is incorrect", () => {
    const invalidBackup = {
      app: "Wrong Note",
      schemaVersion: 2,
      exportedAt: "2026-05-26T10:30:00.000Z",
      profile: {
        firstName: "John",
        lastName: "Doe"
      },
      notes: []
    };

    const result = workspaceBackupSchema.safeParse(invalidBackup);
    expect(result.success).toBe(false);
  });

  it("should validate successfully with optional projects and app settings", () => {
    const backupWithFeatures = {
      app: "MY Note",
      schemaVersion: 1,
      exportedAt: "2026-05-26T10:30:00.000Z",
      profile: {
        firstName: "John",
        lastName: "Doe"
      },
      notes: [
        {
          id: "note-1",
          projectId: "project-1",
          title: "Test Note",
          content: "This is a test content",
          status: "todo",
          tags: ["test"],
          createdAt: "2026-05-26T10:30:00.000Z",
          updatedAt: "2026-05-26T10:30:00.000Z",
          archivedAt: null
        }
      ],
      projects: [
        {
          id: "project-1",
          name: "Work Project",
          createdAt: "2026-05-26T10:30:00.000Z",
          updatedAt: "2026-05-26T10:30:00.000Z"
        }
      ],
      settings: {
        theme: "dark",
        fontFamily: "JetBrains Mono",
        wordWrap: true,
        showStatusBar: false,
        zoomPercent: 120
      }
    };

    const result = workspaceBackupSchema.safeParse(backupWithFeatures);
    expect(result.success).toBe(true);
  });
});
