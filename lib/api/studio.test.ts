import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteAlbum,
  deleteTrack,
  updateAlbumMetadata,
  updateTrackMetadata,
  uploadCoverArt,
  uploadTracks,
} from "./studio";

vi.mock("./client", () => ({
  apiFetch: vi.fn(),
  apiUpload: vi.fn(),
}));

import { apiFetch, apiUpload } from "./client";
const mockedFetch = vi.mocked(apiFetch);
const mockedUpload = vi.mocked(apiUpload);

beforeEach(() => {
  mockedFetch.mockReset();
  mockedUpload.mockReset();
});

describe("uploadTracks", () => {
  it("calls apiUpload POST /studio/upload with a FormData containing all files", () => {
    mockedUpload.mockResolvedValue([]);
    const fileA = new File(["a"], "a.mp3", { type: "audio/mpeg" });
    const fileB = new File(["b"], "b.mp3", { type: "audio/mpeg" });
    uploadTracks([fileA, fileB]);
    expect(mockedUpload).toHaveBeenCalledTimes(1);
    const [path, form] = mockedUpload.mock.calls[0];
    expect(path).toBe("/studio/upload");
    expect(form).toBeInstanceOf(FormData);
    const entries = [...(form as FormData).getAll("files")];
    expect(entries).toHaveLength(2);
  });
});

describe("updateTrackMetadata", () => {
  it("PATCHes /tracks/:id/metadata with the provided fields", () => {
    mockedFetch.mockResolvedValue({});
    updateTrackMetadata("t-1", { title: "New Title", year: 2024 });
    expect(mockedFetch).toHaveBeenCalledWith("/tracks/t-1/metadata", {
      method: "PATCH",
      body: JSON.stringify({ title: "New Title", year: 2024 }),
    });
  });

  it("sends only the fields that are provided", () => {
    mockedFetch.mockResolvedValue({});
    updateTrackMetadata("t-2", { genre: "Jazz" });
    expect(mockedFetch).toHaveBeenCalledWith("/tracks/t-2/metadata", {
      method: "PATCH",
      body: JSON.stringify({ genre: "Jazz" }),
    });
  });
});

describe("deleteTrack", () => {
  it("DELETEs /tracks/:id", () => {
    mockedFetch.mockResolvedValue(undefined);
    deleteTrack("t-1");
    expect(mockedFetch).toHaveBeenCalledWith("/tracks/t-1", { method: "DELETE" });
  });
});

describe("updateAlbumMetadata", () => {
  it("PATCHes /albums/:id/metadata with the provided fields", () => {
    mockedFetch.mockResolvedValue({});
    updateAlbumMetadata("a-1", { title: "New Album", year: 2020 });
    expect(mockedFetch).toHaveBeenCalledWith("/albums/a-1/metadata", {
      method: "PATCH",
      body: JSON.stringify({ title: "New Album", year: 2020 }),
    });
  });
});

describe("deleteAlbum", () => {
  it("DELETEs /albums/:id", () => {
    mockedFetch.mockResolvedValue(undefined);
    deleteAlbum("a-1");
    expect(mockedFetch).toHaveBeenCalledWith("/albums/a-1", { method: "DELETE" });
  });
});

describe("uploadCoverArt", () => {
  it("calls apiUpload PUT /albums/:id/cover with a FormData containing the file", () => {
    mockedUpload.mockResolvedValue({});
    const file = new File(["img"], "cover.jpg", { type: "image/jpeg" });
    uploadCoverArt("a-1", file);
    expect(mockedUpload).toHaveBeenCalledTimes(1);
    const [path, form, method] = mockedUpload.mock.calls[0];
    expect(path).toBe("/albums/a-1/cover");
    expect(method).toBe("PUT");
    expect(form).toBeInstanceOf(FormData);
    expect((form as FormData).get("file")).toBe(file);
  });
});
