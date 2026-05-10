import { describe, expect, it } from "vitest";
import { formatDuration } from "./format";

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
