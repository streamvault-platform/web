import { useMutation } from "@tanstack/react-query";

import { connectWatchSyncWs, requestWatchSync } from "@/lib/api/watchSync";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { useSyncStatusStore } from "@/stores/syncStatus";

let listenerDeviceId: string | null = null;

function ensureWatchSyncListener(deviceId: string) {
  if (listenerDeviceId === deviceId) return;
  const { serverUrl } = useSettingsStore.getState();
  const { accessToken } = useAuthStore.getState();
  if (!serverUrl || !accessToken) return;

  listenerDeviceId = deviceId;
  connectWatchSyncWs(serverUrl, accessToken, deviceId, (message) => {
    useSyncStatusStore.getState().markSynced(message.manifest.map((m) => m.trackId));
  });
}

export function useTrackSyncStatus(trackId: string) {
  const isSynced = useSyncStatusStore((s) => !!s.synced[trackId]);
  const isSyncing = useSyncStatusStore((s) => !!s.syncing[trackId]);
  return { isSynced, isSyncing };
}

export function useAlbumSyncStatus(trackIds: string[]) {
  const synced = useSyncStatusStore((s) => s.synced);
  const syncing = useSyncStatusStore((s) => s.syncing);
  const isSyncing = trackIds.some((id) => syncing[id]);
  const isSynced = trackIds.length > 0 && trackIds.every((id) => synced[id]);
  return { isSynced, isSyncing };
}

export function useSyncToWatch() {
  const deviceId = useSyncStatusStore((s) => s.deviceId);
  const markSyncing = useSyncStatusStore((s) => s.markSyncing);

  return useMutation({
    mutationFn: async (trackIds: string[]) => {
      ensureWatchSyncListener(deviceId);
      return requestWatchSync(deviceId, trackIds);
    },
    onMutate: (trackIds) => markSyncing(trackIds),
  });
}
