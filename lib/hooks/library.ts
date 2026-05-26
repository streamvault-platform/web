import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addToLibrary,
  getAlbum,
  getArtist,
  getMyLibrary,
  getTrack,
  listAlbums,
  listArtists,
  listTracks,
  removeFromLibrary,
  searchAlbums,
  searchArtists,
  searchTracks,
} from "@/lib/api/library";
import type { Album, Artist } from "@/lib/api/library";
import { useLibraryStore } from "@/stores/library";

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

export const useTracksByArtist = (artistId?: string) =>
  useQuery({
    queryKey: ["tracks", { artistId }],
    queryFn: () => listTracks(undefined, artistId),
    enabled: !!artistId,
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

export const useMyLibrary = () => {
  const { myTracks: cached, setMyTracks } = useLibraryStore();

  const { data, isPending } = useQuery({
    queryKey: ["library", "my"],
    queryFn: getMyLibrary,
    placeholderData: cached,
  });

  useEffect(() => {
    if (data) setMyTracks(data);
  }, [data, setMyTracks]);

  const tracks = data ?? cached;

  const artistMap = new Map<string, Artist>();
  const albumMap = new Map<string, Album>();

  for (const t of tracks) {
    if (t.artistId && !artistMap.has(t.artistId))
      artistMap.set(t.artistId, { id: t.artistId, name: t.artist ?? "" });
    if (t.albumId && !albumMap.has(t.albumId))
      albumMap.set(t.albumId, {
        id: t.albumId,
        title: t.album ?? "",
        artistId: t.artistId,
        artistName: t.artist,
        year: null,
        coverUrl: null,
      });
  }

  const libraryIds = new Set(tracks.map((t) => t.trackId));

  return {
    tracks,
    artists: [...artistMap.values()],
    albums: [...albumMap.values()],
    isPending,
    isInLibrary: (trackId: string) => libraryIds.has(trackId),
  };
};

export const useAddToLibrary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addToLibrary,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library", "my"] }),
  });
};

export const useRemoveFromLibrary = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeFromLibrary,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["library", "my"] }),
  });
};
