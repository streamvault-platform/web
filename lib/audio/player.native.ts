import TrackPlayer from "@rntp/player";

export type TrackMeta = {
  id: number | string;
  title: string;
  artist?: string | null;
  album?: string | null;
};

class NativeAudioPlayer {
  // No-op on native — state sync handled by PlaybackSync component via RNTP hooks.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setOnStatusUpdate(_cb: (...args: any[]) => void): void {}

  load(url: string, headers: Record<string, string>, meta?: TrackMeta): void {
    TrackPlayer.setMediaItem({
      mediaId: String(meta?.id ?? ""),
      url: Object.keys(headers).length > 0 ? { uri: url, headers } : url,
      title: meta?.title ?? "Unknown",
      artist: meta?.artist ?? "Unknown Artist",
      albumTitle: meta?.album ?? undefined,
    });
  }

  play(): void {
    TrackPlayer.play();
  }

  pause(): void {
    TrackPlayer.pause();
  }

  seek(positionMs: number): void {
    if (!isFinite(positionMs) || positionMs < 0) return;
    TrackPlayer.seekTo(positionMs / 1000);
  }

  // Volume is controlled by hardware buttons on native; RNTP plays at full gain.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setVolume(_vol: number): void {}

  stop(): void {
    TrackPlayer.stop();
  }

  unload(): void {
    TrackPlayer.stop();
  }
}

export const audioPlayer = new NativeAudioPlayer();
