/**
 * Music Theory and Tuning Configuration for Tanpura and Swara Detector
 */

export const CHROMATIC_NOTES = [
  'C',
  'C♯/D♭',
  'D',
  'D♯/E♭',
  'E',
  'F',
  'F♯/G♭',
  'G',
  'G♯/A♭',
  'A',
  'A♯/B♭',
  'B',
];

export const OCTAVE_OPTIONS = [
  { value: 2, label: 'Octave 2 (Lower / Bass, ~65–123 Hz)' },
  { value: 3, label: 'Octave 3 (Male Vocal, ~131–247 Hz)' },
  { value: 4, label: 'Octave 4 (Female Vocal, ~262–494 Hz)' },
];

/**
 * Tanpura Tuning Configurations
 *
 * Sa–Pa: String 1 = Higher Sa (2x), String 2 = Base Sa (1x), String 3 = Pa (3/2x), String 4 = Base Sa (1x)
 * Sa–Ma: String 1 = Higher Sa (2x), String 2 = Base Sa (1x), String 3 = Ma (4/3x), String 4 = Base Sa (1x)
 */
export const TUNING_PRESETS = {
  pa: {
    id: 'pa',
    name: 'Sa–Pa',
    description: 'Uses the tonic and perfect fifth as the principal pitch references.',
    strings: [
      { id: 0, name: 'Sa (High)', ratio: 2.0, swara: 'Taar Sa', formula: '2 × Sa' },
      { id: 1, name: 'Sa', ratio: 1.0, swara: 'Madhya Sa', formula: '1 × Sa' },
      { id: 2, name: 'Pa', ratio: 1.5, swara: 'Pancham', formula: '3/2 × Sa' },
      { id: 3, name: 'Sa', ratio: 1.0, swara: 'Madhya Sa', formula: '1 × Sa' },
    ],
  },
  ma: {
    id: 'ma',
    name: 'Sa–Ma',
    description: 'Uses the tonic and perfect fourth as the principal pitch references.',
    strings: [
      { id: 0, name: 'Sa (High)', ratio: 2.0, swara: 'Taar Sa', formula: '2 × Sa' },
      { id: 1, name: 'Sa', ratio: 1.0, swara: 'Madhya Sa', formula: '1 × Sa' },
      { id: 2, name: 'Ma', ratio: 4 / 3, swara: 'Madhyam', formula: '4/3 × Sa' },
      { id: 3, name: 'Sa', ratio: 1.0, swara: 'Madhya Sa', formula: '1 × Sa' },
    ],
  },
};

/**
 * Calculate the frequencies for all 4 strings based on base Sa and tuning configuration.
 *
 * @param {number} baseFrequency - Frequency of base Sa in Hz
 * @param {'pa'|'ma'} tuning - Tuning preset ('pa' or 'ma')
 * @returns {Array<{id: number, name: string, ratio: number, frequency: number, swara: string, formula: string}>}
 */
export function getStringFrequencies(baseFrequency, tuning = 'pa') {
  const safeBase = typeof baseFrequency === 'number' && !isNaN(baseFrequency) && baseFrequency > 0
    ? baseFrequency
    : 240;
  const preset = TUNING_PRESETS[tuning] || TUNING_PRESETS.pa;

  return preset.strings.map((str) => ({
    ...str,
    frequency: safeBase * str.ratio,
  }));
}

/**
 * Calculate frequency in Hz from chromatic note index and octave.
 * A4 = 440 Hz standard equal temperament.
 *
 * @param {number} noteIndex - 0 for C, 1 for C#, ..., 11 for B
 * @param {number} octave - 2, 3, or 4
 * @returns {number} Frequency in Hz rounded to 2 decimals
 */
export function noteToFrequency(noteIndex, octave = 3) {
  const midiNote = (octave + 1) * 12 + noteIndex;
  const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
  return Math.round(frequency * 100) / 100;
}

/**
 * Convert a frequency in Hz to closest chromatic note, octave, and deviation in cents.
 *
 * @param {number} frequency - Frequency in Hz
 * @returns {{noteIndex: number, noteName: string, octave: number, cents: number, exactFrequency: number}|null}
 */
export function frequencyToNote(frequency) {
  if (!frequency || isNaN(frequency) || frequency <= 0) {
    return null;
  }
  const midiReal = 69 + 12 * Math.log2(frequency / 440);
  const midiNote = Math.round(midiReal);
  const rawCents = Math.round((midiReal - midiNote) * 100);
  const cents = rawCents === 0 ? 0 : rawCents;
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = ((midiNote % 12) + 12) % 12;
  const exactFrequency = noteToFrequency(noteIndex, octave);

  return {
    noteIndex,
    noteName: CHROMATIC_NOTES[noteIndex],
    octave,
    cents,
    exactFrequency,
  };
}
