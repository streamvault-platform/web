// @vitest-environment jsdom
import { render, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SeekBar } from "./SeekBar";

describe("SeekBar", () => {
  it("renders the filled portion at correct width", () => {
    const { container } = render(
      <SeekBar progress={0.4} durationMs={100_000} onSeek={vi.fn()} />
    );
    const fill = container.querySelector("[style*='width']") as HTMLElement;
    expect(fill?.style.width).toBe("40%");
  });

  it("clamps progress above 1 to 100%", () => {
    const { container } = render(
      <SeekBar progress={1.5} durationMs={100_000} onSeek={vi.fn()} />
    );
    const fill = container.querySelector("[style*='width']") as HTMLElement;
    expect(fill?.style.width).toBe("100%");
  });

  it("shows 0% fill when progress is 0", () => {
    const { container } = render(
      <SeekBar progress={0} durationMs={100_000} onSeek={vi.fn()} />
    );
    const fill = container.querySelector("[style*='width']") as HTMLElement;
    expect(fill?.style.width).toBe("0%");
  });

  it("does not call onSeek when durationMs is 0", () => {
    const onSeek = vi.fn();
    render(<SeekBar progress={0} durationMs={0} onSeek={onSeek} />);
    fireEvent.click(document.querySelector('[style*="position: absolute"]')!);
    expect(onSeek).not.toHaveBeenCalled();
  });
});
