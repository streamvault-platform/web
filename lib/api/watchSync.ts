import { apiFetch } from "./client";

export type WatchSyncRequestStatus = "PENDING" | "SYNCING" | "READY" | "FAILED";

export type ManifestEntry = {
  trackId: string;
  downloadUrl: string;
  fileSizeBytes: number;
};

export type SyncStatusResponse = {
  syncRequestId: string;
  status: WatchSyncRequestStatus;
  deviceId: string;
  trackCount: number;
  manifest: ManifestEntry[] | null;
};

export const requestWatchSync = (deviceId: string, trackIds: string[]): Promise<SyncStatusResponse> =>
  apiFetch("/sync/request", {
    method: "POST",
    body: JSON.stringify({ deviceId, trackIds }),
  });

export const getWatchSyncStatus = (syncRequestId: string): Promise<SyncStatusResponse> =>
  apiFetch(`/sync/status/${syncRequestId}`);

type SyncReadyMessage = {
  type: "SYNC_READY";
  syncRequestId: string;
  deviceId: string;
  manifest: ManifestEntry[];
};

let ws: WebSocket | null = null;

export function connectWatchSyncWs(
  serverUrl: string,
  accessToken: string,
  deviceId: string,
  onSyncReady: (message: SyncReadyMessage) => void
): void {
  if (ws?.readyState === WebSocket.OPEN) return;
  const wsUrl = serverUrl.replace(/^http/, "ws") + `/ws/watch-sync/${deviceId}`;
  try {
    ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(accessToken)}`);
    ws.onmessage = (e) => {
      try {
        const message = JSON.parse(e.data as string) as SyncReadyMessage;
        if (message.type === "SYNC_READY") onSyncReady(message);
      } catch {
        // ignore malformed messages
      }
    };
    ws.onclose = () => { ws = null; };
    ws.onerror = () => { ws = null; };
  } catch {
    ws = null;
  }
}

export function disconnectWatchSyncWs(): void {
  ws?.close();
  ws = null;
}
