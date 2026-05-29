// @vitest-environment jsdom
import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/components/ui/icon-symbol", () => ({
  IconSymbol: ({ name }: { name: string }) => (
    <div data-testid={`icon-${name}`} />
  ),
}));

// ─── Dynamic imports ──────────────────────────────────────────────────────────

const { FileDropzone } = await import("./FileDropzone");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("FileDropzone", () => {
  it("renders the drop prompt text", () => {
    render(<FileDropzone onFiles={() => { }} />);
    expect(screen.getByText("Drop files here or tap to browse")).toBeInTheDocument();
  });

  it("renders the supported format hint", () => {
    render(<FileDropzone onFiles={() => { }} />);
    expect(screen.getByText("MP3, FLAC, OGG, AAC/M4A")).toBeInTheDocument();
  });

  it("shows Uploading… when uploading is true", () => {
    render(<FileDropzone onFiles={() => { }} uploading />);
    expect(screen.getByText("Uploading…")).toBeInTheDocument();
  });

  it("shows the drop prompt when uploading is false", () => {
    render(<FileDropzone onFiles={() => { }} uploading={false} />);
    expect(screen.getByText("Drop files here or tap to browse")).toBeInTheDocument();
  });

  describe("file input", () => {
    it("calls onFiles with the selected files when the input changes", () => {
      const onFiles = vi.fn();
      render(<FileDropzone onFiles={onFiles} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(["content"], "track.mp3", { type: "audio/mpeg" });
      Object.defineProperty(input, "files", { value: [file], configurable: true });
      fireEvent.change(input);
      expect(onFiles).toHaveBeenCalledWith([file]);
    });

    it("does not call onFiles when no files are selected", () => {
      const onFiles = vi.fn();
      render(<FileDropzone onFiles={onFiles} />);
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      Object.defineProperty(input, "files", { value: [], configurable: true });
      fireEvent.change(input);
      expect(onFiles).not.toHaveBeenCalled();
    });
  });

  describe("drag and drop", () => {
    it("calls onFiles with the dropped files", () => {
      const onFiles = vi.fn();
      const { container } = render(<FileDropzone onFiles={onFiles} />);
      const dropzone = container.firstChild as HTMLElement;
      const file = new File(["content"], "track.mp3", { type: "audio/mpeg" });
      const dropEvent = createEvent.drop(dropzone);
      Object.defineProperty(dropEvent, "dataTransfer", { value: { files: [file] } });
      fireEvent(dropzone, dropEvent);
      expect(onFiles).toHaveBeenCalledWith([file]);
    });

    it("does not call onFiles when the dropped file list is empty", () => {
      const onFiles = vi.fn();
      const { container } = render(<FileDropzone onFiles={onFiles} />);
      const dropzone = container.firstChild as HTMLElement;
      const dropEvent = createEvent.drop(dropzone);
      Object.defineProperty(dropEvent, "dataTransfer", { value: { files: [] } });
      fireEvent(dropzone, dropEvent);
      expect(onFiles).not.toHaveBeenCalled();
    });
  });
});


