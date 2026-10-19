// Procedural Web Audio Engine for Tesla Roadster SpaceX Thruster & Crash Simulator
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private thrusterGain: GainNode | null = null;
  private thrusterNoiseGain: GainNode | null = null;
  private thrusterOsc: OscillatorNode | null = null;
  private thrusterNoiseFilter: BiquadFilterNode | null = null;
  private isThrusterActive: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.thrusterGain && this.ctx) {
      this.thrusterGain.gain.setValueAtTime(muted ? 0 : 0.4, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public initThrusterSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || this.thrusterGain) return;

    try {
      // Main thruster master gain
      this.thrusterGain = this.ctx.createGain();
      this.thrusterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.thrusterGain.connect(this.ctx.destination);

      // White noise buffer for roaring gas exhaust
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Bandpass/Lowpass filter for rocket roar
      this.thrusterNoiseFilter = this.ctx.createBiquadFilter();
      this.thrusterNoiseFilter.type = 'lowpass';
      this.thrusterNoiseFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
      this.thrusterNoiseFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      this.thrusterNoiseGain = this.ctx.createGain();
      this.thrusterNoiseGain.gain.setValueAtTime(0, this.ctx.currentTime);

      whiteNoise.connect(this.thrusterNoiseFilter);
      this.thrusterNoiseFilter.connect(this.thrusterNoiseGain);
      this.thrusterNoiseGain.connect(this.thrusterGain);
      whiteNoise.start();

      // Sub-bass rumble oscillator
      this.thrusterOsc = this.ctx.createOscillator();
      this.thrusterOsc.type = 'sawtooth';
      this.thrusterOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.thrusterOsc.connect(oscGain);
      oscGain.connect(this.thrusterGain);
      this.thrusterOsc.start();

      this.isThrusterActive = true;
    } catch {
      // Ignore audio init errors on autoplay restriction
    }
  }

  public updateThrusterSound(thrustPercent: number, isBoosting: boolean) {
    if (this.isMuted || !this.ctx) return;
    if (!this.isThrusterActive) {
      this.initThrusterSound();
    }

    if (this.thrusterGain && this.thrusterNoiseFilter && this.thrusterOsc) {
      const targetGain = Math.min(1.0, Math.max(0, (thrustPercent / 100) * (isBoosting ? 0.8 : 0.45)));
      const now = this.ctx.currentTime;
      this.thrusterGain.gain.setTargetAtTime(targetGain, now, 0.08);

      const targetFreq = 200 + (thrustPercent / 100) * (isBoosting ? 1800 : 700);
      this.thrusterNoiseFilter.frequency.setTargetAtTime(targetFreq, now, 0.08);
      this.thrusterOsc.frequency.setTargetAtTime(35 + (thrustPercent / 100) * 50, now, 0.08);
    }
  }

  public playSonicBoom() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.4);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.75);
    } catch {
      // Audio context safeguard
    }
  }

  public playCrashImpact(impactSpeedKmh: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const intensity = Math.min(1.0, Math.max(0.5, impactSpeedKmh / 400));

      // 1. Heavy low-frequency explosion thump (Sub-bass rumble)
      const boomOsc = this.ctx.createOscillator();
      const boomGain = this.ctx.createGain();
      boomOsc.type = 'sine';
      boomOsc.frequency.setValueAtTime(180, now);
      boomOsc.frequency.exponentialRampToValueAtTime(25, now + 1.2);

      boomGain.gain.setValueAtTime(1.0 * intensity, now);
      boomGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      boomOsc.connect(boomGain);
      boomGain.connect(this.ctx.destination);
      boomOsc.start(now);
      boomOsc.stop(now + 1.8);

      // 2. Roaring Fireball Combustion Sound (Deep rumbling fire wash)
      const fireBufferSize = Math.floor(this.ctx.sampleRate * 2.8);
      const fireBuffer = this.ctx.createBuffer(1, fireBufferSize, this.ctx.sampleRate);
      const fireData = fireBuffer.getChannelData(0);
      for (let i = 0; i < fireBufferSize; i++) {
        fireData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.9));
      }

      const fireSource = this.ctx.createBufferSource();
      fireSource.buffer = fireBuffer;

      const fireFilter = this.ctx.createBiquadFilter();
      fireFilter.type = 'lowpass';
      fireFilter.frequency.setValueAtTime(450, now);
      fireFilter.frequency.linearRampToValueAtTime(120, now + 2.0);

      const fireGain = this.ctx.createGain();
      fireGain.gain.setValueAtTime(0.9 * intensity, now);
      fireGain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

      fireSource.connect(fireFilter);
      fireFilter.connect(fireGain);
      fireGain.connect(this.ctx.destination);
      fireSource.start(now);

      // 3. High-velocity Metal Crunch & Shattered Glass Shrapnel
      const bufferSize = Math.floor(this.ctx.sampleRate * 1.6);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.4));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.frequency.linearRampToValueAtTime(300, now + 1.0);

      const crunchGain = this.ctx.createGain();
      crunchGain.gain.setValueAtTime(0.95 * intensity, now);
      crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

      noiseSource.connect(filter);
      filter.connect(crunchGain);
      crunchGain.connect(this.ctx.destination);

      noiseSource.start(now);
    } catch {
      // Audio safeguard
    }
  }

  public playRingPass() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18); // A5

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio safeguard
    }
  }

  public playBeep(freq: number = 800) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio safeguard
    }
  }
}

export const soundEngine = new SoundSynthesizer();
