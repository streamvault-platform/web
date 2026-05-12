import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/api/client", () => ({
  apiFetch: vi.fn(),
}));

// ─── WebSocket mock ───────────────────────────────────────────────────────────

let lastWsUrl = "";
let lastWs: MockWebSocket | null = null;

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState: number;
  close = vi.fn();
  send = vi.fn();
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(url: string) {
    lastWsUrl = url;
    lastWs = this;
    this.readyState = MockWebSocket.OPEN;
  }
}

vi.stubGlobal("WebSocket", MockWebSocket);

// ─── Dynamic imports (after mocks) ───────────────────────────────────────────

const { apiFetch } = await import("@/lib/api/client");
const {
  connectPlaybackWs,
  disconnectPlaybackWs,
  sendPlaybackEvent,
  fetchPlaybackState,
} = await import("./playback");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("fetchPlaybackState()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls apiFetch with /playback/state", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ trackId: "1", positionMs: 5000 });
    await fetchPlaybackState();
    expect(apiFetch).toHaveBeenCalledWith("/playback/state");
  });

  it("returns the server state when present", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ trackId: "42", positionMs: 12_000 });
    const result = await fetchPlaybackState();
    expect(result).toEqual({ trackId: "42", positionMs: 12_000 });
  });

  it("returns null when apiFetch resolves undefined", async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined);
    const result = await fetchPlaybackState();
    expect(result).toBeNull();
  });
});

describe("connectPlaybackWs()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnectPlaybackWs();
    lastWs = null;
    lastWsUrl = "";
  });

  it("opens a WebSocket with http→ws URL and token query param", () => {
    connectPlaybackWs("http://localhost:8080", "my-token");
    expect(lastWsUrl).toBe("ws://localhost:8080/ws/playback?token=my-token");
  });

  it("converts https→wss", () => {
    connectPlaybackWs("https://example.com", "tok");
    expect(lastWsUrl).toMatch(/^wss:\/\//);
  });

  it("does nothing when a connection is already OPEN", () => {
    connectPlaybackWs("http://localhost:8080", "tok");
    const first = lastWs;
    connectPlaybackWs("http://localhost:8080", "tok");
    expect(lastWs).toBe(first);
  });

  it("opens a new connection when previous was closed", () => {
    connectPlaybackWs("http://localhost:8080", "tok");
    const first = lastWs!;
    first.readyState = MockWebSocket.CLOSED;
    connectPlaybackWs("http://localhost:8080", "tok");
    expect(lastWs).not.toBe(first);
  });
});

describe("disconnectPlaybackWs()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnectPlaybackWs();
    lastWs = null;
  });

  it("calls close() on the open socket", () => {
    connectPlaybackWs("http://localhost:8080", "tok");
    const ws = lastWs!;
    disconnectPlaybackWs();
    expect(ws.close).toHaveBeenCalledOnce();
  });

  it("is a no-op when no socket exists", () => {
    expect(() => disconnectPlaybackWs()).not.toThrow();
  });
});

describe("sendPlaybackEvent()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    disconnectPlaybackWs();
    lastWs = null;
  });

  it("sends JSON-serialised event when socket is OPEN", () => {
    connectPlaybackWs("http://localhost:8080", "tok");
    sendPlaybackEvent({ type: "PLAY", trackId: "1", positionMs: 0 });
    expect(lastWs!.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "PLAY", trackId: "1", positionMs: 0 })
    );
  });

  it("does nothing when no socket exists", () => {
    expect(() => sendPlaybackEvent({ type: "PAUSE" })).not.toThrow();
  });

  it("does nothing when socket is not OPEN", () => {
    connectPlaybackWs("http://localhost:8080", "tok");
    lastWs!.readyState = MockWebSocket.CLOSED;
    sendPlaybackEvent({ type: "HEARTBEAT" });
    expect(lastWs!.send).not.toHaveBeenCalled();
  });
});
