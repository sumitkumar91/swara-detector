import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStringFrequencies,
  noteToFrequency,
  frequencyToNote,
  CHROMATIC_NOTES,
  TUNING_PRESETS,
} from '../src/audio/musicTheory.js';
import { TanpuraEngine } from '../src/audio/tanpuraEngine.js';

describe('Music Theory & Tuning Calculations', () => {
  it('correctly calculates Pa-Sa-Sa-Sa (Standard) string frequencies for 240 Hz', () => {
    const freqs = getStringFrequencies(240, 'pa');
    assert.equal(freqs.length, 4);

    // String 1: Lower-fifth Pa (Mandra Pa) = 0.75 * baseSa (180 Hz)
    assert.equal(freqs[0].ratio, 0.75);
    assert.equal(freqs[0].frequency, 180);
    assert.equal(freqs[0].name, 'Pa (Low)');
    assert.equal(freqs[0].swara, 'Mandra Pa');

    // String 2: Middle Sa (Jodi 1) = 1.0 * baseSa (240 Hz)
    assert.equal(freqs[1].ratio, 1.0);
    assert.equal(freqs[1].frequency, 240);
    assert.equal(freqs[1].swara, 'Madhya Sa');

    // String 3: Middle Sa (Jodi 2) = 1.0 * baseSa (240 Hz)
    assert.equal(freqs[2].ratio, 1.0);
    assert.equal(freqs[2].frequency, 240);
    assert.equal(freqs[2].swara, 'Madhya Sa');

    // String 4: Deep Lower Sa (Kharja) = 0.5 * baseSa (120 Hz)
    assert.equal(freqs[3].ratio, 0.5);
    assert.equal(freqs[3].frequency, 120);
    assert.equal(freqs[3].name, 'Sa (Low)');
    assert.equal(freqs[3].swara, 'Mandra Sa');
  });

  it('correctly calculates Ma-Sa-Sa-Sa (Malkauns/Bageshri) string frequencies for 240 Hz', () => {
    const freqs = getStringFrequencies(240, 'ma');
    assert.equal(freqs.length, 4);

    // String 1: Lower-fourth Ma (Mandra Ma) = 0.666666 * baseSa (~160 Hz)
    assert.equal(freqs[0].ratio, 0.666666);
    assert.ok(Math.abs(freqs[0].frequency - 160) < 0.01);
    assert.equal(freqs[0].name, 'Ma (Low)');
    assert.equal(freqs[0].swara, 'Mandra Ma');

    // String 2: Middle Sa (Jodi 1) = 1.0 * baseSa (240 Hz)
    assert.equal(freqs[1].ratio, 1.0);
    assert.equal(freqs[1].frequency, 240);

    // String 3: Middle Sa (Jodi 2) = 1.0 * baseSa (240 Hz)
    assert.equal(freqs[2].ratio, 1.0);
    assert.equal(freqs[2].frequency, 240);

    // String 4: Deep Lower Sa (Kharja) = 0.5 * baseSa (120 Hz)
    assert.equal(freqs[3].ratio, 0.5);
    assert.equal(freqs[3].frequency, 120);
  });

  it('scales string frequencies dynamically when base Sa changes', () => {
    const maleFreqs = getStringFrequencies(130, 'pa');
    assert.equal(maleFreqs[0].frequency, 97.5);
    assert.equal(maleFreqs[1].frequency, 130);
    assert.equal(maleFreqs[2].frequency, 130);
    assert.equal(maleFreqs[3].frequency, 65);
  });

  it('safely handles invalid base frequencies', () => {
    const defaultFreqs = getStringFrequencies(0, 'pa');
    assert.equal(defaultFreqs[1].frequency, 240);

    const nanFreqs = getStringFrequencies(NaN, 'pa');
    assert.equal(nanFreqs[1].frequency, 240);
  });

  it('converts chromatic notes to standard frequencies accurately', () => {
    // A4 = 440 Hz
    assert.equal(noteToFrequency(9, 4), 440);

    // A3 = 220 Hz
    assert.equal(noteToFrequency(9, 3), 220);

    // Middle C (C4) = ~261.63 Hz
    assert.equal(noteToFrequency(0, 4), 261.63);

    // C3 (Male base) = ~130.81 Hz
    assert.equal(noteToFrequency(0, 3), 130.81);

    // C#3 = ~138.59 Hz
    assert.equal(noteToFrequency(1, 3), 138.59);
  });

  it('converts frequencies back to nearest chromatic notes and cents', () => {
    const noteA4 = frequencyToNote(440);
    assert.equal(noteA4.noteName, 'A');
    assert.equal(noteA4.octave, 4);
    assert.equal(noteA4.cents, 0);

    const noteCsharp3 = frequencyToNote(138.59);
    assert.equal(noteCsharp3.noteName, 'C♯/D♭');
    assert.equal(noteCsharp3.octave, 3);
    assert.equal(noteCsharp3.cents, 0);

    const noteB3 = frequencyToNote(240);
    assert.equal(noteB3.noteName, 'B');
    assert.equal(noteB3.octave, 3);
    assert.equal(noteB3.cents, -49);
  });

  it('contains exactly 12 chromatic pitch classes and valid presets', () => {
    assert.equal(CHROMATIC_NOTES.length, 12);
    assert.ok(TUNING_PRESETS.pa);
    assert.ok(TUNING_PRESETS.ma);
  });
});

