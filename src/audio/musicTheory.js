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
 * Tanpura Tuning Configurations (Traditional Acoustic 4-String Setup)
 *
 * Sequence: Mandra Pa/Ma (String 1) -> Jodi Madhya Sa (String 2) -> Jodi Madhya Sa (String 3) -> Kharja Mandra Sa (String 4)
 */
export const TUNING_PRESETS = {
  pa: {
    id: 'pa',
    name: 'Pa–Sa–Sa–Sa (Standard)',
    description: 'Traditional tuning starting with the lower fifth (Mandra Pancham).',
    strings: [
      { id: 0, name: 'Pa (Low)', ratio: 0.75, swara: 'Mandra Pa', formula: '3/4 × Sa' },
      { id: 1, name: 'Sa', ratio: 1.0, swara: 'Madhya Sa', formula: '1 × Sa' },
      { id: 2, name: 'Sa', ratio: 1.0, swara: 'Madhya Sa', formula: '1 × Sa' },
      { id: 3, name: 'Sa (Low)', ratio: 0.5, swara: 'Mandra Sa', formula: '1/2 × Sa' },
    ],
  },
  ma: {
    id: 'ma',
    name: 'Ma–Sa–Sa–Sa (Malkauns/Bageshri)',
    description: 'Traditional tuning starting with the lower fourth (Mandra Madhyam).',
    strings: [
      { id: 0, name: 'Ma (Low)', ratio: 0.666666, swara: 'Mandra Ma', formula: '2/3 × Sa' }, // (4/3) / 2
      { id: 1, name: 'Sa', ratio: 1.0, swara: 'Madhya Sa', formula: '1 × Sa' },
      { id: 2, name: 'Sa', ratio: 1.0, swara: 'Madhya Sa', formula: '1 × Sa' },
      { id: 3, name: 'Sa (Low)', ratio: 0.5, swara: 'Mandra Sa', formula: '1/2 × Sa' },
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
