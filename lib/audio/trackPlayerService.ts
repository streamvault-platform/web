import type { BackgroundEvent } from "@rntp/player";
import { Event } from "@rntp/player";

import { usePlaybackStore } from "@/stores/playback";

export async function backgroundEventHandler(event: BackgroundEvent): Promise<void> {
  if (event.type === Event.RemoteNext) {
    await usePlaybackStore.getState().next();
  } else if (event.type === Event.RemotePrevious) {
    await usePlaybackStore.getState().previous();
  }
}
