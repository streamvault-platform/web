import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteAlbum,
  deleteTrack,
  updateAlbumMetadata,
  updateTrackMetadata,
  uploadCoverArt,
  uploadTracks,
  type UpdateAlbumMetadata,
  type UpdateTrackMetadata,
} from "@/lib/api/studio";
import { useDownloadsStore } from "@/stores/downloads";

export const useUploadTracks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => uploadTracks(files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tracks"] });
      qc.invalidateQueries({ queryKey: ["albums"] });
      qc.invalidateQueries({ queryKey: ["artists"] });
    },
  });
};

export const useUpdateTrackMetadata = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trackId, data }: { trackId: string; data: UpdateTrackMetadata }) =>
      updateTrackMetadata(trackId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tracks"] }),
  });
};

export const useDeleteTrack = () => {
  const qc = useQueryClient();
  const removeDownload = useDownloadsStore((s) => s.remove);
  return useMutation({
    mutationFn: (trackId: string) => deleteTrack(trackId),
    onSuccess: (_, trackId) => {
      removeDownload(trackId);
      qc.invalidateQueries({ queryKey: ["tracks"] });
      qc.invalidateQueries({ queryKey: ["library", "my"] });
    },
  });
};

export const useUpdateAlbumMetadata = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ albumId, data }: { albumId: string; data: UpdateAlbumMetadata }) =>
      updateAlbumMetadata(albumId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["albums"] }),
  });
};

export const useDeleteAlbum = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (albumId: string) => deleteAlbum(albumId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["albums"] });
      qc.invalidateQueries({ queryKey: ["tracks"] });
    },
  });
};

export const useUploadCoverArt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ albumId, file }: { albumId: string; file: File }) =>
      uploadCoverArt(albumId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["albums"] }),
  });
};
