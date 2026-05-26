import { db } from "../db";
import { DEFAULT_PROFILE_ID, type UserProfile } from "../../features/profile/types/profile.types";

export const profileRepository = {
  async get(): Promise<UserProfile> {
    const existing = await db.profiles.get(DEFAULT_PROFILE_ID);
    if (existing) {
      return existing;
    }
    const created: UserProfile = {
      id: DEFAULT_PROFILE_ID,
      firstName: "",
      lastName: "",
      updatedAt: new Date().toISOString()
    };
    await db.profiles.put(created);
    return created;
  },

  async update(changes: Pick<UserProfile, "firstName" | "lastName">): Promise<UserProfile> {
    const current = await this.get();
    const updated: UserProfile = {
      ...current,
      ...changes,
      updatedAt: new Date().toISOString()
    };
    await db.profiles.put(updated);
    return updated;
  },

  async replace(profile: Pick<UserProfile, "firstName" | "lastName">): Promise<UserProfile> {
    return this.update(profile);
  }
};
