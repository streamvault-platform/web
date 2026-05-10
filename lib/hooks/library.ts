import { useQuery } from "@tanstack/react-query";

import {
  getAlbum,
  getArtist,
  getTrack,
  listAlbums,
  listArtists,
  listTracks,
  searchAlbums,
  searchArtists,
  searchTracks,
} from "@/lib/api/library";

export const useArtists = () =>
  useQuery({ queryKey: ["artists"], queryFn: () => listArtists() });

export const useArtist = (id: string) =>
  useQuery({ queryKey: ["artists", id], queryFn: () => getArtist(id), enabled: !!id });

export const useAlbums = (artistId?: string) =>
  useQuery({
    queryKey: ["albums", { artistId }],
    queryFn: () => listAlbums(artistId),
  });

export const useAlbum = (id: string) =>
  useQuery({ queryKey: ["albums", id], queryFn: () => getAlbum(id), enabled: !!id });

export const useTracks = (albumId?: string) =>
  useQuery({
    queryKey: ["tracks", { albumId }],
    queryFn: () => listTracks(albumId),
  });

export const useTrack = (id: string) =>
  useQuery({ queryKey: ["tracks", id], queryFn: () => getTrack(id), enabled: !!id });

export const useSearch = (q: string) => {
  const enabled = q.trim().length > 0;
  const artists = useQuery({
    queryKey: ["search", "artists", q],
    queryFn: () => searchArtists(q),
    enabled,
  });
  const albums = useQuery({
    queryKey: ["search", "albums", q],
    queryFn: () => searchAlbums(q),
    enabled,
  });
  const tracks = useQuery({
    queryKey: ["search", "tracks", q],
    queryFn: () => searchTracks(q),
    enabled,
  });
  const isPending = enabled && (artists.isPending || albums.isPending || tracks.isPending);
  return { artists: artists.data ?? [], albums: albums.data ?? [], tracks: tracks.data ?? [], isPending };
};