describe('TanpuraEngine Lifecycle & Configuration', () => {
  it('initializes with expected default values', () => {
    const engine = new TanpuraEngine({
      baseFrequency: 240,
      tuning: 'pa',
      volume: 0.6,
      tempo: 60,
    });

    assert.equal(engine.baseFrequency, 240);
    assert.equal(engine.tuning, 'pa');
    assert.equal(engine.volume, 0.6);
    assert.equal(engine.tempo, 60);
    assert.equal(engine.isPlaying, false);
  });

  it('updates configuration parameters without errors', () => {
    const engine = new TanpuraEngine();

    engine.setVolume(0.8);
    assert.equal(engine.volume, 0.8);

    // Clamps volume safely between 0 and 1
    engine.setVolume(1.5);
    assert.equal(engine.volume, 1.0);
    engine.setVolume(-0.2);
    assert.equal(engine.volume, 0.0);

    engine.setTempo(75);
    assert.equal(engine.tempo, 75);

    engine.setTuning('ma');
    assert.equal(engine.tuning, 'ma');

    engine.setBaseFrequency(138.59);
    assert.equal(engine.baseFrequency, 138.59);
  });

  it('handles stop cleanly when not playing', () => {
    const engine = new TanpuraEngine();
    assert.doesNotThrow(() => {
      engine.stop();
    });
    assert.equal(engine.isPlaying, false);
  });

  it('destroys cleanly without lingering timers', () => {
    const engine = new TanpuraEngine();
    assert.doesNotThrow(() => {
      engine.destroy();
    });
    assert.equal(engine.isPlaying, false);
    assert.equal(engine.schedulerTimer, null);
  });
});

describe('TanpuraEngine Audio Graph & Scheduler Execution', () => {
  // Setup mock Web Audio environment
  class MockAudioParam {
    constructor(val = 0) {
      this.value = val;
    }
    setValueAtTime(v) { this.value = v; }
    linearRampToValueAtTime(v) { this.value = v; }
    exponentialRampToValueAtTime(v) { this.value = v; }
    setTargetAtTime(v) { this.value = v; }
    cancelScheduledValues() {}
  }
  class MockAudioNode {
    connect() { return this; }
    disconnect() {}
  }
  class MockGainNode extends MockAudioNode {
    constructor() {
      super();
      this.gain = new MockAudioParam(1.0);
    }
  }
  class MockBiquadFilter extends MockAudioNode {
    constructor() {
      super();
      this.frequency = new MockAudioParam(1000);
      this.Q = new MockAudioParam(1);
      this.gain = new MockAudioParam(0);
    }
  }
  class MockOscillator extends MockAudioNode {
    constructor() {
      super();
      this.frequency = new MockAudioParam(440);
      this.onended = null;
    }
    setPeriodicWave() {}
    start() {}
    stop() {
      if (this.onended) this.onended();
    }
  }
  class MockCompressor extends MockAudioNode {
    constructor() {
      super();
      this.threshold = new MockAudioParam(-24);
      this.knee = new MockAudioParam(30);
      this.ratio = new MockAudioParam(12);
      this.attack = new MockAudioParam(0.003);
      this.release = new MockAudioParam(0.25);
    }
  }
  class MockAudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = 'running';
      this.destination = new MockAudioNode();
    }
    createGain() { return new MockGainNode(); }
    createBiquadFilter() { return new MockBiquadFilter(); }
    createOscillator() { return new MockOscillator(); }
    createDynamicsCompressor() { return new MockCompressor(); }
    createPeriodicWave() { return {}; }
    resume() { return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
  }

  // Install mock window and AudioContext for node test
  const originalWindow = globalThis.window;
  globalThis.window = {
    AudioContext: MockAudioContext,
  };

  it('successfully starts audio playback and creates signal graph', async () => {
    let observedState = null;
    const pluckedStrings = [];

    const engine = new TanpuraEngine({
      baseFrequency: 240,
      tuning: 'pa',
      volume: 0.5,
      tempo: 60,
      onStateChange: (state) => {
        observedState = state;
      },
      onStringPluck: (stringIndex) => {
        pluckedStrings.push(stringIndex);
      },
    });

    await engine.start();

    assert.equal(engine.isPlaying, true);
    assert.equal(observedState, 'playing');
    assert.ok(engine.masterGain);
    assert.ok(engine.compressor);
    assert.ok(engine.tanpuraWave);

    // Prevent duplicate starts
    const timerBefore = engine.schedulerTimer;
    await engine.start();
    assert.equal(engine.schedulerTimer, timerBefore);

    // Test scheduler tick
    engine.schedulerTick();
    assert.ok(engine.activeVoices.size > 0);

    // Test dynamic parameters during playback
    engine.setVolume(0.7);
    engine.setTempo(80);
    engine.setTuning('ma');
    engine.setBaseFrequency(138.59);
    assert.equal(engine.volume, 0.7);
    assert.equal(engine.tempo, 80);
    assert.equal(engine.tuning, 'ma');
    assert.equal(engine.baseFrequency, 138.59);

    // Test stopping
    engine.stop();
    assert.equal(engine.isPlaying, false);

    engine.destroy();

    // Restore window
    globalThis.window = originalWindow;
  });
});

