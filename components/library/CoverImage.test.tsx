// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("expo-image", () => ({
  Image: ({ source, testID }: { source: { uri: string }; testID?: string }) => (
    <img data-testid={testID ?? "cover-img"} src={source?.uri} alt="" />
  ),
}));

vi.mock("@/stores/settings", () => ({
  useSettingsStore: vi.fn(),
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: ({ name }: { name: string }) => (
    <div data-testid={`icon-${name}`}>{name}</div>
  ),
}));

// ─── Dynamic imports (after mocks) ───────────────────────────────────────────

const { useSettingsStore } = await import("@/stores/settings");
const { useAuthStore } = await import("@/stores/auth");
const { CoverImage } = await import("./CoverImage");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setup(serverUrl: string | null, accessToken: string | null) {
  vi.mocked(useSettingsStore).mockImplementation((sel: any) => sel({ serverUrl }));
  vi.mocked(useAuthStore).mockImplementation((sel: any) => sel({ accessToken }));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CoverImage", () => {
  it("shows placeholder when coverUrl is null", () => {
    setup("http://localhost:8080", "tok");
    render(<CoverImage coverUrl={null} size={44} />);
    expect(screen.getByTestId("icon-music.note")).toBeInTheDocument();
    expect(screen.queryByTestId("cover-img")).toBeNull();
  });

  it("shows placeholder when serverUrl is missing", () => {
    setup(null, "tok");
    render(<CoverImage coverUrl="/api/albums/abc/cover" size={44} />);
    expect(screen.getByTestId("icon-music.note")).toBeInTheDocument();
  });

  it("renders image with ?token= query on web when coverUrl and serverUrl are set", () => {
    setup("http://localhost:8080", "mytoken");
    render(<CoverImage coverUrl="/api/albums/abc/cover" size={44} />);
    const img = screen.getByTestId("cover-img") as HTMLImageElement;
    expect(img.src).toBe(
      "http://localhost:8080/api/albums/abc/cover?token=mytoken"
    );
  });

  it("renders image without token param when accessToken is null", () => {
    setup("http://localhost:8080", null);
    render(<CoverImage coverUrl="/api/albums/abc/cover" size={44} />);
    const img = screen.getByTestId("cover-img") as HTMLImageElement;
    expect(img.src).toBe("http://localhost:8080/api/albums/abc/cover");
  });
});
