// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ArtistRow } from "./ArtistRow";

const artist = { id: "a1", name: "The Beatles" };

describe("ArtistRow", () => {
  it("renders the artist name", () => {
    render(<ArtistRow artist={artist} onPress={() => {}} />);
    expect(screen.getByText("The Beatles")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = vi.fn();
    render(<ArtistRow artist={artist} onPress={onPress} />);
    fireEvent.click(screen.getByText("The Beatles"));
    expect(onPress).toHaveBeenCalledOnce();
  });
});
