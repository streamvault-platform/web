// @vitest-environment jsdom
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TrackRow } from "./TrackRow";
import type { Track } from "@/lib/api/library";

const track: Track = {
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

describe("TrackRow", () => {
  it("renders the track title", () => {
    render(<TrackRow track={track} onPress={() => {}} />);
    expect(screen.getByText("Hey Jude")).toBeTruthy();
  });

  it("renders the formatted duration", () => {
    render(<TrackRow track={track} onPress={() => {}} />);
    expect(screen.getByText("7:11")).toBeTruthy();
  });

  it("renders the track number when present", () => {
    render(<TrackRow track={track} onPress={() => {}} />);
    expect(screen.getByText("4")).toBeTruthy();
  });

  it("does not render a track number element when null", () => {
    render(<TrackRow track={{ ...track, trackNumber: null }} onPress={() => {}} />);
    expect(screen.queryByText("4")).toBeNull();
  });

  it("shows '--:--' when duration is null", () => {
    render(<TrackRow track={{ ...track, durationMs: null }} onPress={() => {}} />);
    expect(screen.getByText("--:--")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = vi.fn();
    render(<TrackRow track={track} onPress={onPress} />);
    fireEvent.click(screen.getByText("Hey Jude"));
    expect(onPress).toHaveBeenCalledOnce();
  });
});
