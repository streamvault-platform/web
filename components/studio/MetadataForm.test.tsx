// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: () => "light",
}));

// ─── Dynamic imports ──────────────────────────────────────────────────────────

const { MetadataForm } = await import("./MetadataForm");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("MetadataForm", () => {
  it("renders the Title label", () => {
    render(<MetadataForm values={{}} onChange={() => {}} />);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders the title input with the correct placeholder", () => {
    render(<MetadataForm values={{}} onChange={() => {}} />);
    expect(screen.getByPlaceholderText("Track title")).toBeInTheDocument();
  });

  describe("showTrackFields", () => {
    it("shows Genre, Year and Track # fields by default", () => {
      render(<MetadataForm values={{}} onChange={() => {}} />);
      expect(screen.getByText("Genre")).toBeInTheDocument();
      expect(screen.getByText("Year")).toBeInTheDocument();
      expect(screen.getByText("Track #")).toBeInTheDocument();
    });

    it("hides Genre, Year and Track # fields when showTrackFields is false", () => {
      render(<MetadataForm values={{}} onChange={() => {}} showTrackFields={false} />);
      expect(screen.queryByText("Genre")).toBeNull();
      expect(screen.queryByText("Year")).toBeNull();
      expect(screen.queryByText("Track #")).toBeNull();
    });

    it("still shows the Title field when showTrackFields is false", () => {
      render(<MetadataForm values={{}} onChange={() => {}} showTrackFields={false} />);
      expect(screen.getByText("Title")).toBeInTheDocument();
    });
  });

  describe("onChange", () => {
    it("calls onChange with the new title while preserving other values", () => {
      const onChange = vi.fn();
      render(<MetadataForm values={{ genre: "Rock" }} onChange={onChange} />);
      fireEvent.change(screen.getByPlaceholderText("Track title"), {
        target: { value: "My Song" },
      });
      expect(onChange).toHaveBeenCalledWith({ genre: "Rock", title: "My Song" });
    });

    it("calls onChange with the new genre while preserving title", () => {
      const onChange = vi.fn();
      render(<MetadataForm values={{ title: "My Song" }} onChange={onChange} />);
      fireEvent.change(screen.getByPlaceholderText("e.g. Rock"), {
        target: { value: "Jazz" },
      });
      expect(onChange).toHaveBeenCalledWith({ title: "My Song", genre: "Jazz" });
    });

    it("calls onChange with the new year value", () => {
      const onChange = vi.fn();
      render(<MetadataForm values={{}} onChange={onChange} />);
      fireEvent.change(screen.getByPlaceholderText("2024"), {
        target: { value: "1999" },
      });
      expect(onChange).toHaveBeenCalledWith({ year: "1999" });
    });
  });
});
