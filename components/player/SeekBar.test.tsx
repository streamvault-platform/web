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
    const { container } = render(<SeekBar progress={0} durationMs={0} onSeek={onSeek} />);
    fireEvent.mouseDown(container.firstChild!);
    fireEvent.mouseUp(container.firstChild!);
    expect(onSeek).not.toHaveBeenCalled();
  });

  it("does not render a thumb when not thick and not dragging", () => {
    const { container } = render(
      <SeekBar progress={0.5} durationMs={100_000} onSeek={vi.fn()} />
    );
    const absolutes = container.querySelectorAll("[style*='position: absolute']");
    expect(absolutes).toHaveLength(0);
  });

  it("does not render a time tooltip when not dragging", () => {
    const { queryByText } = render(
      <SeekBar progress={0.5} durationMs={100_000} onSeek={vi.fn()} />
    );
    expect(queryByText(/^\d+:\d+$/)).toBeNull();
  });
});
