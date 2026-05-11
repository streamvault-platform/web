import { Audio, AVPlaybackStatus } from "expo-av";

export type TrackMeta = {
  id: number | string;
  title: string;
  artist?: string | null;
  album?: string | null;
};

type StatusCallback = (positionMs: number, durationMs: number, didFinish: boolean) => void;

class AudioPlayer {
  private sound: Audio.Sound | null = null;
  private onStatus: StatusCallback | null = null;

  async load(url: string, headers: Record<string, string>, _meta?: TrackMeta): Promise<void> {
    await this.unload();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      { uri: url, headers },
      { shouldPlay: false, progressUpdateIntervalMillis: 250 },
      this.handleStatus
    );
    this.sound = sound;
  }

  async play(): Promise<void> {
    await this.sound?.playAsync();
  }

  async pause(): Promise<void> {
    await this.sound?.pauseAsync();
  }

  async seek(positionMs: number): Promise<void> {
    if (!isFinite(positionMs) || positionMs < 0) return;
    await this.sound?.setPositionAsync(positionMs);
  }

  async unload(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  setOnStatusUpdate(cb: StatusCallback): void {
    this.onStatus = cb;
  }

  private handleStatus = (status: AVPlaybackStatus): void => {
    if (!status.isLoaded) return;
    this.onStatus?.(
      status.positionMillis,
      status.durationMillis ?? 0,
      status.didJustFinish ?? false
    );
  };
}

export const audioPlayer = new AudioPlayer();
