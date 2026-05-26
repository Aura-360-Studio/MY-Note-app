import { db } from "../db";
import {
  DEFAULT_PROJECT_ID,
  DEFAULT_PROJECT_NAME,
  type Project
} from "../../features/projects/types/project.types";

export const projectRepository = {
  async list(): Promise<Project[]> {
    const projects = await db.projects.toArray();
    const hasDefault = projects.some((p) => p.id === DEFAULT_PROJECT_ID);
    if (!hasDefault) {
      const now = new Date().toISOString();
      const fallback: Project = {
        id: DEFAULT_PROJECT_ID,
        name: DEFAULT_PROJECT_NAME,
        createdAt: now,
        updatedAt: now
      };
      await db.projects.put(fallback);
      projects.push(fallback);
    }
    projects.sort((a, b) => {
      if (a.id === DEFAULT_PROJECT_ID) return -1;
      if (b.id === DEFAULT_PROJECT_ID) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    return projects;
  },

  async create(name: string): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      name,
      createdAt: now,
      updatedAt: now
    };
    await db.projects.add(project);
    return project;
  },

  async remove(projectId: string): Promise<void> {
    await db.projects.delete(projectId);
  },

  async replaceAll(projects: Project[]): Promise<void> {
    await db.transaction("rw", db.projects, async () => {
      await db.projects.clear();
      await db.projects.bulkPut(projects);
    });
  }
};
