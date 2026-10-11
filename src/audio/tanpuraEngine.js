/**
 * Tanpura Audio Engine
 *
 * Web Audio API-based synthesized Tanpura player providing rich harmonic drones,
 * Jivari bridge resonance approximation, precise audio-clock lookahead scheduling,
 * and robust resource cleanup.
 */

import { getStringFrequencies } from './musicTheory.js';

export const MIN_TEMPO = 20; // BPM
export const MAX_TEMPO = 140; // BPM

export class TanpuraEngine {
  constructor(options = {}) {
    this.baseFrequency = options.baseFrequency || 240;
    this.tuning = options.tuning || 'pa';
    this.volume = typeof options.volume === 'number' ? options.volume : 0.5;
    this.tempo = Math.max(MIN_TEMPO, Math.min(MAX_TEMPO, options.tempo || 60)); // Plucks per minute (BPM)
    this.generation = 0; // Generation counter to guard against rapid start/stop race conditions

    // Callbacks
    this.onStateChange = options.onStateChange || null; // (state: 'stopped' | 'playing' | 'loading' | 'error') => void
    this.onStringPluck = options.onStringPluck || null; // (stringIndex: number | null) => void
    this.onError = options.onError || null; // (error: Error) => void

    // Audio nodes & context
    this.audioCtx = null;
    this.busGain = null;
    this.bodyLowShelf = null;
    this.bodyHighCut = null;
    this.masterGain = null;
    this.compressor = null;
    this.tanpuraWave = null;

    // Scheduler state
    this.isPlaying = false;
    this.isStarting = false;
    this.schedulerTimer = null;
    this.nextPluckTime = 0;
    this.currentStringIndex = 0;
    this.scheduleAheadTime = 0.25; // 250ms lookahead
    this.schedulerIntervalMs = 30; // Check every 30ms

    // Track active sound sources for instant cleanup on stop
    this.activeVoices = new Set();
    this.pendingUiTimers = new Set();
  }

