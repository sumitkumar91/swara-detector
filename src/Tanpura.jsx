import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TanpuraEngine } from './audio/tanpuraEngine';
import {
  CHROMATIC_NOTES,
  OCTAVE_OPTIONS,
  TUNING_PRESETS,
  getStringFrequencies,
  noteToFrequency,
  frequencyToNote,
} from './audio/musicTheory';

/**
 * Digital Tanpura Component
 *
 * Provides a continuous Indian classical drone player integrated with
 * the Swara Detector's tonic (Base Sa) reference.
 */
export default function Tanpura({ baseFrequency = 240, onBaseFrequencyChange }) {
  // Playback state
  const [playbackState, setPlaybackState] = useState('stopped'); // 'stopped' | 'playing' | 'loading' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [activeStringIndex, setActiveStringIndex] = useState(null);

  // Tanpura configuration
  const [tuning, setTuning] = useState('pa'); // 'pa' | 'ma'
  const [volume, setVolume] = useState(0.5); // 0.0 to 1.0 (50% conservative default)
  const [tempo, setTempo] = useState(60); // 30 to 100 BPM

  // Tonic note & octave representation derived from baseFrequency
  const initialNoteInfo = frequencyToNote(baseFrequency) || { noteIndex: 11, octave: 3, cents: -49 };
  const [selectedNoteIndex, setSelectedNoteIndex] = useState(initialNoteInfo.noteIndex);
  const [selectedOctave, setSelectedOctave] = useState(initialNoteInfo.octave);

  // Engine instance ref
  const engineRef = useRef(null);

  // Sync note & octave dropdowns when baseFrequency changes externally
  useEffect(() => {
    const noteInfo = frequencyToNote(baseFrequency);
    if (noteInfo) {
      setSelectedNoteIndex(noteInfo.noteIndex);
      if (noteInfo.octave >= 2 && noteInfo.octave <= 4) {
        setSelectedOctave(noteInfo.octave);
      }
    }
    if (engineRef.current) {
      engineRef.current.setBaseFrequency(baseFrequency);
    }
  }, [baseFrequency]);

  // Handle Note selection (Method 1)
  const handleNoteSelect = (newNoteIndex) => {
    const idx = parseInt(newNoteIndex, 10);
    setSelectedNoteIndex(idx);
    const newFreq = noteToFrequency(idx, selectedOctave);
    if (onBaseFrequencyChange) {
      onBaseFrequencyChange(newFreq);
    }
  };

  // Handle Octave selection (Method 1)
  const handleOctaveSelect = (newOctave) => {
    const oct = parseInt(newOctave, 10);
    setSelectedOctave(oct);
    const newFreq = noteToFrequency(selectedNoteIndex, oct);
    if (onBaseFrequencyChange) {
      onBaseFrequencyChange(newFreq);
    }
  };

  // Handle direct Frequency input / slider (Method 2)
  const handleFrequencyChange = (value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      if (onBaseFrequencyChange) {
        onBaseFrequencyChange(num);
      }
    }
  };

  // Handle Volume change
  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    if (engineRef.current) {
      engineRef.current.setVolume(newVol);
    }
  };

  // Handle Tempo change
  const handleTempoChange = (newTempo) => {
    setTempo(newTempo);
    if (engineRef.current) {
      engineRef.current.setTempo(newTempo);
    }
  };

  // Handle Tuning change
  const handleTuningChange = (newTuning) => {
    setTuning(newTuning);
    if (engineRef.current) {
      engineRef.current.setTuning(newTuning);
    }
  };

  // Toggle Start / Stop Tanpura
  const togglePlayback = useCallback(async () => {
    if (!engineRef.current) return;

    if (playbackState === 'playing' || playbackState === 'loading') {
      engineRef.current.stop();
    } else {
      setErrorMessage('');
      try {
        await engineRef.current.start();
      } catch (err) {
        console.error('Failed to start Tanpura playback:', err);
        setErrorMessage(err.message || 'Unable to start audio playback. Please check audio permissions.');
      }
    }
  }, [playbackState]);

  // Initialize and tear down Tanpura engine
  useEffect(() => {
    const engine = new TanpuraEngine({
      baseFrequency,
      tuning,
      volume,
      tempo,
      onStateChange: (state, error) => {
        setPlaybackState(state);
        if (error) {
          setErrorMessage(error.message || 'Audio error occurred.');
        } else if (state === 'stopped') {
          setActiveStringIndex(null);
        }
      },
      onStringPluck: (stringIdx) => {
        setActiveStringIndex(stringIdx);
      },
      onError: (err) => {
        setErrorMessage(err.message || 'Audio playback error.');
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stringFrequencies = getStringFrequencies(baseFrequency, tuning);
  const activePreset = TUNING_PRESETS[tuning] || TUNING_PRESETS.pa;
  const currentNoteInfo = frequencyToNote(baseFrequency);

  return (
    <section className="tanpura-card" aria-label="Tanpura Player">
      {/* Top Section / Header */}
      <div className="tanpura-header">
        <div>
          <h2 className="section-title tanpura-title">Tanpura Player</h2>
          <p className="tanpura-subtitle">A continuous drone to support your swara practice.</p>
        </div>

        {/* Status Indicator */}
        <div className="tanpura-status-container" role="status" aria-live="polite">
          <span className={`status-badge status-${playbackState}`}>
            <span className="status-dot" aria-hidden="true"></span>
            {playbackState === 'playing' && 'Playing'}
            {playbackState === 'stopped' && 'Stopped'}
            {playbackState === 'loading' && 'Loading...'}
            {playbackState === 'error' && 'Error'}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="tanpura-error-banner" role="alert">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{errorMessage}</span>
          <button
            type="button"
            className="error-dismiss-btn"
            onClick={() => setErrorMessage('')}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Section: Base Sa Selection */}
      <div className="tanpura-section-block">
        <h3 className="block-title">Base Sa (Tonic)</h3>
        <p className="block-description">
          The reference tonic frequency used by both the Tanpura drone and the swara detector.
        </p>

        <div className="sa-selection-grid">
          {/* Method 1: Musical Note Selection */}
          <div className="sa-control-box">
            <span className="control-box-label">Method 1: Musical Note</span>
            <div className="note-select-row">
              <div className="select-field">
                <label htmlFor="tanpura-note-select">Pitch Class</label>
                <select
                  id="tanpura-note-select"
                  value={selectedNoteIndex}
                  onChange={(e) => handleNoteSelect(e.target.value)}
                  className="tanpura-select"
                >
                  {CHROMATIC_NOTES.map((note, index) => (
                    <option key={note} value={index}>
                      {note}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select-field">
                <label htmlFor="tanpura-octave-select">Reference Octave</label>
                <select
                  id="tanpura-octave-select"
                  value={selectedOctave}
                  onChange={(e) => handleOctaveSelect(e.target.value)}
                  className="tanpura-select"
                >
                  {OCTAVE_OPTIONS.map((oct) => (
                    <option key={oct.value} value={oct.value}>
                      {oct.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Method 2: Frequency Selection */}
          <div className="sa-control-box">
            <span className="control-box-label">Method 2: Frequency (Hz)</span>
            <div className="frequency-input-row">
              <input
                type="number"
                id="tanpura-freq-input"
                aria-label="Base Sa Frequency in Hertz"
                min="100"
                max="500"
                step="0.5"
                value={baseFrequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="tanpura-number-input"
              />
              <span className="unit-label">Hz</span>
            </div>

            <div className="frequency-slider-container">
              <input
                type="range"
                aria-label="Base Sa Frequency slider"
                min="100"
                max="450"
                step="0.5"
                value={baseFrequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="tanpura-slider"
              />
            </div>
          </div>
        </div>

        {/* Current Active Frequency Readout */}
        <div className="current-sa-badge">
          <span>Active Tonic: </span>
          <strong>{baseFrequency.toFixed(1)} Hz</strong>
          {currentNoteInfo && (
            <span className="note-cents-hint">
              {' '}({currentNoteInfo.noteName}
              {currentNoteInfo.octave}
              {currentNoteInfo.cents !== 0
                ? ` ${currentNoteInfo.cents > 0 ? '+' : ''}${currentNoteInfo.cents}¢`
                : ' exact'})
            </span>
          )}
        </div>
      </div>

      {/* Tuning Configuration */}
      <div className="tanpura-section-block">
        <h3 className="block-title">Tuning Configuration</h3>
        <p className="block-description">{activePreset.description}</p>

        <div className="tuning-buttons-group" role="radiogroup" aria-label="Tuning Preset">
          {Object.values(TUNING_PRESETS).map((preset) => (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={tuning === preset.id}
              className={`tuning-btn ${tuning === preset.id ? 'active' : ''}`}
              onClick={() => handleTuningChange(preset.id)}
            >
              <div className="preset-name">{preset.name}</div>
              <div className="preset-summary">
                {preset.id === 'pa'
                  ? 'Lower 5th (Mandra Pa) • Jodi • Kharja'
                  : 'Lower 4th (Mandra Ma) • Jodi • Kharja'}
              </div>
            </button>
          ))}
        </div>

        {/* 4 String Indicators */}
        <div className="strings-visualizer" aria-label="Tanpura Strings">
          {stringFrequencies.map((str, i) => (
            <div
              key={i}
              className={`string-card ${activeStringIndex === i ? 'active-pluck' : ''}`}
              aria-label={`String ${i + 1}: ${str.name} (${str.swara}), ${str.frequency.toFixed(1)} Hertz`}
            >
              <div className="string-header">
                <span className="string-number">String {i + 1}</span>
                <span className="string-formula">{str.formula}</span>
              </div>
              <div className="string-swara">{str.name}</div>
              <div className="string-swara-sub">{str.swara}</div>
              <div className="string-freq">{str.frequency.toFixed(1)} Hz</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls: Volume and Plucking Speed */}
      <div className="tanpura-controls-row">
        {/* Volume */}
        <div className="control-slider-card">
          <div className="slider-label-row">
            <label htmlFor="tanpura-volume-slider">Volume</label>
            <span className="slider-val-badge">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            id="tanpura-volume-slider"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="tanpura-slider"
          />
        </div>

        {/* Plucking Speed */}
        <div className="control-slider-card">
          <div className="slider-label-row">
            <label htmlFor="tanpura-tempo-slider">Plucking Speed</label>
            <span className="slider-val-badge">{tempo} BPM</span>
          </div>
          <input
            type="range"
            id="tanpura-tempo-slider"
            min="30"
            max="100"
            step="1"
            value={tempo}
            onChange={(e) => handleTempoChange(parseInt(e.target.value, 10))}
            className="tanpura-slider"
          />
        </div>
      </div>

      {/* Bottom Section: Start/Stop Button & Headphones Recommendation */}
      <div className="tanpura-footer">
        <button
          type="button"
          className={`btn btn-tanpura ${playbackState === 'playing' ? 'btn-stop' : 'btn-start'}`}
          onClick={togglePlayback}
          aria-label={playbackState === 'playing' ? 'Stop Tanpura drone' : 'Start Tanpura drone'}
        >
          {playbackState === 'playing' ? '■ Stop Tanpura' : '▶ Start Tanpura'}
        </button>

        <p className="headphones-tip">
          <span className="tip-icon" aria-hidden="true">🎧</span>
          <strong>Recommendation:</strong> Use headphones when singing with live pitch detection to prevent microphone echo.
        </p>
      </div>
    </section>
  );
}