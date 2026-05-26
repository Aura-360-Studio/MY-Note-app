import { z } from "zod";
import { NOTE_STATUSES } from "../types/note.types";

export const noteSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string(),
  content: z.string(),
  status: z.enum(NOTE_STATUSES),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  archivedAt: z.string().nullable()
});

export const userProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string()
});

export const projectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const appSettingsSchema = z.object({
  theme: z.string().optional(),
  fontFamily: z.string().optional(),
  wordWrap: z.boolean().optional(),
  showStatusBar: z.boolean().optional(),
  zoomPercent: z.number().optional()
}).optional();

export const workspaceBackupSchema = z.object({
  app: z.literal("MY Note"),
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  profile: userProfileSchema,
  notes: z.array(noteSchema),
  projects: z.array(projectSchema).optional(),
  settings: appSettingsSchema
});

export type WorkspaceBackup = z.infer<typeof workspaceBackupSchema>;
