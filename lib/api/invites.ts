import { apiFetch } from "./client";

export type InviteLink = {
  id: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
};

export const listInvites = (): Promise<InviteLink[]> =>
  apiFetch("/admin/invites");

export const createInvite = (expiresInDays?: number): Promise<InviteLink> =>
  apiFetch("/admin/invites", {
    method: "POST",
    body: JSON.stringify({ expiresInDays: expiresInDays ?? null }),
  });

export const deleteInvite = (id: string): Promise<void> =>
  apiFetch(`/admin/invites/${id}`, { method: "DELETE" });
