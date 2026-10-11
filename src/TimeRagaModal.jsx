import React, { useState, useEffect } from 'react';
import {
  TIME_SLOTS,
  getCurrentTimeRagas,
  RAGAS_BY_TIME,
} from './data/timeRagas';

/**
 * TimeRagaModal Component
 *
 * Shows users which ragas are traditionally recommended to listen to right now
 * based on the time of day (Prahar system), with quick links to curated YouTube recordings.
 */
export default function TimeRagaModal({ isOpen, onClose }) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(-1); // -1 = "Current Time / Right Now"
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Update current time string
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentInfo = getCurrentTimeRagas();
  const isNowSelected = selectedSlotIndex === -1;

  // Selected ragas to display
  let displayedRagas = [];
  let displayedSlotLabel = '';
  let displayedPeriod = '';

  if (isNowSelected) {
    displayedRagas = currentInfo.ragas;
    displayedSlotLabel = currentInfo.slot.label;
    displayedPeriod = currentInfo.slot.period;
  } else {
    const slot = TIME_SLOTS[selectedSlotIndex];
    displayedSlotLabel = slot.label;
    displayedPeriod = slot.period;
    displayedRagas = RAGAS_BY_TIME.filter((r) => r.time === slot.label);
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="time-raga-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-raga-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="time-raga-header">
          <div>
            <div className="time-raga-badge">
              <span className="live-dot" aria-hidden="true"></span>
              {currentTimeStr} • Current Prahar ({currentInfo.slot.label})
            </div>
            <h2 id="time-raga-title" className="time-raga-title">
              Ragas for Right Now
            </h2>
            <p className="time-raga-subtitle">
              In Indian classical music, ragas are traditionally associated with specific times of the day (Prahars) to harmonize with nature and human biorhythms.
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Time Slot Filter Pills */}
        <div className="time-slot-pills" role="tablist" aria-label="Time of Day Filter">
          <button
            type="button"
            role="tab"
            aria-selected={isNowSelected}
            className={`slot-pill ${isNowSelected ? 'active' : ''}`}
            onClick={() => setSelectedSlotIndex(-1)}
          >
            ✨ Right Now ({currentInfo.slot.label})
          </button>
          {TIME_SLOTS.map((slot, idx) => (
            <button
              key={slot.label}
              type="button"
              role="tab"
              aria-selected={selectedSlotIndex === idx}
              className={`slot-pill ${selectedSlotIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedSlotIndex(idx)}
            >
              {slot.label}
            </button>
          ))}
        </div>

        {/* Active Slot Summary Banner */}
        <div className="active-slot-banner">
          <div>
            <span className="slot-period-tag">{displayedPeriod}</span>
            <span className="slot-time-range">{displayedSlotLabel}</span>
          </div>
          <span className="raga-count-badge">
            {displayedRagas.length} {displayedRagas.length === 1 ? 'Raga' : 'Ragas'}
          </span>
        </div>

        {/* Raga Cards Grid */}
        <div className="time-ragas-grid">
          {displayedRagas.map((raga) => {
            const ytQuery = raga.name.toLowerCase().startsWith('raag')
              ? raga.name
              : `Raag ${raga.name}`;
            const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`;

            return (
              <div key={raga.name} className="time-raga-card">
                <div className="time-raga-card-header">
                  <h3 className="raga-card-name">{raga.name}</h3>
                  <span className="raga-time-tag">{raga.time}</span>
                </div>

                <div className="raga-mood-box">
                  <span className="mood-label">Mood:</span>
                  <p className="raga-mood">{raga.mood}</p>
                </div>

                <div className="raga-card-actions">
                  <a
                    href={ytUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="raga-listen-link"
                    title={`Listen to ${raga.name} on YouTube`}
                  >
                    ▶ Listen on YouTube
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="time-raga-footer">
          <p className="time-raga-footer-note">
            💡 <strong>Listening Tip:</strong> Early morning ragas invoke peace and devotion, afternoon ragas evoke romantic yearning, while late night ragas cultivate deep tranquility.
          </p>
          <button type="button" className="btn btn-secondary close-footer-btn" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
