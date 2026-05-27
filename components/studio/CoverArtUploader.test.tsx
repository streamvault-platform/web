// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockUpload = vi.fn();

vi.mock("@/lib/hooks/studio", () => ({
  useUploadCoverArt: vi.fn(() => ({ mutate: mockUpload, isPending: false })),
}));

vi.mock("@/components/library/CoverImage", () => ({
  CoverImage: ({ coverUrl }: { coverUrl: string | null }) =>
    coverUrl ? (
      <img data-testid="cover-img" src={coverUrl} alt="" />
    ) : (
      <div data-testid="cover-placeholder" />
    ),
}));

vi.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: ({ name }: { name: string }) => (
    <div data-testid={`icon-${name}`} />
  ),
}));

// ─── Dynamic imports ──────────────────────────────────────────────────────────

const { useUploadCoverArt } = await import("@/lib/hooks/studio");
const { CoverArtUploader } = await import("./CoverArtUploader");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("CoverArtUploader", () => {
  beforeEach(() => {
    vi.mocked(useUploadCoverArt).mockReturnValue({
      mutate: mockUpload,
      isPending: false,
    } as ReturnType<typeof useUploadCoverArt>);
    mockUpload.mockReset();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview-url");
  });

  it('shows "Add cover art" when currentCoverUrl is null', () => {
    render(<CoverArtUploader albumId="a-1" currentCoverUrl={null} />);
    expect(screen.getByText("Add cover art")).toBeInTheDocument();
  });

  it('shows "Change cover" when currentCoverUrl is set', () => {
    render(<CoverArtUploader albumId="a-1" currentCoverUrl="/api/albums/a-1/cover" />);
    expect(screen.getByText("Change cover")).toBeInTheDocument();
  });

  it('shows "Uploading…" when isPending is true', () => {
    vi.mocked(useUploadCoverArt).mockReturnValue({
      mutate: mockUpload,
      isPending: true,
    } as ReturnType<typeof useUploadCoverArt>);
    render(<CoverArtUploader albumId="a-1" currentCoverUrl={null} />);
    expect(screen.getByText("Uploading…")).toBeInTheDocument();
  });

  it("renders the cover image when currentCoverUrl is set", () => {
    render(<CoverArtUploader albumId="a-1" currentCoverUrl="/api/albums/a-1/cover" />);
    expect(screen.getByTestId("cover-img")).toBeInTheDocument();
  });

  it("renders the placeholder when currentCoverUrl is null", () => {
    render(<CoverArtUploader albumId="a-1" currentCoverUrl={null} />);
    expect(screen.getByTestId("cover-placeholder")).toBeInTheDocument();
  });

  describe("file selection", () => {
    it("calls upload with albumId and the selected file", () => {
      render(<CoverArtUploader albumId="a-1" currentCoverUrl={null} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(["img"], "cover.jpg", { type: "image/jpeg" });
      Object.defineProperty(input, "files", { value: [file], configurable: true });
      fireEvent.change(input);
      expect(mockUpload).toHaveBeenCalledWith(
        { albumId: "a-1", file },
        expect.any(Object)
      );
    });

    it("calls URL.createObjectURL to generate a preview", () => {
      render(<CoverArtUploader albumId="a-1" currentCoverUrl={null} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(["img"], "cover.jpg", { type: "image/jpeg" });
      Object.defineProperty(input, "files", { value: [file], configurable: true });
      fireEvent.change(input);
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });
  });
});
