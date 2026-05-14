import { apiFetch } from "./client";

export type PlaylistSummary = {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  isPublic: boolean;
  trackCount: number;
  createdAt: string;
};

export type PlaylistTrack = {
  trackId: string;
  title: string;
  artistName: string | null;
  albumTitle: string | null;
  durationMs: number | null;
  mimeType: string;
  position: number;
};

export type PlaylistDetail = {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  isPublic: boolean;
  tracks: PlaylistTrack[];
  createdAt: string;
};

export const listPlaylists = (): Promise<PlaylistSummary[]> =>
  apiFetch("/playlists");

export const listPublicPlaylists = (): Promise<PlaylistSummary[]> =>
  apiFetch("/playlists/public");

export const getPlaylist = (id: string): Promise<PlaylistDetail> =>
  apiFetch(`/playlists/${id}`);

export const createPlaylist = (name: string): Promise<PlaylistSummary> =>
  apiFetch("/playlists", { method: "POST", body: JSON.stringify({ name }) });

export const renamePlaylist = (id: string, name: string): Promise<PlaylistSummary> =>
  apiFetch(`/playlists/${id}`, { method: "PATCH", body: JSON.stringify({ name }) });

export const setPlaylistVisibility = (id: string, isPublic: boolean): Promise<void> =>
  apiFetch(`/playlists/${id}/visibility`, { method: "PATCH", body: JSON.stringify({ isPublic }) });

export const copyPlaylist = (id: string): Promise<PlaylistSummary> =>
  apiFetch(`/playlists/${id}/copy`, { method: "POST" });

export const deletePlaylist = (id: string): Promise<void> =>
  apiFetch(`/playlists/${id}`, { method: "DELETE" });

export const addTrackToPlaylist = (
  playlistId: string,
  trackId: string
): Promise<PlaylistTrack> =>
  apiFetch(`/playlists/${playlistId}/tracks`, {
    method: "POST",
    body: JSON.stringify({ trackId }),
  });

export const removeTrackFromPlaylist = (
  playlistId: string,
  trackId: string
): Promise<void> =>
  apiFetch(`/playlists/${playlistId}/tracks/${trackId}`, { method: "DELETE" });
