import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Track } from "@/lib/api/library";

// ─── Mocks (hoisted before imports) ──────────────────────────────────────────

let capturedStatusCallback:
  | ((positionMs: number, durationMs: number, didFinish: boolean) => void)
  | undefined;

vi.mock("@/lib/audio/player", () => ({
  audioPlayer: {
    load: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    seek: vi.fn(),
    unload: vi.fn(),
    setOnStatusUpdate: vi.fn((cb) => {
      capturedStatusCallback = cb;
    }),
  },
}));

vi.mock("@/lib/api/playback", () => ({
  connectPlaybackWs: vi.fn(),
  disconnectPlaybackWs: vi.fn(),
  sendPlaybackEvent: vi.fn(),
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: {
    getState: vi.fn(() => ({ accessToken: "test-token" })),
  },
}));

vi.mock("@/stores/settings", () => ({
  useSettingsStore: {
    getState: vi.fn(() => ({ serverUrl: "http://localhost:8080" })),
  },
}));

// ─── Dynamic imports (after mocks) ───────────────────────────────────────────

const { usePlaybackStore } = await import("./playback");
const { audioPlayer } = await import("@/lib/audio/player");
const { connectPlaybackWs, disconnectPlaybackWs, sendPlaybackEvent } =
  await import("@/lib/api/playback");

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const track: Track = {
  id: "1",
  title: "Hey Jude",
  filePath: "/originals/hey-jude.mp3",
  artistId: "a1",
  artistName: "The Beatles",
  albumId: "alb1",
  albumTitle: "Abbey Road",
  trackNumber: 4,
  discNumber: null,
  durationMs: 431_000,
  genre: "Rock",
  year: 1969,
  mimeType: "audio/mpeg",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetStore() {
  usePlaybackStore.setState({
    currentTrack: null,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("usePlaybackStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial state ────────────────────────────────────────────────────────

  it("starts with no track and paused state", () => {
    const { currentTrack, isPlaying, positionMs, durationMs } =
      usePlaybackStore.getState();
    expect(currentTrack).toBeNull();
    expect(isPlaying).toBe(false);
    expect(positionMs).toBe(0);
    expect(durationMs).toBe(0);
  });

  // ── play ─────────────────────────────────────────────────────────────────

  describe("play()", () => {
    it("loads the stream URL with token query param on web", async () => {
      await usePlaybackStore.getState().play(track);
      expect(audioPlayer.load).toHaveBeenCalledWith(
        "http://localhost:8080/api/stream/1?token=test-token",
        {},
        expect.objectContaining({ id: "1", title: "Hey Jude" })
      );
    });

    it("sets currentTrack and isPlaying after loading", async () => {
      await usePlaybackStore.getState().play(track);
      const state = usePlaybackStore.getState();
      expect(state.currentTrack).toEqual(track);
      expect(state.isPlaying).toBe(true);
      expect(state.positionMs).toBe(0);
    });

    it("calls audioPlayer.play()", async () => {
      await usePlaybackStore.getState().play(track);
      expect(audioPlayer.play).toHaveBeenCalledOnce();
    });

    it("connects the playback WebSocket", async () => {
      await usePlaybackStore.getState().play(track);
      expect(connectPlaybackWs).toHaveBeenCalledWith(
        "http://localhost:8080",
        "test-token"
      );
    });

    it("sends a PLAY event immediately", async () => {
      await usePlaybackStore.getState().play(track);
      expect(sendPlaybackEvent).toHaveBeenCalledWith({
        type: "PLAY",
        trackId: "1",
        positionMs: 0,
      });
    });

    it("sends heartbeat events every 15 seconds", async () => {
      vi.useFakeTimers();
      await usePlaybackStore.getState().play(track);
      vi.clearAllMocks();

      vi.advanceTimersByTime(15_000);
      expect(sendPlaybackEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: "HEARTBEAT", trackId: "1" })
      );

      vi.advanceTimersByTime(15_000);
      expect(sendPlaybackEvent).toHaveBeenCalledTimes(2);
    });
  });

  // ── pause ────────────────────────────────────────────────────────────────

  describe("pause()", () => {
    it("calls audioPlayer.pause() and sets isPlaying false", async () => {
      usePlaybackStore.setState({ currentTrack: track, isPlaying: true, positionMs: 5000 });
      await usePlaybackStore.getState().pause();
      expect(audioPlayer.pause).toHaveBeenCalledOnce();
      expect(usePlaybackStore.getState().isPlaying).toBe(false);
    });

    it("sends a PAUSE event with current position", async () => {
      usePlaybackStore.setState({ currentTrack: track, isPlaying: true, positionMs: 30_000 });
      await usePlaybackStore.getState().pause();
      expect(sendPlaybackEvent).toHaveBeenCalledWith({
        type: "PAUSE",
        trackId: "1",
        positionMs: 30_000,
      });
    });

    it("stops the heartbeat timer", async () => {
      vi.useFakeTimers();
      await usePlaybackStore.getState().play(track);
      vi.clearAllMocks();

      await usePlaybackStore.getState().pause();
      vi.advanceTimersByTime(30_000);

      // sendPlaybackEvent should only have the PAUSE call, no heartbeats
      expect(sendPlaybackEvent).toHaveBeenCalledOnce();
      expect(sendPlaybackEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "PAUSE" }));
    });
  });

  // ── resume ───────────────────────────────────────────────────────────────

  describe("resume()", () => {
    it("calls audioPlayer.play() and sets isPlaying true", async () => {
      usePlaybackStore.setState({ currentTrack: track, isPlaying: false, positionMs: 10_000 });
      await usePlaybackStore.getState().resume();
      expect(audioPlayer.play).toHaveBeenCalledOnce();
      expect(usePlaybackStore.getState().isPlaying).toBe(true);
    });

    it("sends a PLAY event from current position when resuming from pause", async () => {
      usePlaybackStore.setState({ currentTrack: track, isPlaying: false, positionMs: 45_000 });
      await usePlaybackStore.getState().resume();
      expect(sendPlaybackEvent).toHaveBeenCalledWith({
        type: "PLAY",
        trackId: "1",
        positionMs: 45_000,
      });
    });

    it("does not send a PLAY event if already playing", async () => {
      usePlaybackStore.setState({ currentTrack: track, isPlaying: true, positionMs: 0 });
      await usePlaybackStore.getState().resume();
      expect(sendPlaybackEvent).not.toHaveBeenCalled();
    });
  });

  // ── seek ─────────────────────────────────────────────────────────────────

  describe("seek()", () => {
    it("calls audioPlayer.seek() and updates positionMs", async () => {
      await usePlaybackStore.getState().seek(90_000);
      expect(audioPlayer.seek).toHaveBeenCalledWith(90_000);
      expect(usePlaybackStore.getState().positionMs).toBe(90_000);
    });
  });

  // ── stop ─────────────────────────────────────────────────────────────────

  describe("stop()", () => {
    it("resets all playback state", async () => {
      usePlaybackStore.setState({ currentTrack: track, isPlaying: true, positionMs: 60_000, durationMs: 200_000 });
      await usePlaybackStore.getState().stop();
      const state = usePlaybackStore.getState();
      expect(state.currentTrack).toBeNull();
      expect(state.isPlaying).toBe(false);
      expect(state.positionMs).toBe(0);
      expect(state.durationMs).toBe(0);
    });

    it("calls audioPlayer.unload() and disconnects WS", async () => {
      await usePlaybackStore.getState().stop();
      expect(audioPlayer.unload).toHaveBeenCalledOnce();
      expect(disconnectPlaybackWs).toHaveBeenCalledOnce();
    });
  });

  // ── status callback (web / expo-av) ──────────────────────────────────────

  describe("status callback (web)", () => {
    it("updates positionMs and durationMs from expo-av status", () => {
      capturedStatusCallback?.(12_000, 240_000, false);
      const state = usePlaybackStore.getState();
      expect(state.positionMs).toBe(12_000);
      expect(state.durationMs).toBe(240_000);
      expect(state.isPlaying).toBe(false); // unchanged
    });

    it("sets isPlaying to false when track finishes", () => {
      usePlaybackStore.setState({ isPlaying: true });
      capturedStatusCallback?.(240_000, 240_000, true);
      expect(usePlaybackStore.getState().isPlaying).toBe(false);
    });
  });
});
