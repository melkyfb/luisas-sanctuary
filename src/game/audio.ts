/**
 * Procedural Web Audio Synthesizer for Luisa's Magical Pet Sanctuary
 * 100% self-contained procedural sounds (zero 404s / zero external audio files)
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private stepInScale = 0;

  constructor() {
    // AudioContext will be lazily initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.value = this.isMuted ? 0 : 0.18;
      this.musicGainNode.connect(this.ctx.destination);

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.value = this.isMuted ? 0 : 0.35;
      this.sfxGainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.musicGainNode && this.sfxGainNode) {
      this.musicGainNode.gain.value = this.isMuted ? 0 : 0.18;
      this.sfxGainNode.gain.value = this.isMuted ? 0 : 0.35;
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Footstep sound when walking on grass
   */
  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    const pitch = 90 + Math.random() * 25;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Calling the pet (Sweet flutey whistle)
   */
  public playCall() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  /**
   * Munching / feeding a treat
   */
  public playFeed() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    [0, 0.08, 0.16].forEach((delay, idx) => {
      const now = this.ctx!.currentTime + delay;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + idx * 80, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(now);
      osc.stop(now + 0.06);
    });
  }

  /**
   * Petting purr & soft happy heart sound
   */
  public playPet() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    // Low purr vibration
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(18, now);
    lfoGain.gain.setValueAtTime(30, now);
    lfo.connect(osc.frequency);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.35);
    lfo.stop(now + 0.35);

    // Chime sparkle
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(987.77, now + 0.05); // B5
    chime.frequency.exponentialRampToValueAtTime(1318.51, now + 0.25); // E6
    chimeGain.gain.setValueAtTime(0.1, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGainNode);
    chime.start(now + 0.05);
    chime.stop(now + 0.35);
  }

  /**
   * Adoption Hug Celebration Fanfare
   */
  public playHugCelebration() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.09;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  /**
   * Daily Magic Wand Star Cast
   */
  public playWandCast() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 7; i++) {
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600 + i * 160, t);
      osc.frequency.exponentialRampToValueAtTime(1800 + i * 120, t + 0.2);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(t);
      osc.stop(t + 0.28);
    }
  }

  /**
   * Fence & furniture building place sound
   */
  public playPlace() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Soap bubble pop for bathing
   */
  public playBubble() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const pitch = 700 + Math.random() * 300;
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, now + 0.07);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Brush sparkle swoosh
   */
  public playBrush() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * UI Click
   */
  public playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Cozy ambient music loop (Pentatonic Kalimba style)
   */
  public startBackgroundMusic() {
    if (this.isMusicPlaying) return;
    this.initCtx();
    this.isMusicPlaying = true;

    // Pentatonic scale notes (C major pentatonic: C4, D4, E4, G4, A4, C5, D5, E5)
    const melodyNotes = [
      261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25,
      523.25, 440.0, 392.0, 329.63, 293.66, 329.63, 392.0, 523.25
    ];

    const chordBass = [130.81, 164.81, 196.0, 174.61]; // C3, E3, G3, F3

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;

      const now = this.ctx.currentTime;
      const freq = melodyNotes[noteIdx % melodyNotes.length];

      // Bell / Kalimba note
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.8);

      osc.connect(gain);
      gain.connect(this.musicGainNode);

      osc.start(now);
      osc.stop(now + 0.85);

      // Play soft bass tone on every 4th note
      if (noteIdx % 4 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bassFreq = chordBass[Math.floor(noteIdx / 4) % chordBass.length];

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.05, now);
        bassGain.gain.exponentialRampToValueAtTime(0.0005, now + 1.4);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGainNode);

        bassOsc.start(now);
        bassOsc.stop(now + 1.45);
      }

      noteIdx++;
      this.musicTimer = window.setTimeout(playNextNote, 420);
    };

    playNextNote();
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGainNode: GainNode | null = null;

  public setWeatherAmbiance(weather: 'sunny' | 'rainy' | 'snowy') {
    if (!this.ctx || this.isMuted) return;

    if (weather === 'rainy') {
      if (!this.rainSource) {
        // Create 2-second looped pink/white noise buffer for gentle rainfall
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99 * b0 + white * 0.05;
          b1 = 0.96 * b1 + white * 0.11;
          b2 = 0.86 * b2 + white * 0.25;
          output[i] = (b0 + b1 + b2) * 0.15;
        }

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        this.rainGainNode = this.ctx.createGain();
        this.rainGainNode.gain.setValueAtTime(0, this.ctx.currentTime);
        this.rainGainNode.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.08, this.ctx.currentTime + 1.5);

        this.rainSource = this.ctx.createBufferSource();
        this.rainSource.buffer = noiseBuffer;
        this.rainSource.loop = true;

        this.rainSource.connect(filter);
        filter.connect(this.rainGainNode);
        this.rainGainNode.connect(this.ctx.destination);
        this.rainSource.start();
      }
    } else {
      // Fade out rain sound if changing to sunny or snowy
      if (this.rainGainNode && this.rainSource) {
        const now = this.ctx.currentTime;
        this.rainGainNode.gain.linearRampToValueAtTime(0, now + 1.0);
        setTimeout(() => {
          if (this.rainSource) {
            try {
              this.rainSource.stop();
              this.rainSource.disconnect();
            } catch (e) {}
            this.rainSource = null;
          }
        }, 1100);
      }
    }
  }

  /**
   * Sound of pet shaking off raindrops or snow
   */
  public playPetShake() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280 + i * 40, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.05);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      gain.connect(this.sfxGainNode);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  /**
   * Ball throw whoosh sound
   */
  public playBallThrow() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.22);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Rubber ball bounce sound
   */
  public playBallBounce() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Camera click and shutter sound
   */
  public playCameraShutter() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    // Click 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(400, now + 0.04);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc1.connect(gain1);
    gain1.connect(this.sfxGainNode);
    osc1.start(now);
    osc1.stop(now + 0.04);

    // Mechanical click 2
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(800, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(300, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc2.connect(gain2);
    gain2.connect(this.sfxGainNode);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.12);
  }

  /**
   * Quest completion fanfare
   */
  public playQuestComplete() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.1;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxGainNode!);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  /**
   * Sanctuary Star level-up chime
   */
  public playStarUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGainNode) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.sfxGainNode!);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }
}

export const soundManager = new SoundManager();
