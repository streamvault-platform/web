export type TrackMeta = {
  id: number | string;
  title: string;
  artist?: string | null;
  album?: string | null;
};

type StatusCallback = (positionMs: number, durationMs: number, didFinish: boolean) => void;

class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private onStatus: StatusCallback | null = null;
  private volume: number = 1;

  setOnStatusUpdate(cb: StatusCallback): void {
    this.onStatus = cb;
  }

  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) this.audio.volume = this.volume;
  }

  async load(url: string, _headers: Record<string, string>, _meta?: TrackMeta): Promise<void> {
    await this.unload();
    const audio = new Audio(url);
    audio.volume = this.volume;
    audio.ontimeupdate = () => {
      this.onStatus?.(
        Math.round(audio.currentTime * 1000),
        isFinite(audio.duration) ? Math.round(audio.duration * 1000) : 0,
        false
      );
    };
    audio.onended = () => {
      this.onStatus?.(
        Math.round(audio.currentTime * 1000),
        isFinite(audio.duration) ? Math.round(audio.duration * 1000) : 0,
        true
      );
    };
    this.audio = audio;
  }

  async play(): Promise<void> {
    await this.audio?.play();
  }

  async pause(): Promise<void> {
    this.audio?.pause();
  }

  async seek(positionMs: number): Promise<void> {
    if (!this.audio || !isFinite(positionMs) || positionMs < 0) return;
    this.audio.currentTime = positionMs / 1000;
  }

  async unload(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
  }

  stop(): void {
    this.unload();
  }
}

export const audioPlayer = new AudioPlayer();
