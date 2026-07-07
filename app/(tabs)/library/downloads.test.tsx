// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPlayQueue = vi.fn();
const mockRemove = vi.fn();

vi.mock("@/stores/playback", () => ({
  usePlaybackStore: vi.fn(() => ({ playQueue: mockPlayQueue })),
}));

vi.mock("@/stores/downloads", () => ({
  useDownloadsStore: vi.fn(() => ({
    downloaded: {},
    remove: mockRemove,
  })),
}));

vi.mock("@/lib/hooks/library", () => ({
  useMyLibrary: vi.fn(() => ({ isInLibrary: () => false, tracks: [], artists: [], albums: [] })),
  useAddToLibrary: vi.fn(() => ({ mutate: vi.fn() })),
  useRemoveFromLibrary: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@/lib/hooks/playlists", () => ({
  usePlaylists: vi.fn(() => ({ data: [] })),
  useAddTrackToPlaylist: vi.fn(() => ({ mutate: vi.fn() })),
  useRemoveTrackFromPlaylist: vi.fn(() => ({ mutate: vi.fn() })),
}));

vi.mock("@/stores/queue", () => ({
  useQueueStore: vi.fn(() => ({ playNext: vi.fn(), addToQueue: vi.fn() })),
}));

vi.mock("@/lib/hooks/watchSync", () => ({
  useSyncToWatch: vi.fn(() => ({ mutate: vi.fn() })),
  useTrackSyncStatus: vi.fn(() => ({ isSynced: false, isSyncing: false })),
  useAlbumSyncStatus: vi.fn(() => ({ isSynced: false, isSyncing: false })),
}));

vi.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: ({ name }: { name: string }) => <div data-testid={`icon-${name}`}>{name}</div>,
}));

vi.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: vi.fn(() => "light"),
}));

vi.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Redirect: () => null,
}));

vi.mock("react-native", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-native")>();
  return { ...actual, Platform: { OS: "ios" } };
});

// ─── Dynamic imports ──────────────────────────────────────────────────────────

const { useDownloadsStore } = await import("@/stores/downloads");
const { default: DownloadsScreen } = await import("./downloads");

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const entry = {
  localPath: "/docs/sv-downloads/t1.mp3",
  downloadedAt: Date.now(),
  fileSizeBytes: 3_355_443,
  title: "Hey Jude",
  artistName: "The Beatles",
  mimeType: "audio/mpeg",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DownloadsScreen", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows empty state when nothing is downloaded", () => {
    vi.mocked(useDownloadsStore).mockReturnValue({
      downloaded: {},
      remove: mockRemove,
    } as ReturnType<typeof useDownloadsStore>);
    render(<DownloadsScreen />);
    expect(screen.getByText("No downloaded songs")).toBeTruthy();
  });

  it("renders a downloaded entry with title and artist", () => {
    vi.mocked(useDownloadsStore).mockReturnValue({
      downloaded: { t1: entry },
      pending: {},
      remove: mockRemove,
    } as ReturnType<typeof useDownloadsStore>);
    render(<DownloadsScreen />);
    expect(screen.getByText("Hey Jude")).toBeTruthy();
    expect(screen.getByText(/The Beatles/)).toBeTruthy();
  });

  it("shows formatted file size in the subtitle", () => {
    vi.mocked(useDownloadsStore).mockReturnValue({
      downloaded: { t1: entry },
      pending: {},
      remove: mockRemove,
    } as ReturnType<typeof useDownloadsStore>);
    render(<DownloadsScreen />);
    expect(screen.getByText(/3\.2 MB/)).toBeTruthy();
  });

  it("calls playQueue with a reconstructed track when row is tapped", () => {
    vi.mocked(useDownloadsStore).mockReturnValue({
      downloaded: { t1: entry },
      pending: {},
      remove: mockRemove,
    } as ReturnType<typeof useDownloadsStore>);
    render(<DownloadsScreen />);
    fireEvent.click(screen.getByText("Hey Jude"));
    expect(mockPlayQueue).toHaveBeenCalledWith(
      [expect.objectContaining({ id: "t1", title: "Hey Jude" })],
      0
    );
  });

  it("sorts entries newest first", () => {
    vi.mocked(useDownloadsStore).mockReturnValue({
      downloaded: {
        t1: { ...entry, title: "Older", downloadedAt: 1_000 },
        t2: { ...entry, title: "Newer", downloadedAt: 2_000 },
      },
      pending: {},
      remove: mockRemove,
    } as ReturnType<typeof useDownloadsStore>);
    render(<DownloadsScreen />);
    const items = screen.getAllByText(/Older|Newer/);
    expect(items[0].textContent).toBe("Newer");
    expect(items[1].textContent).toBe("Older");
  });
});
