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

export function sendPlaybackEvent(event: object): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(event));
  }
}
