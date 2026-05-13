import { apiFetch } from "./client";

export type Artist = {
  id: string;
  name: string;
};

export type Album = {
  id: string;
  title: string;
  artistId: string | null;
  artistName: string | null;
  year: number | null;
};

export type Track = {
  id: string;
  title: string;
  filePath: string;
  artistId: string | null;
  artistName: string | null;
  albumId: string | null;
  albumTitle: string | null;
  trackNumber: number | null;
  discNumber: number | null;
  durationMs: number | null;
  genre: string | null;
  year: number | null;
  mimeType: string;
};

export const listArtists = (page = 0, size = 200): Promise<Artist[]> =>
  apiFetch(`/library/artists?page=${page}&size=${size}`);

export const getArtist = (id: string): Promise<Artist> =>
  apiFetch(`/library/artists/${id}`);

export const listAlbums = (artistId?: string, page = 0, size = 200): Promise<Album[]> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (artistId) params.set("artistId", artistId);
  return apiFetch(`/library/albums?${params}`);
};

export const getAlbum = (id: string): Promise<Album> =>
  apiFetch(`/library/albums/${id}`);

export const listTracks = (albumId?: string, page = 0, size = 200): Promise<Track[]> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (albumId) params.set("albumId", albumId);
  return apiFetch(`/library/tracks?${params}`);
};

export const getTrack = (id: string): Promise<Track> =>
  apiFetch(`/library/tracks/${id}`);

export const searchArtists = (q: string): Promise<Artist[]> =>
  apiFetch(`/library/artists?q=${encodeURIComponent(q)}`);

export const searchAlbums = (q: string): Promise<Album[]> =>
  apiFetch(`/library/albums?q=${encodeURIComponent(q)}`);

export const searchTracks = (q: string): Promise<Track[]> =>
  apiFetch(`/library/tracks?q=${encodeURIComponent(q)}`);

export type UserLibraryTrack = {
  trackId: string;
  artistId: string | null;
  albumId: string | null;
  title: string;
  artist: string | null;
  album: string | null;
  durationMs: number | null;
  mimeType: string;
  addedAt: string;
};

export const getMyLibrary = (): Promise<UserLibraryTrack[]> =>
  apiFetch("/library/my");

export const addToLibrary = (trackId: string): Promise<UserLibraryTrack> =>
  apiFetch("/library/my", { method: "POST", body: JSON.stringify({ trackId }) });

export const removeFromLibrary = (trackId: string): Promise<void> =>
  apiFetch(`/library/my/${trackId}`, { method: "DELETE" });
