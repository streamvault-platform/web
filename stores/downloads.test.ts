import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Hoisted mock refs ────────────────────────────────────────────────────────

const { mockDownloadFileAsync } = vi.hoisted(() => ({
  mockDownloadFileAsync: vi.fn(),
}));

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("expo-file-system", () => {
  class MockFile {
    uri: string;
    size = 0;
    exists = false;
    delete = vi.fn();
    constructor(pathOrDir: unknown, name?: string) {
      this.uri = name ? `${String(pathOrDir)}/${name}` : String(pathOrDir);
    }
    static downloadFileAsync = mockDownloadFileAsync;
  }
  class MockDirectory {
    exists = false;
    create = vi.fn();
    delete = vi.fn();
  }
  return { File: MockFile, Directory: MockDirectory, Paths: { document: "/mock-documents" } };
});

// Override Platform.OS to "ios" so the native download path is exercised.
// (react-native is aliased to react-native-web in the test env, where OS = "web")
vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() },
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: { getState: vi.fn(() => ({ accessToken: "tok" })) },
}));

vi.mock("@/stores/settings", () => ({
  useSettingsStore: { getState: vi.fn(() => ({ serverUrl: "http://localhost:8080" })) },
}));

// ─── Dynamic imports ──────────────────────────────────────────────────────────

const { useDownloadsStore } = await import("./downloads");

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const track = {
  id: "t1",
  title: "Hey Jude",
  artistId: "a1",
  artistName: "The Beatles",
  albumId: "alb1",
  albumTitle: "Abbey Road",
  trackNumber: 1,
  discNumber: null,
  durationMs: 431_000,
  genre: "Rock",
  year: 1969,
  mimeType: "audio/mpeg",
  filePath: "/originals/hey-jude.mp3",
} as const;

const existingEntry = {
  localPath: "/mock-documents/sv-downloads/t1.mp3",
  downloadedAt: 1_000_000,
  fileSizeBytes: 4_096_000,
  title: "Hey Jude",
};

function reset() {
  useDownloadsStore.setState({ downloaded: {}, pending: {} });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useDownloadsStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reset();
  });

  it("starts with empty downloaded and pending", () => {
    const { downloaded, pending } = useDownloadsStore.getState();
    expect(downloaded).toEqual({});
    expect(pending).toEqual({});
  });

  // ── totalBytes ───────────────────────────────────────────────────────────

  describe("totalBytes()", () => {
    it("returns 0 when nothing is downloaded", () => {
      expect(useDownloadsStore.getState().totalBytes()).toBe(0);
    });

    it("sums fileSizeBytes across all entries", () => {
      useDownloadsStore.setState({
        downloaded: {
          t1: { localPath: "/a", downloadedAt: 0, fileSizeBytes: 1_000, title: "A" },
          t2: { localPath: "/b", downloadedAt: 0, fileSizeBytes: 2_500, title: "B" },
        },
      });
      expect(useDownloadsStore.getState().totalBytes()).toBe(3_500);
    });
  });

  // ── remove ───────────────────────────────────────────────────────────────

  describe("remove()", () => {
    it("removes the entry from downloaded", () => {
      useDownloadsStore.setState({ downloaded: { t1: existingEntry } });
      useDownloadsStore.getState().remove("t1");
      expect(useDownloadsStore.getState().downloaded).not.toHaveProperty("t1");
    });

    it("is a no-op for an unknown trackId", () => {
      expect(() => useDownloadsStore.getState().remove("unknown")).not.toThrow();
    });
  });

  // ── clearAll ─────────────────────────────────────────────────────────────

  describe("clearAll()", () => {
    it("empties the downloaded map", () => {
      useDownloadsStore.setState({ downloaded: { t1: existingEntry } });
      useDownloadsStore.getState().clearAll();
      expect(useDownloadsStore.getState().downloaded).toEqual({});
    });
  });

  // ── download ─────────────────────────────────────────────────────────────

  describe("download()", () => {
    it("skips if track is already downloaded", async () => {
      useDownloadsStore.setState({ downloaded: { t1: existingEntry } });
      await useDownloadsStore.getState().download(track);
      expect(mockDownloadFileAsync).not.toHaveBeenCalled();
    });

    it("skips if a download is already pending", async () => {
      useDownloadsStore.setState({ pending: { t1: true } });
      await useDownloadsStore.getState().download(track);
      expect(mockDownloadFileAsync).not.toHaveBeenCalled();
    });

    it("sets pending[trackId] while downloading", async () => {
      let pendingDuringDownload = false;
      mockDownloadFileAsync.mockImplementationOnce(async () => {
        pendingDuringDownload = !!useDownloadsStore.getState().pending["t1"];
        return { uri: "/mock/t1.mp3", size: 1024 };
      });
      await useDownloadsStore.getState().download(track);
      expect(pendingDuringDownload).toBe(true);
    });

    it("adds the entry to downloaded on success", async () => {
      mockDownloadFileAsync.mockResolvedValueOnce({ uri: "/mock/t1.mp3", size: 2_048_000 });
      await useDownloadsStore.getState().download(track);
      expect(useDownloadsStore.getState().downloaded["t1"]).toMatchObject({
        localPath: "/mock/t1.mp3",
        fileSizeBytes: 2_048_000,
        title: "Hey Jude",
      });
    });

    it("removes trackId from pending on success", async () => {
      mockDownloadFileAsync.mockResolvedValueOnce({ uri: "/mock/t1.mp3", size: 1 });
      await useDownloadsStore.getState().download(track);
      expect(useDownloadsStore.getState().pending).not.toHaveProperty("t1");
    });

    it("removes trackId from pending on failure", async () => {
      mockDownloadFileAsync.mockRejectedValueOnce(new Error("network error"));
      await useDownloadsStore.getState().download(track);
      expect(useDownloadsStore.getState().pending).not.toHaveProperty("t1");
    });

    it("does not add an entry to downloaded on failure", async () => {
      mockDownloadFileAsync.mockRejectedValueOnce(new Error("network error"));
      await useDownloadsStore.getState().download(track);
      expect(useDownloadsStore.getState().downloaded).not.toHaveProperty("t1");
    });

    it("uses the correct stream URL with token", async () => {
      mockDownloadFileAsync.mockResolvedValueOnce({ uri: "/mock/t1.mp3", size: 1 });
      await useDownloadsStore.getState().download(track);
      expect(mockDownloadFileAsync).toHaveBeenCalledWith(
        "http://localhost:8080/api/stream/t1?token=tok",
        expect.anything(),
        expect.anything()
      );
    });
  });
});
