import { apiFetch } from "./client";

export type UserRole = "USER" | "ARTIST" | "ADMIN";

export type AdminUser = {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
};

export const listUsers = (page = 0, size = 20): Promise<AdminUser[]> =>
  apiFetch(`/admin/users?page=${page}&size=${size}`);

export const createUser = (username: string, password: string, role: UserRole): Promise<AdminUser> =>
  apiFetch("/admin/users", { method: "POST", body: JSON.stringify({ username, password, role }) });

export const updateRole = (userId: string, role: UserRole): Promise<AdminUser> =>
  apiFetch(`/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });

export const deleteUser = (userId: string): Promise<void> =>
  apiFetch(`/admin/users/${userId}`, { method: "DELETE" });
