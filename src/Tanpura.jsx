import React, { useState, useEffect, useRef } from 'react';

const STRING_NAMES = {
  pa: ['Sa (low)', 'Pa', 'Sa', 'Sa (high)'],
  ma: ['Sa (low)', 'Ma', 'Sa', 'Sa (high)'],
};

function getFrequencies(baseFrequency, tuning) {
  const second = tuning === 'pa' ? baseFrequency * 3 / 2 : baseFrequency * 4 / 3;
  return [baseFrequency / 2, second, baseFrequency, baseFrequency * 2];
}

function pluckString(audioCtx, masterGain, frequency) {
  const now = audioCtx.currentTime;
  const envelopeGain = audioCtx.createGain();
  envelopeGain.connect(masterGain);
  envelopeGain.gain.setValueAtTime(0, now);
  envelopeGain.gain.linearRampToValueAtTime(0.8, now + 0.01);
  envelopeGain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

  const harmonics = [
    { freq: frequency, amp: 0.6 },
    { freq: frequency * 2, amp: 0.25 },
    { freq: frequency * 3, amp: 0.1 },
  ];

  harmonics.forEach(({ freq, amp }) => {
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    oscGain.gain.value = amp;
    osc.connect(oscGain);
    oscGain.connect(envelopeGain);
    osc.start(now);
    osc.stop(now + 3.5);
  });
}

export default function Tanpura({ baseFrequency }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tuning, setTuning] = useState('pa');
  const [volume, setVolume] = useState(0.6);
  const [tempo, setTempo] = useState(60);
  const [activeString, setActiveString] = useState(null);

  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const intervalRef = useRef(null);
  const stringIndexRef = useRef(0);

  // Keep a ref to always-current values so the interval callback is not stale
  const tuningRef = useRef(tuning);
  const baseFreqRef = useRef(baseFrequency);
  useEffect(() => { tuningRef.current = tuning; }, [tuning]);
  useEffect(() => { baseFreqRef.current = baseFrequency; }, [baseFrequency]);

  function startLoop(tempoVal) {
    const intervalMs = (60 / tempoVal) * 1000;
    intervalRef.current = setInterval(() => {
      const idx = stringIndexRef.current;
      const freqs = getFrequencies(baseFreqRef.current, tuningRef.current);
      pluckString(audioCtxRef.current, masterGainRef.current, freqs[idx]);
      setActiveString(idx);
      stringIndexRef.current = (idx + 1) % 4;
    }, intervalMs);
  }

  function startTanpura() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(audioCtx.destination);
    audioCtxRef.current = audioCtx;
    masterGainRef.current = masterGain;
    stringIndexRef.current = 0;
    startLoop(tempo);
    setIsPlaying(true);
  }

  function stopTanpura() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    masterGainRef.current = null;
    setIsPlaying(false);
    setActiveString(null);
  }

  // Restart when baseFrequency changes while playing
  useEffect(() => {
    if (isPlaying) {
      stopTanpura();
      // brief defer so the old context closes cleanly
      setTimeout(startTanpura, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFrequency]);

  // Update master volume in real time
  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume;
    }
  }, [volume]);

  // Restart interval when tempo changes
  useEffect(() => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      startLoop(tempo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const stringNames = STRING_NAMES[tuning];
  const frequencies = getFrequencies(baseFrequency, tuning);

  return (
    <section className="tanpura-section">
      <h2 className="section-title">Digital Tanpura</h2>

      <div className="tanpura-controls">
        <div className="tuning-group">
          <span className="tanpura-label">Tuning</span>
          <div className="tuning-options">
            {['pa', 'ma'].map((t) => (
              <button
                key={t}
                className={`tuning-btn ${tuning === t ? 'selected' : ''}`}
                onClick={() => setTuning(t)}
              >
                {t === 'pa' ? 'Pa (Sa–Pa–Sa–Sa)' : 'Ma (Sa–Ma–Sa–Sa)'}
              </button>
            ))}
          </div>
        </div>

        <div className="slider-group">
          <label>
            Volume <span className="slider-value">{Math.round(volume * 100)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
          />
        </div>

        <div className="slider-group">
          <label>
            Tempo <span className="slider-value">{tempo} BPM</span>
          </label>
          <input
            type="range"
            min="40"
            max="120"
            step="1"
            value={tempo}
            onChange={(e) => setTempo(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="tanpura-strings">
        {stringNames.map((name, i) => (
          <div
            key={i}
            className={`string-indicator ${activeString === i ? 'active' : ''}`}
          >
            <div className="string-name">{name}</div>
            <div className="string-freq">{frequencies[i].toFixed(1)} Hz</div>
          </div>
        ))}
      </div>

      <button
        className={`btn btn-tanpura ${isPlaying ? 'playing' : ''}`}
        onClick={isPlaying ? stopTanpura : startTanpura}
      >
        {isPlaying ? '■ Stop Tanpura' : '▶ Start Tanpura'}
      </button>
    </section>
  );
}