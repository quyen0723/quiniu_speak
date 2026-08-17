// Sequential playback manager for voice chunks. Holds Blob URLs and plays them one
// after another with gapless handoff via the `ended` event. Exposes approximate seek
// across the whole text by index proportional to the requested ratio.
//
// MVP uses <audio> + onended (design doc Step 5). The chunk-gap risk (doc Risk #2)
// is mitigated for V1 by upgrading to Web Audio AudioBuffer scheduling; out of scope
// for this first cut.

export interface QueueState {
  isPlaying: boolean;
  currentIndex: number; // -1 when idle
  total: number;
  currentTime: number; // within current chunk (s)
  duration: number; // current chunk duration (s), 0 until metadata loads
  chunkDurations: number[]; // per-chunk durations (0 until loaded)
}

type Listener = (s: QueueState) => void;

const ESTIMATED_CHUNK_SECONDS = 5; // fallback when real duration unknown

export class AudioQueueManager {
  private el: HTMLAudioElement;
  private blobs: Blob[] = [];
  private urls: string[] = [];
  private index = -1;
  private chunkDurations: number[] = [];
  private listeners = new Set<Listener>();

  constructor(el: HTMLAudioElement) {
    this.el = el;
    this.el.addEventListener('timeupdate', this.emit);
    this.el.addEventListener('loadedmetadata', this.onMeta);
    this.el.addEventListener('ended', this.onEnded);
    this.el.addEventListener('play', this.emit);
    this.el.addEventListener('pause', this.emit);
  }

  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    l(this.state());
    return () => {
      this.listeners.delete(l);
    };
  };

  private emit = (): void => {
    const s = this.state();
    this.listeners.forEach((l) => l(s));
  };

  private state(): QueueState {
    return {
      isPlaying: !this.el.paused && !this.el.ended,
      currentIndex: this.index,
      total: this.urls.length,
      currentTime: this.el.currentTime || 0,
      duration: Number.isFinite(this.el.duration) ? this.el.duration : 0,
      chunkDurations: this.chunkDurations,
    };
  }

  private onMeta = (): void => {
    if (this.index >= 0 && Number.isFinite(this.el.duration)) {
      this.chunkDurations[this.index] = this.el.duration;
    }
    this.emit();
  };

  private onEnded = (): void => {
    if (this.index + 1 < this.urls.length) {
      void this.playFrom(this.index + 1, 0);
    } else {
      this.index = -1;
      this.emit();
    }
  };

  private setChunkDurationsLen(n: number): void {
    if (this.chunkDurations.length < n) {
      this.chunkDurations = this.chunkDurations.concat(new Array(n - this.chunkDurations.length).fill(0));
    }
  }

  /** Replace the queue with a starting set of blobs (more can be appended later). */
  setQueue(blobs: Blob[]): void {
    this.clear();
    this.blobs = blobs.slice();
    this.urls = blobs.map((b) => URL.createObjectURL(b));
    this.setChunkDurationsLen(this.urls.length);
  }

  /** Append one blob to the tail of the queue (used for progressive fetching). */
  append(blob: Blob): void {
    this.blobs.push(blob);
    this.urls.push(URL.createObjectURL(blob));
    this.setChunkDurationsLen(this.urls.length);
    this.emit();
  }

  async playFrom(index: number, offset = 0): Promise<void> {
    if (index < 0 || index >= this.urls.length) return;
    this.index = index;
    this.el.src = this.urls[index];

    if (offset > 0) {
      await new Promise<void>((resolve) => {
        const handler = () => {
          this.el.removeEventListener('loadedmetadata', handler);
          try {
            this.el.currentTime = offset;
          } catch {
            /* ignore */
          }
          resolve();
        };
        this.el.addEventListener('loadedmetadata', handler, { once: true });
      });
    }
    try {
      await this.el.play();
    } catch {
      /* autoplay rejection — user can press Play again */
    }
    this.emit();
  }

  play(): void {
    if (this.index === -1 && this.urls.length > 0) {
      void this.playFrom(0, 0);
    } else if (this.el.paused) {
      void this.el.play().catch(() => {});
    }
  }

  pause(): void {
    this.el.pause();
  }

  stop(): void {
    this.el.pause();
    this.el.removeAttribute('src');
    try {
      this.el.load();
    } catch {
      /* ignore */
    }
    this.index = -1;
    this.emit();
  }

  /** Approximate seek: ratio 0..1 of the whole text. */
  async seek(ratio: number): Promise<void> {
    if (this.urls.length === 0) return;
    const r = Math.min(1, Math.max(0, ratio));
    const total =
      this.chunkDurations.reduce((a, b) => a + (b || 0), 0) ||
      this.urls.length * ESTIMATED_CHUNK_SECONDS;
    const target = r * total;

    let idx = 0;
    let acc = 0;
    for (; idx < this.chunkDurations.length; idx++) {
      const d = this.chunkDurations[idx] || ESTIMATED_CHUNK_SECONDS;
      if (acc + d >= target) break;
      acc += d;
    }
    const offset = Math.max(0, target - acc);
    await this.playFrom(Math.min(idx, this.urls.length - 1), offset);
  }

  clear(): void {
    this.urls.forEach((u) => URL.revokeObjectURL(u));
    this.urls = [];
    this.blobs = [];
    this.chunkDurations = [];
    this.index = -1;
    this.el.pause();
    this.el.removeAttribute('src');
  }
}