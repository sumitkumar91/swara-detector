import React, { useState, useEffect, useCallback } from 'react';
import { RAGAS, SWARA_NAMES, SWARA_SHORT } from './data/ragas';
import './RagaWordle.css';

const MAX_GUESSES = 6;

// Returns feedback for a guessed raga vs the target raga.
// For each swara position:
//   'correct'  — present in BOTH guess and target (green)
//   'wrong'    — present in guess but NOT in target (red)
//   'missing'  — present in target but NOT in guess (yellow)
//   'absent'   — present in NEITHER (dark grey)
function computeFeedback(guessedRaga, targetRaga) {
  return guessedRaga.swaras.map((hasSwara, i) => {
    const targetHas = targetRaga.swaras[i];
    if (hasSwara && targetHas) return 'correct';
    if (hasSwara && !targetHas) return 'wrong';
    if (!hasSwara && targetHas) return 'missing';
    return 'absent';
  });
}

function pickRandomRaga() {
  return RAGAS[Math.floor(Math.random() * RAGAS.length)];
}

export default function RagaWordle() {
  const [target, setTarget] = useState(() => pickRandomRaga());
  const [guesses, setGuesses] = useState([]);       // array of raga objects
  const [feedbacks, setFeedbacks] = useState([]);   // array of feedback arrays
  const [selected, setSelected] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [shake, setShake] = useState(false);

  const alreadyGuessed = guesses.map(g => g.name);
  const availableRagas = RAGAS.filter(r => !alreadyGuessed.includes(r.name));

  const handleGuess = useCallback(() => {
    if (!selected || gameOver) return;

    const guessedRaga = RAGAS.find(r => r.name === selected);
    if (!guessedRaga) return;

    const feedback = computeFeedback(guessedRaga, target);
    const newGuesses = [...guesses, guessedRaga];
    const newFeedbacks = [...feedbacks, feedback];

    setGuesses(newGuesses);
    setFeedbacks(newFeedbacks);
    setSelected('');

    const isCorrect = guessedRaga.name === target.name;
    if (isCorrect) {
      setWon(true);
      setGameOver(true);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
    }
  }, [selected, gameOver, guesses, feedbacks, target]);

  const handleNewGame = () => {
    const newTarget = pickRandomRaga();
    setTarget(newTarget);
    setGuesses([]);
    setFeedbacks([]);
    setSelected('');
    setGameOver(false);
    setWon(false);
  };

  // Keyboard shortcut: Enter to submit
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && selected && !gameOver) handleGuess();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleGuess, selected, gameOver]);

  const emptyRows = MAX_GUESSES - guesses.length - (gameOver ? 0 : 1);

  return (
    <div className="wordle-page">
      <div className="wordle-header">
        <h1 className="wordle-title">Raga Wordle</h1>
        <p className="wordle-subtitle">Guess the raga from swara clues — {MAX_GUESSES} attempts</p>
        <button className="how-btn" onClick={() => setShowHow(v => !v)}>
          {showHow ? 'Hide' : 'How to Play'}
        </button>
      </div>

      {showHow && (
        <div className="how-to-play">
          <h3>How to Play</h3>
          <p>Each guess reveals which swaras your chosen raga shares with the hidden raga.</p>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-cell correct">G</span>
              <span>Present in <strong>both</strong> your guess and the target raga</span>
            </div>
            <div className="legend-item">
              <span className="legend-cell missing">G</span>
              <span>In the target raga but <strong>missing</strong> from your guess</span>
            </div>
            <div className="legend-item">
              <span className="legend-cell wrong">G</span>
              <span>In your guess but <strong>not</strong> in the target raga</span>
            </div>
            <div className="legend-item">
              <span className="legend-cell absent">G</span>
              <span>Not in <strong>either</strong> raga (correctly absent)</span>
            </div>
          </div>
          <p className="how-note">
            Tip: Cells only show the swara label when it is present in your guessed raga.
            Yellow cells reveal what swaras the target raga has that yours doesn't.
          </p>
        </div>
      )}

      <div className="wordle-board-wrap">
        {/* Swara header row */}
        <div className="swara-header-row">
          <div className="row-label" />
          {SWARA_SHORT.map((s, i) => (
            <div key={i} className="header-cell" title={SWARA_NAMES[i]}>{s}</div>
          ))}
        </div>

        {/* Completed guess rows */}
        {guesses.map((guess, gi) => (
          <div key={gi} className="board-row">
            <div className="row-label">{gi + 1}</div>
            {feedbacks[gi].map((fb, si) => (
              <div
                key={si}
                className={`board-cell ${fb}`}
                title={`${SWARA_NAMES[si]}: ${fb}`}
              >
                {guess.swaras[si] ? SWARA_SHORT[si] : ''}
              </div>
            ))}
          </div>
        ))}

        {/* Active guess row (current input visualised) */}
        {!gameOver && (
          <div className={`board-row active-row ${shake ? 'shake' : ''}`}>
            <div className="row-label">{guesses.length + 1}</div>
            {SWARA_SHORT.map((s, si) => {
              const currentRaga = RAGAS.find(r => r.name === selected);
              const hasSwara = currentRaga ? currentRaga.swaras[si] : false;
              return (
                <div key={si} className={`board-cell pending ${hasSwara ? 'filled' : ''}`}>
                  {hasSwara ? s : ''}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty rows */}
        {Array(Math.max(0, emptyRows)).fill(null).map((_, i) => (
          <div key={i} className="board-row">
            <div className="row-label" />
            {SWARA_SHORT.map((_, si) => (
              <div key={si} className="board-cell empty" />
            ))}
          </div>
        ))}
      </div>

      {/* Input area */}
      {!gameOver && (
        <div className="guess-controls">
          <select
            className="raga-select"
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            <option value="">— Choose a raga —</option>
            {availableRagas.map(r => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>
          <button
            className="guess-btn"
            onClick={handleGuess}
            disabled={!selected}
          >
            Guess ({guesses.length}/{MAX_GUESSES})
          </button>
        </div>
      )}

      {/* Result banner */}
      {gameOver && (
        <div className={`result-banner ${won ? 'won' : 'lost'}`}>
          {won ? (
            <>
              <div className="result-icon">🎵</div>
              <h2>Brilliant! You got it in {guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}!</h2>
              <p className="result-raga-name">{target.name}</p>
            </>
          ) : (
            <>
              <div className="result-icon">🎼</div>
              <h2>The raga was…</h2>
              <p className="result-raga-name">{target.name}</p>
            </>
          )}
          <div className="raga-info-card">
            <div className="raga-info-row">
              <span className="info-label">Thaat</span>
              <span>{target.thaat}</span>
            </div>
            <div className="raga-info-row">
              <span className="info-label">Time</span>
              <span>{target.time}</span>
            </div>
            <p className="raga-description">{target.description}</p>
          </div>
          <button className="new-game-btn" onClick={handleNewGame}>
            Play Again
          </button>
        </div>
      )}

      {/* Guessed ragas log */}
      {guesses.length > 0 && (
        <div className="guess-log">
          <h3 className="log-title">Your Guesses</h3>
          {guesses.map((g, i) => (
            <div key={i} className={`log-entry ${g.name === target.name ? 'log-correct' : ''}`}>
              <span className="log-num">{i + 1}.</span>
              <span className="log-name">{g.name}</span>
              <span className="log-meta">{g.thaat} · {g.time}</span>
              {g.name === target.name && <span className="log-tick">✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Swara reference panel */}
      <div className="swara-reference">
        <h3 className="ref-title">Swara Reference</h3>
        <div className="ref-grid">
          {SWARA_NAMES.map((name, i) => (
            <div key={i} className="ref-cell">
              <span className="ref-short">{SWARA_SHORT[i]}</span>
              <span className="ref-name">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}