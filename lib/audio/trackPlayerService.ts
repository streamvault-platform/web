// Background event handler for @rntp/player v5.
// Core playback controls (play/pause/seek from lock screen) work natively without this.
// Register it only if you need custom JS-side logic for background events (analytics, etc.).
//
// Usage: pass this factory to registerBackgroundEventHandler() in setup.native.ts.
import type { BackgroundEvent } from "@rntp/player";

export async function backgroundEventHandler(event: BackgroundEvent): Promise<void> {
  // No custom handling needed for MVP — native layer handles all remote controls.
  void event;
}
