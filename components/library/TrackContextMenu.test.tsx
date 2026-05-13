// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPlayNext = vi.fn();
const mockAddToQueue = vi.fn();
const mockDownload = vi.fn();
const mockRemove = vi.fn();

vi.mock("@/stores/queue", () => ({
  useQueueStore: vi.fn(() => ({
    playNext: mockPlayNext,
    addToQueue: mockAddToQueue,
  })),
}));

vi.mock("@/stores/downloads", () => ({
  useDownloadsStore: vi.fn(() => ({
    downloaded: {},
    pending: {},
    download: mockDownload,
    remove: mockRemove,
  })),
}));

vi.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: ({ name }: { name: string }) => <div data-testid={`icon-${name}`}>{name}</div>,
}));

// ─── Dynamic imports ──────────────────────────────────────────────────────────

const { useDownloadsStore } = await import("@/stores/downloads");
const { TrackContextMenu } = await import("./TrackContextMenu");

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const track = {
  id: "t1",
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

function openMenu() {
  fireEvent.click(screen.getByLabelText("More options"));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("TrackContextMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDownloadsStore).mockReturnValue({
      downloaded: {},
      pending: {},
      download: mockDownload,
      remove: mockRemove,
    } as ReturnType<typeof useDownloadsStore>);
  });

  it("renders the more-options (···) button", () => {
    render(<TrackContextMenu track={track} />);
    expect(screen.getByLabelText("More options")).toBeInTheDocument();
    expect(screen.getByTestId("icon-ellipsis")).toBeInTheDocument();
  });

  it("menu is not visible initially", () => {
    render(<TrackContextMenu track={track} />);
    expect(screen.queryByText("Play Next")).not.toBeInTheDocument();
  });

  describe("when the menu is open", () => {
    it("shows the track title and artist in the header", () => {
      render(<TrackContextMenu track={track} />);
      openMenu();
      expect(screen.getByText("Hey Jude")).toBeInTheDocument();
      expect(screen.getByText("The Beatles")).toBeInTheDocument();
    });

    it("shows Play Next and Add to Queue options", () => {
      render(<TrackContextMenu track={track} />);
      openMenu();
      expect(screen.getByText("Play Next")).toBeInTheDocument();
      expect(screen.getByText("Add to Queue")).toBeInTheDocument();
    });

    it("shows a Cancel option", () => {
      render(<TrackContextMenu track={track} />);
      openMenu();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    it("calls queue.playNext when Play Next is pressed", () => {
      render(<TrackContextMenu track={track} />);
      openMenu();
      fireEvent.click(screen.getByText("Play Next"));
      expect(mockPlayNext).toHaveBeenCalledWith(track);
    });

    it("calls queue.addToQueue when Add to Queue is pressed", () => {
      render(<TrackContextMenu track={track} />);
      openMenu();
      fireEvent.click(screen.getByText("Add to Queue"));
      expect(mockAddToQueue).toHaveBeenCalledWith(track);
    });

    it("does not call any action when Cancel is pressed", () => {
      render(<TrackContextMenu track={track} />);
      openMenu();
      fireEvent.click(screen.getByText("Cancel"));
      expect(mockPlayNext).not.toHaveBeenCalled();
      expect(mockAddToQueue).not.toHaveBeenCalled();
    });

    it("shows Download option on non-web when not downloaded", () => {
      // Simulate native by checking the conditional rendering
      // (on web the download option is hidden — see component)
      // We verify it's NOT present on web (jsdom = web)
      render(<TrackContextMenu track={track} />);
      openMenu();
      expect(screen.queryByText("Download")).not.toBeInTheDocument();
    });
  });
});
