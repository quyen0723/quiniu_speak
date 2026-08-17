// Web Audio API mixer. Routes the voice <audio> and the music <audio> through two
// independent GainNodes so their volumes can be controlled separately, then sums
// them to the speakers. Real-time, zero-latency, no FFmpeg.
//
// createMediaElementSource can be called at most once per element; we lazily attach
// on first user gesture (browsers require a gesture to start an AudioContext).

export class AudioMixer {
  private ctx: AudioContext | null = null;
  private voiceGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private voiceAttached = false;
  private musicAttached = false;

  /** Resume/create the context. Call from a user gesture (click/Play). */
  ensure(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctor();
      this.voiceGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.voiceGain.connect(this.ctx.destination);
      this.musicGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  attachVoice(el: HTMLAudioElement): void {
    this.ensure();
    if (!this.voiceAttached && this.ctx && this.voiceGain) {
      const src = this.ctx.createMediaElementSource(el);
      src.connect(this.voiceGain);
      this.voiceAttached = true;
    }
  }

  attachMusic(el: HTMLAudioElement): void {
    this.ensure();
    if (!this.musicAttached && this.ctx && this.musicGain) {
      const src = this.ctx.createMediaElementSource(el);
      src.connect(this.musicGain);
      this.musicAttached = true;
    }
  }

  setVoiceVolume(v: number): void {
    if (this.voiceGain) this.voiceGain.gain.value = v;
  }
  setMusicVolume(v: number): void {
    if (this.musicGain) this.musicGain.gain.value = v;
  }
}

export const mixer = new AudioMixer();