  /**
   * Initialize or resume the AudioContext and setup master audio graph
   */
  async initAudioContext() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('Web Audio API is not supported in this browser.');
      }
      this.audioCtx = new AudioContextClass();
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    if (!this.masterGain) {
      this.setupAudioGraph();
    }
  }

  /**
   * Build master signal chain:
   * busGain -> bodyLowShelf -> bodyHighCut -> masterGain -> compressor -> destination
   */
  setupAudioGraph() {
    const ctx = this.audioCtx;

    // 1. Bus where all plucked string voices mix
    this.busGain = ctx.createGain();
    this.busGain.gain.setValueAtTime(1.0, ctx.currentTime);

    // 2. Acoustic body resonance (warmth around base vocal frequencies)
    this.bodyLowShelf = ctx.createBiquadFilter();
    this.bodyLowShelf.type = 'lowshelf';
    this.bodyLowShelf.frequency.setValueAtTime(220, ctx.currentTime);
    this.bodyLowShelf.gain.setValueAtTime(2.0, ctx.currentTime);

    // 3. Gentle high-frequency smoothing (tames digital harshness above 5.5 kHz)
    this.bodyHighCut = ctx.createBiquadFilter();
    this.bodyHighCut.type = 'lowpass';
    this.bodyHighCut.frequency.setValueAtTime(5500, ctx.currentTime);
    this.bodyHighCut.Q.setValueAtTime(0.7, ctx.currentTime);

    // 4. Master volume control
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);

    // 5. Dynamics compressor (soft limiter to prevent clipping and spikes)
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-6, ctx.currentTime);
    this.compressor.knee.setValueAtTime(8, ctx.currentTime);
    this.compressor.ratio.setValueAtTime(6, ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, ctx.currentTime);

    // Wire up master chain
    this.busGain.connect(this.bodyLowShelf);
    this.bodyLowShelf.connect(this.bodyHighCut);
    this.bodyHighCut.connect(this.masterGain);
    this.masterGain.connect(this.compressor);
    this.compressor.connect(ctx.destination);

    // 6. Generate periodic wave with rich harmonic structure of Tanpura strings
    this.createTanpuraPeriodicWave();
  }

  /**
   * Create custom PeriodicWave reflecting measured harmonic distribution of acoustic Tanpura
   */
  createTanpuraPeriodicWave() {
    const ctx = this.audioCtx;
    const harmonicWeights = [
      0, // DC offset
      1.0, // 1: Fundamental
      0.68, // 2: Octave
      0.54, // 3: Perfect Fifth
      0.44, // 4: 2nd Octave
      0.35, // 5: Major Third
      0.26, // 6: Fifth
      0.20, // 7: Harmonic Seventh
      0.15, // 8: 3rd Octave
      0.11, // 9: Major Second
      0.08, // 10: Major Third
      0.06, // 11: Augmented Fourth
      0.04, // 12: Perfect Fifth
      0.03, // 13: Neutral Sixth
      0.02, // 14: Harmonic Seventh
      0.015, // 15: Major Seventh
    ];

    const n = harmonicWeights.length;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      real[i] = 0;
      imag[i] = harmonicWeights[i];
    }

    this.tanpuraWave = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  /**
   * Start Tanpura drone playback
   */
  async start() {
    if (this.isPlaying || this.isStarting) return;
    this.isStarting = true;
    this.generation++;
    const currentGen = this.generation;
    this._emitState('loading');

    try {
      await this.initAudioContext();
      // Guard against race conditions if stopped while awaiting audio context initialization
      if (this.generation !== currentGen) return;

      // Ensure master gain is unmuted to current volume
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.volume, now);

      this.isPlaying = true;
      this.isStarting = false;
      this.currentStringIndex = 0;
      this.nextPluckTime = now + 0.05;

      // Start lookahead scheduler
      this.schedulerTimer = setInterval(() => {
        this.schedulerTick();
      }, this.schedulerIntervalMs);

      this._emitState('playing');
    } catch (err) {
      if (this.generation === currentGen) {
        this.isPlaying = false;
        this.isStarting = false;
        this._emitState('error', err);
        if (this.onError) this.onError(err);
      }
      throw err;
    }
  }

  /**
   * Stop Tanpura drone playback with clean audio fade to prevent clicks
   */
  stop() {
    this.generation++;
    const currentGen = this.generation;

    if (!this.isPlaying && !this.isStarting) return;

    this.isPlaying = false;
    this.isStarting = false;

    // Stop scheduler loop
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    // Clear all pending UI timers
    this.pendingUiTimers.forEach((timerId) => clearTimeout(timerId));
    this.pendingUiTimers.clear();

    if (this.onStringPluck) {
      this.onStringPluck(null);
    }

    if (this.audioCtx && this.masterGain && this.audioCtx.state === 'running') {
      const now = this.audioCtx.currentTime;
      // Smooth 35ms linear fade out to prevent clicks
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.035);

      setTimeout(() => {
        // Race condition guard: abort cleanup if a new start() was invoked during fade
        if (this.generation !== currentGen) return;
        // Context cleanup guard: ensure timeout bails out if audioCtx is closed/null
        if (!this.audioCtx || this.audioCtx.state === 'closed') return;

        this.cleanupActiveVoices();
        if (this.masterGain && this.audioCtx && this.audioCtx.state !== 'closed') {
          this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        }
        this._emitState('stopped');
      }, 40);
    } else {
      this.cleanupActiveVoices();
      this._emitState('stopped');
    }
  }

  /**
   * Lookahead audio scheduling tick
   */
  schedulerTick() {
    if (!this.isPlaying || !this.audioCtx) return;

    const currentTime = this.audioCtx.currentTime;
    const baseStepInterval = 60 / Math.max(MIN_TEMPO, Math.min(MAX_TEMPO, this.tempo));

    // If clock slipped behind (e.g. background tab wake-up), recover using a while loop
    // so notes and cyclic string ordering are not dropped
    while (this.nextPluckTime < currentTime) {
      const stepInterval = this.currentStringIndex === 3 ? baseStepInterval * 1.5 : baseStepInterval;
      this.nextPluckTime += stepInterval;
      this.currentStringIndex = (this.currentStringIndex + 1) % 4;
    }

    while (this.nextPluckTime < currentTime + this.scheduleAheadTime) {
      const stringIndex = this.currentStringIndex;
      const pluckTime = this.nextPluckTime;

      // Get current string frequency calculated dynamically from base Sa and tuning
      const freqs = getStringFrequencies(this.baseFrequency, this.tuning);
      const stringData = freqs[stringIndex];

      if (stringData && stringData.frequency > 0) {
        this.pluckString(stringData.frequency, pluckTime, stringIndex);
      }

      // Schedule UI string indicator highlight
      this.scheduleUiNotification(stringIndex, pluckTime);

      // Advance scheduler: traditional acoustic Kharja pause allows string 4 (Kharja)
      // to resonate with 1.5x rhythmic breath before restarting the cycle on string 1
      const stepInterval = stringIndex === 3 ? baseStepInterval * 1.5 : baseStepInterval;
      this.nextPluckTime += stepInterval;
      this.currentStringIndex = (this.currentStringIndex + 1) % 4;
    }
  }

  /**
   * Synthesize a single string pluck with Jivari bridge emulation
   */
  pluckString(frequency, startTime, stringIndex) {
    if (!this.audioCtx || !this.busGain) return;
    const ctx = this.audioCtx;

    // Pluck duration: Kharja string (index 3) has extra sustain and resonance
    const duration = stringIndex === 3
      ? Math.max(4.6, (60 / this.tempo) * 4.2)
      : Math.max(3.8, (60 / this.tempo) * 3.6);

    // 1. Dual oscillator for natural acoustic beating / shimmering jivari motion
    // Primary oscillator
    const osc1 = ctx.createOscillator();
    if (this.tanpuraWave) {
      osc1.setPeriodicWave(this.tanpuraWave);
    } else {
      osc1.type = 'sawtooth';
    }
    osc1.frequency.setValueAtTime(frequency, startTime);

    // Secondary oscillator with proportional detune for pitch-scaled acoustic chorus/shimmer
    const osc2 = ctx.createOscillator();
    if (this.tanpuraWave) {
      osc2.setPeriodicWave(this.tanpuraWave);
    } else {
      osc2.type = 'sawtooth';
    }
    const detuneMultiplier = stringIndex === 3 ? 0.001 : (stringIndex === 0 ? 0.002 : 0.0015);
    osc2.frequency.setValueAtTime(frequency + (frequency * detuneMultiplier), startTime);

    // 2. Dynamic Jivari filter:
    // Pluck excites high harmonics, which rapidly settle and decay faster than fundamental
    const jivariFilter = ctx.createBiquadFilter();
    jivariFilter.type = 'lowpass';
    jivariFilter.Q.setValueAtTime(2.2, startTime); // Resonant peak at bridge contact

    const startFilterFreq = Math.min(frequency * 3.2, 2400);
    const peakFilterFreq = Math.min(frequency * 8.5, 5200);
    const endFilterFreq = Math.max(frequency * 1.4, 450);

    const attackDuration = 0.030; // ~25–35ms smooth pluck attack eliminates transient click artifacts

    jivariFilter.frequency.setValueAtTime(startFilterFreq, startTime);
    jivariFilter.frequency.linearRampToValueAtTime(peakFilterFreq, startTime + attackDuration);
    jivariFilter.frequency.exponentialRampToValueAtTime(endFilterFreq, startTime + duration);

    // 3. Amplitude envelope with lengthened attack (30ms)
    const envelopeGain = ctx.createGain();
    envelopeGain.gain.setValueAtTime(0.0001, startTime);

    const attackPeak = stringIndex === 3 ? 0.8 : (stringIndex === 0 ? 0.72 : 0.68);
    envelopeGain.gain.linearRampToValueAtTime(attackPeak, startTime + attackDuration);

    // Pluck transient settle (120ms)
    envelopeGain.gain.linearRampToValueAtTime(attackPeak * 0.7, startTime + 0.12);

    // Natural sustained decay
    envelopeGain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);
    envelopeGain.gain.linearRampToValueAtTime(0, startTime + duration + 0.03);

    // 4. Stereo panning for natural spatial acoustic spread across strings
    // String 0 (Mandra Pa/Ma): slightly left (-0.25)
    // String 1 (Jodi Sa 1): center-left (-0.08)
    // String 2 (Jodi Sa 2): center-right (+0.08)
    // String 3 (Kharja Mandra Sa): slightly right (+0.20)
    let panner = null;
    if (typeof ctx.createStereoPanner === 'function') {
      panner = ctx.createStereoPanner();
      const panPositions = [-0.25, -0.08, 0.08, 0.2];
      panner.pan.setValueAtTime(panPositions[stringIndex] ?? 0, startTime);
    }

    // Wire voice nodes
    osc1.connect(jivariFilter);
    osc2.connect(jivariFilter);
    jivariFilter.connect(envelopeGain);

    if (panner) {
      envelopeGain.connect(panner);
      panner.connect(this.busGain);
    } else {
      envelopeGain.connect(this.busGain);
    }

    // Schedule voice start & stop
    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.04);
    osc2.stop(startTime + duration + 0.04);

    // Track active voice record for safe stop
    const voiceRecord = {
      osc1,
      osc2,
      jivariFilter,
      envelopeGain,
      panner,
    };
    this.activeVoices.add(voiceRecord);

    // Automatic node cleanup on pluck completion
    osc1.onended = () => {
      this.cleanupVoice(voiceRecord);
    };
  }

  /**
   * Schedule UI notification synchronized with audio clock
   */
  scheduleUiNotification(stringIndex, pluckTime) {
    if (!this.onStringPluck || !this.audioCtx) return;

    const delayMs = Math.max(0, (pluckTime - this.audioCtx.currentTime) * 1000);
    const timerId = setTimeout(() => {
      this.pendingUiTimers.delete(timerId);
      if (this.isPlaying) {
        this.onStringPluck(stringIndex);
      }
    }, delayMs);

    this.pendingUiTimers.add(timerId);
  }

  /**
   * Disconnect and release nodes for a single voice
   */
  cleanupVoice(voiceRecord) {
    try {
      voiceRecord.osc1.disconnect();
      voiceRecord.osc2.disconnect();
      voiceRecord.jivariFilter.disconnect();
      voiceRecord.envelopeGain.disconnect();
      if (voiceRecord.panner) {
        voiceRecord.panner.disconnect();
      }
    } catch {
      // Ignore disconnect errors if already disconnected
    }
    this.activeVoices.delete(voiceRecord);
  }

  /**
   * Immediately stop and disconnect all currently vibrating voices
   */
  cleanupActiveVoices() {
    for (const voice of this.activeVoices) {
      try {
        voice.osc1.stop();
        voice.osc2.stop();
      } catch {
        // Ignore already stopped
      }
      try {
        voice.osc1.disconnect();
        voice.osc2.disconnect();
        voice.jivariFilter.disconnect();
        voice.envelopeGain.disconnect();
        if (voice.panner) {
          voice.panner.disconnect();
        }
      } catch {
        // Ignore
      }
    }
    this.activeVoices.clear();
  }

  /**
   * Update Base Sa in real-time without interrupting playback
   */
  setBaseFrequency(freq) {
    if (typeof freq === 'number' && !isNaN(freq) && freq > 0) {
      this.baseFrequency = freq;
    }
  }

  /**
   * Update tuning preset in real-time ('pa' or 'ma')
   */
  setTuning(tuning) {
    if (tuning === 'pa' || tuning === 'ma') {
      this.tuning = tuning;
    }
  }

  /**
   * Update volume smoothly (0.0 to 1.0)
   */
  setVolume(vol) {
    const safeVol = Math.max(0, Math.min(1, typeof vol === 'number' && !isNaN(vol) ? vol : 0.5));
    this.volume = safeVol;

    if (this.masterGain && this.audioCtx && this.isPlaying) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(safeVol, now, 0.02);
    }
  }

  /**
   * Update tempo in BPM (20 to 140)
   */
  setTempo(bpm) {
    if (typeof bpm === 'number' && !isNaN(bpm) && bpm >= MIN_TEMPO && bpm <= MAX_TEMPO) {
      this.tempo = bpm;
    }
  }

  /**
   * Helper to emit state changes
   */
  _emitState(state, error = null) {
    if (this.onStateChange) {
      this.onStateChange(state, error);
    }
  }

  /**
   * Full teardown on component unmount
   */
  destroy() {
    this.generation++;
    this.stop();

    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }

    if (this.audioCtx && typeof this.audioCtx.close === 'function' && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // Ignore errors if context is already closing/closed
      }
    }
    this.audioCtx = null;

    this.onStateChange = null;
    this.onStringPluck = null;
    this.onError = null;
  }
}
