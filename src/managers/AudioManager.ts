import { SaveManager } from './SaveManager';

export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean;
  private musicEnabled: boolean;
  private musicTimer: number | null = null;
  private isMusicPlaying: boolean = false;
  private musicStep: number = 0;

  private constructor() {
    const saved = SaveManager.getData();
    this.soundEnabled = saved.soundEnabled;
    this.musicEnabled = saved.musicEnabled;
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private ensureContext(): AudioContext | null {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    SaveManager.setSoundEnabled(this.soundEnabled);
    if (this.soundEnabled) {
      this.playButtonClick();
    }
    return this.soundEnabled;
  }

  public toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled;
    SaveManager.setMusicEnabled(this.musicEnabled);
    if (this.musicEnabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  public playFlap(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(290, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.085);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playScore(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 880]; // D5 -> A5 bright chime
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.065;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.19);
    });
  }

  public playCollision(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Wooden thud impact
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.18);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  public playGameOver(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 349.23, 329.63, 261.63]; // G4, F4, E4, C4
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.11;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.23);
    });
  }

  public playButtonClick(): void {
    if (!this.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.045);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  public startMusic(): void {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    // Gentle cheerful woodland pentatonic marimba loop
    const melody = [
      392.0, 440.0, 523.25, 587.33, 659.25, 587.33, 523.25, 440.0,
      392.0, 329.63, 392.0, 440.0, 523.25, 440.0, 392.0, 0,
    ];

    const playTick = () => {
      if (!this.isMusicPlaying || !this.musicEnabled) return;
      const activeCtx = this.ensureContext();
      if (activeCtx && activeCtx.state === 'running') {
        const freq = melody[this.musicStep % melody.length];
        this.musicStep++;
        if (freq > 0) {
          const now = activeCtx.currentTime;
          const osc = activeCtx.createOscillator();
          const gain = activeCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.035, now);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.28);

          osc.connect(gain);
          gain.connect(activeCtx.destination);

          osc.start(now);
          osc.stop(now + 0.29);
        }
      }
      this.musicTimer = window.setTimeout(playTick, 320);
    };

    playTick();
  }

  public stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}
