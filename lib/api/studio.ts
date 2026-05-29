import { apiFetch, apiUpload } from "./client";
import type { Album, Track } from "./library";

export type UpdateTrackMetadata = {
  title?: string;
  genre?: string;
  year?: number;
  trackNumber?: number;
  discNumber?: number;
};

export type UpdateAlbumMetadata = {
  title?: string;
  year?: number;
};

export const uploadTracks = (files: File[]): Promise<Track[]> => {
  const form = new FormData();
  for (const f of files) form.append("files", f);
  return apiUpload("/studio/upload", form);
};

export const updateTrackMetadata = (trackId: string, data: UpdateTrackMetadata): Promise<Track> =>
  apiFetch(`/tracks/${trackId}/metadata`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteTrack = (trackId: string): Promise<void> =>
  apiFetch(`/tracks/${trackId}`, { method: "DELETE" });

export const updateAlbumMetadata = (albumId: string, data: UpdateAlbumMetadata): Promise<Album> =>
  apiFetch(`/albums/${albumId}/metadata`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteAlbum = (albumId: string): Promise<void> =>
  apiFetch(`/albums/${albumId}`, { method: "DELETE" });

export const uploadCoverArt = (albumId: string, file: File): Promise<Album> => {
  const form = new FormData();
  form.append("file", file);
  return apiUpload(`/albums/${albumId}/cover`, form, "PUT");
};
