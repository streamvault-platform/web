// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/library/CoverImage", () => ({
  CoverImage: () => <div data-testid="cover-image" />,
}));

import { AlbumRow } from "./AlbumRow";

const album = { id: "alb1", title: "Abbey Road", artistId: "a1", artistName: "The Beatles", year: 1969, coverUrl: null };

describe("AlbumRow", () => {
  it("renders the album title", () => {
    render(<AlbumRow album={album} onPress={() => {}} />);
    expect(screen.getByText("Abbey Road")).toBeTruthy();
  });

  it("renders the year when present", () => {
    render(<AlbumRow album={album} onPress={() => {}} />);
    expect(screen.getByText("1969")).toBeTruthy();
  });

  it("does not render a year element when year is null", () => {
    render(<AlbumRow album={{ ...album, year: null }} onPress={() => {}} />);
    expect(screen.queryByText("1969")).toBeNull();
  });

  it("calls onPress when tapped", () => {
    const onPress = vi.fn();
    render(<AlbumRow album={album} onPress={onPress} />);
    fireEvent.click(screen.getByText("Abbey Road"));
    expect(onPress).toHaveBeenCalledOnce();
  });

  it("renders the cover image slot", () => {
    render(<AlbumRow album={album} onPress={() => {}} />);
    expect(screen.getByTestId("cover-image")).toBeInTheDocument();
  });
});
