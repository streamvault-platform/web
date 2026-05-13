// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPause = vi.fn();
const mockResume = vi.fn();
const mockSeek = vi.fn();
const mockNext = vi.fn();
const mockPrevious = vi.fn();

vi.mock("@/stores/playback", () => ({
  usePlaybackStore: vi.fn(),
}));

vi.mock("@/stores/queue", () => ({
  useQueueStore: vi.fn(),
}));

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

const mockPush = vi.fn();
let mockPathname = "/library";

vi.mock("expo-router", () => ({
  router: { push: mockPush },
  usePathname: () => mockPathname,
}));

vi.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: ({ name }: { name: string }) => (
    <div data-testid={`icon-${name}`}>{name}</div>
  ),
}));

vi.mock("@/components/player/SeekBar", () => ({
  SeekBar: () => <div data-testid="seek-bar" />,
}));

// ─── Dynamic imports ──────────────────────────────────────────────────────────

const { usePlaybackStore } = await import("@/stores/playback");
const { useQueueStore } = await import("@/stores/queue");
const { MiniPlayer } = await import("./MiniPlayer");

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const track = {
  id: "1",
  title: "Hey Jude",
  artistName: "The Beatles",
  albumTitle: "Abbey Road",
  artistId: "a1",
  albumId: "alb1",
  trackNumber: 4,
  discNumber: null,
  durationMs: 431_000,
  genre: "Rock",
  year: 1969,
  mimeType: "audio/mpeg",
  filePath: "/originals/hey-jude.mp3",
};

function setupStore(
  playbackOverrides: Record<string, unknown> = {},
  queueOverrides: Record<string, unknown> = {}
) {
  vi.mocked(usePlaybackStore).mockReturnValue({
    currentTrack: track,
    isPlaying: false,
    positionMs: 0,
    durationMs: 431_000,
    pause: mockPause,
    resume: mockResume,
    seek: mockSeek,
    next: mockNext,
    previous: mockPrevious,
    ...playbackOverrides,
  } as ReturnType<typeof usePlaybackStore>);

  vi.mocked(useQueueStore).mockReturnValue({
    hasNext: false,
    hasPrevious: false,
    ...queueOverrides,
  } as ReturnType<typeof useQueueStore>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MiniPlayer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/library";
  });

  it("renders nothing when there is no current track", () => {
    vi.mocked(usePlaybackStore).mockReturnValue({
      currentTrack: null,
    } as ReturnType<typeof usePlaybackStore>);
    vi.mocked(useQueueStore).mockReturnValue({
      hasNext: false,
      hasPrevious: false,
    } as ReturnType<typeof useQueueStore>);
    const { container } = render(<MiniPlayer />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when on the /player screen", () => {
    mockPathname = "/player";
    setupStore();
    const { container } = render(<MiniPlayer />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the track title", () => {
    setupStore();
    render(<MiniPlayer />);
    expect(screen.getByText("Hey Jude")).toBeInTheDocument();
  });

  it("shows the artist name", () => {
    setupStore();
    render(<MiniPlayer />);
    expect(screen.getByText("The Beatles")).toBeInTheDocument();
  });

  it("renders the SeekBar", () => {
    setupStore();
    render(<MiniPlayer />);
    expect(screen.getByTestId("seek-bar")).toBeInTheDocument();
  });

  it("shows play icon when paused", () => {
    setupStore({ isPlaying: false });
    render(<MiniPlayer />);
    expect(screen.getByTestId("icon-play.fill")).toBeInTheDocument();
  });

  it("shows pause icon when playing", () => {
    setupStore({ isPlaying: true });
    render(<MiniPlayer />);
    expect(screen.getByTestId("icon-pause.fill")).toBeInTheDocument();
  });

  it("calls pause() when pressing the button while playing", () => {
    setupStore({ isPlaying: true });
    render(<MiniPlayer />);
    fireEvent.click(screen.getByLabelText("Pause"));
    expect(mockPause).toHaveBeenCalledOnce();
  });

  it("calls resume() when pressing the button while paused", () => {
    setupStore({ isPlaying: false });
    render(<MiniPlayer />);
    fireEvent.click(screen.getByLabelText("Play"));
    expect(mockResume).toHaveBeenCalledOnce();
  });

  it("navigates to /player when tapping the track info", () => {
    setupStore();
    render(<MiniPlayer />);
    fireEvent.click(screen.getByText("Hey Jude"));
    expect(mockPush).toHaveBeenCalledWith("/player");
  });

  // ── Previous / Next buttons ───────────────────────────────────────────────

  it("renders the previous button", () => {
    setupStore();
    render(<MiniPlayer />);
    expect(screen.getByLabelText("Previous")).toBeInTheDocument();
    expect(screen.getByTestId("icon-backward.fill")).toBeInTheDocument();
  });

  it("renders the next button", () => {
    setupStore();
    render(<MiniPlayer />);
    expect(screen.getByLabelText("Next")).toBeInTheDocument();
    expect(screen.getByTestId("icon-forward.fill")).toBeInTheDocument();
  });

  it("calls previous() when pressing the previous button", () => {
    setupStore({}, { hasPrevious: true });
    render(<MiniPlayer />);
    fireEvent.click(screen.getByLabelText("Previous"));
    expect(mockPrevious).toHaveBeenCalledOnce();
  });

  it("calls next() when pressing the next button", () => {
    setupStore({}, { hasNext: true });
    render(<MiniPlayer />);
    fireEvent.click(screen.getByLabelText("Next"));
    expect(mockNext).toHaveBeenCalledOnce();
  });

  it("dims the previous button when hasPrevious is false", () => {
    setupStore({}, { hasPrevious: false });
    render(<MiniPlayer />);
    const btn = screen.getByLabelText("Previous").closest("[style]");
    expect(btn?.getAttribute("style")).toContain("opacity: 0.3");
  });

  it("dims the next button when hasNext is false", () => {
    setupStore({}, { hasNext: false });
    render(<MiniPlayer />);
    const btn = screen.getByLabelText("Next").closest("[style]");
    expect(btn?.getAttribute("style")).toContain("opacity: 0.3");
  });

  it("shows previous button at full opacity when hasPrevious is true", () => {
    setupStore({}, { hasPrevious: true });
    render(<MiniPlayer />);
    const btn = screen.getByLabelText("Previous").closest("[style]");
    expect(btn?.getAttribute("style")).toContain("opacity: 1");
  });

  it("shows next button at full opacity when hasNext is true", () => {
    setupStore({}, { hasNext: true });
    render(<MiniPlayer />);
    const btn = screen.getByLabelText("Next").closest("[style]");
    expect(btn?.getAttribute("style")).toContain("opacity: 1");
  });
});
