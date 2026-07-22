import { apiClient } from "./client";
import type { User, UserProfile } from "@/types/user";

export async function getCurrentUser(): Promise<User> {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

export async function registerAccount(): Promise<User> {
  const { data } = await apiClient.post("/auth/register");
  return data;
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete("/auth/me");
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data } = await apiClient.get(`/users/${userId}/profile`);
  return data;
}

export async function updateProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const { data } = await apiClient.patch("/users/me/profile", updates);
  return data;
}
