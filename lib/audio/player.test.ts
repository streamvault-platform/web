// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── HTMLAudioElement mock ────────────────────────────────────────────────────

let lastAudio!: MockAudio;

class MockAudio {
  src: string;
  currentTime = 0;
  duration = 180;
  ontimeupdate: (() => void) | null = null;
  onended: (() => void) | null = null;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  constructor(src: string) {
    this.src = src;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastAudio = this;
  }
}

vi.stubGlobal("Audio", MockAudio);

// ─── Import after stub ────────────────────────────────────────────────────────

const { audioPlayer } = await import("./player");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("AudioPlayer (web)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("load()", () => {
    it("creates an Audio element with the given URL", async () => {
      await audioPlayer.load("http://example.com/track.mp3", {});
      expect(lastAudio.src).toBe("http://example.com/track.mp3");
    });

    it("unloads any previously loaded audio before loading new one", async () => {
      await audioPlayer.load("http://example.com/a.mp3", {});
      const first = lastAudio;
      await audioPlayer.load("http://example.com/b.mp3", {});
      expect(first.pause).toHaveBeenCalled();
      expect(first.src).toBe("");
    });
  });

  describe("play()", () => {
    it("calls play() on the audio element", async () => {
      await audioPlayer.load("http://example.com/track.mp3", {});
      await audioPlayer.play();
      expect(lastAudio.play).toHaveBeenCalledOnce();
    });
  });

  describe("pause()", () => {
    it("calls pause() on the audio element", async () => {
      await audioPlayer.load("http://example.com/track.mp3", {});
      await audioPlayer.pause();
      expect(lastAudio.pause).toHaveBeenCalledOnce();
    });
  });

  describe("seek()", () => {
    it("sets currentTime to positionMs / 1000", async () => {
      await audioPlayer.load("http://example.com/track.mp3", {});
      await audioPlayer.seek(30_000);
      expect(lastAudio.currentTime).toBe(30);
    });

    it("ignores negative values", async () => {
      await audioPlayer.load("http://example.com/track.mp3", {});
      await audioPlayer.seek(-1000);
      expect(lastAudio.currentTime).toBe(0);
    });

    it("ignores non-finite values", async () => {
      await audioPlayer.load("http://example.com/track.mp3", {});
      await audioPlayer.seek(Infinity);
      expect(lastAudio.currentTime).toBe(0);
    });
  });

  describe("unload()", () => {
    it("pauses and clears the audio element", async () => {
      await audioPlayer.load("http://example.com/track.mp3", {});
      const audio = lastAudio;
      await audioPlayer.unload();
      expect(audio.pause).toHaveBeenCalled();
      expect(audio.src).toBe("");
    });
  });

  describe("status callback (ontimeupdate / onended)", () => {
    it("fires the callback with positionMs and durationMs on timeupdate", async () => {
      const cb = vi.fn();
      audioPlayer.setOnStatusUpdate(cb);
      await audioPlayer.load("http://example.com/track.mp3", {});
      lastAudio.currentTime = 12;
      lastAudio.duration = 240;
      lastAudio.ontimeupdate!();
      expect(cb).toHaveBeenCalledWith(12_000, 240_000, false);
    });

    it("reports durationMs as 0 when duration is not finite", async () => {
      const cb = vi.fn();
      audioPlayer.setOnStatusUpdate(cb);
      await audioPlayer.load("http://example.com/track.mp3", {});
      lastAudio.currentTime = 5;
      lastAudio.duration = NaN;
      lastAudio.ontimeupdate!();
      expect(cb).toHaveBeenCalledWith(5_000, 0, false);
    });

    it("fires the callback with didFinish=true on ended", async () => {
      const cb = vi.fn();
      audioPlayer.setOnStatusUpdate(cb);
      await audioPlayer.load("http://example.com/track.mp3", {});
      lastAudio.currentTime = 240;
      lastAudio.duration = 240;
      lastAudio.onended!();
      expect(cb).toHaveBeenCalledWith(240_000, 240_000, true);
    });
  });
});
