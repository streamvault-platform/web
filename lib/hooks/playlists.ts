import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addTrackToPlaylist,
  copyPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylist,
  listPlaylists,
  listPublicPlaylists,
  removeTrackFromPlaylist,
  renamePlaylist,
  setPlaylistVisibility,
} from "@/lib/api/playlists";

export const usePlaylists = () =>
  useQuery({ queryKey: ["playlists"], queryFn: listPlaylists });

export const usePublicPlaylists = () =>
  useQuery({ queryKey: ["playlists", "public"], queryFn: listPublicPlaylists });

export const usePlaylist = (id: string) =>
  useQuery({
    queryKey: ["playlists", id],
    queryFn: () => getPlaylist(id),
    enabled: !!id,
  });

export const useCreatePlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createPlaylist(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
};

export const useRenamePlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      renamePlaylist(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
};

export const useSetPlaylistVisibility = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      setPlaylistVisibility(id, isPublic),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["playlists"] });
      qc.invalidateQueries({ queryKey: ["playlists", id] });
      qc.invalidateQueries({ queryKey: ["playlists", "public"] });
    },
  });
};

export const useCopyPlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => copyPlaylist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
};

export const useDeletePlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlaylist(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });
};

export const useAddTrackToPlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
      addTrackToPlaylist(playlistId, trackId),
    onSuccess: (_data, { playlistId }) =>
      qc.invalidateQueries({ queryKey: ["playlists", playlistId] }),
  });
};

export const useRemoveTrackFromPlaylist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: string; trackId: string }) =>
      removeTrackFromPlaylist(playlistId, trackId),
    onSuccess: (_data, { playlistId }) =>
      qc.invalidateQueries({ queryKey: ["playlists", playlistId] }),
  });
};
