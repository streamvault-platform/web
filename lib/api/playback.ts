import { apiFetch } from "@/lib/api/client";

type ServerPlaybackState = { trackId: string; positionMs: number };

export async function fetchPlaybackState(): Promise<ServerPlaybackState | null> {
  const result = await apiFetch<ServerPlaybackState | undefined>("/playback/state");
  return result ?? null;
}

let ws: WebSocket | null = null;

export function connectPlaybackWs(serverUrl: string, accessToken: string): void {
  if (ws?.readyState === WebSocket.OPEN) return;
  const wsUrl = serverUrl.replace(/^http/, "ws") + "/ws/playback";
  try {
    ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(accessToken)}`);
    ws.onclose = () => { ws = null; };
    ws.onerror = () => { ws = null; };
  } catch {
    ws = null;
  }
}

export function disconnectPlaybackWs(): void {
  ws?.close();
  ws = null;
}

//TODO: type the event object
export function sendPlaybackEvent(event: object): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}
