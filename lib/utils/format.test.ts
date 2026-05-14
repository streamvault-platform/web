import { describe, expect, it } from "vitest";
import { formatBytes, formatDownloadDate, formatDuration } from "./format";

describe("formatDuration", () => {
  it("returns '--:--' for null", () => {
    expect(formatDuration(null)).toBe("--:--");
  });

  it("formats zero as 0:00", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("pads seconds below 10", () => {
    expect(formatDuration(65_000)).toBe("1:05");
  });

  it("formats whole minutes with no leftover seconds", () => {
    expect(formatDuration(180_000)).toBe("3:00");
  });

  it("formats a typical song length", () => {
    expect(formatDuration(214_000)).toBe("3:34");
  });

  it("handles long tracks over an hour", () => {
    expect(formatDuration(3_661_000)).toBe("61:01");
  });

  it("truncates sub-second remainder without rounding up", () => {
    expect(formatDuration(59_999)).toBe("0:59");
  });
});

describe("formatBytes", () => {
  it("formats bytes below 1 KB", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats KB range", () => {
    expect(formatBytes(2_048)).toBe("2.0 KB");
  });

  it("formats MB range", () => {
    expect(formatBytes(3_355_443)).toBe("3.2 MB");
  });

  it("formats GB range", () => {
    expect(formatBytes(1_610_612_736)).toBe("1.5 GB");
  });
});

describe("formatDownloadDate", () => {
  it("returns 'Today' for a timestamp from today", () => {
    expect(formatDownloadDate(Date.now())).toBe("Today");
  });

  it("returns 'Yesterday' for a timestamp from yesterday", () => {
    const yesterday = Date.now() - 86_400_000;
    expect(formatDownloadDate(yesterday)).toBe("Yesterday");
  });

  it("returns a locale date string for older timestamps", () => {
    const old = new Date(2024, 0, 1).getTime();
    expect(formatDownloadDate(old)).toBe(new Date(old).toLocaleDateString());
  });
});
