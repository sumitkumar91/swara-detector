import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  RAGAS_BY_TIME,
  TIME_SLOTS,
  isHourInRange,
  getRagasForHour,
  getCurrentTimeRagas,
} from '../src/data/timeRagas.js';

describe('Time of Day Ragas Dataset & Logic', () => {
  it('contains all 30 curated ragas with required properties', () => {
    assert.equal(RAGAS_BY_TIME.length, 30);
    RAGAS_BY_TIME.forEach((raga) => {
      assert.ok(raga.name, 'Missing name');
      assert.ok(raga.time, 'Missing time string');
      assert.ok(Array.isArray(raga.hourRange) && raga.hourRange.length === 2, 'Invalid hourRange');
      assert.ok(raga.mood, 'Missing mood');
      assert.ok(raga.searchQuery, 'Missing searchQuery');
    });
  });

  it('correctly matches midnight-wrapping hour ranges [22, 1]', () => {
    const range = [22, 1];
    assert.equal(isHourInRange(22, range), true);
    assert.equal(isHourInRange(23, range), true);
    assert.equal(isHourInRange(0, range), true);
    assert.equal(isHourInRange(1, range), false);
    assert.equal(isHourInRange(21, range), false);
  });

  it('matches standard hour ranges like [7, 10]', () => {
    const range = [7, 10];
    assert.equal(isHourInRange(7, range), true);
    assert.equal(isHourInRange(8, range), true);
    assert.equal(isHourInRange(9, range), true);
    assert.equal(isHourInRange(10, range), false);
    assert.equal(isHourInRange(6, range), false);
  });

  it('every hour of the 24-hour day (0 to 23) has active ragas', () => {
    for (let h = 0; h < 24; h++) {
      const ragas = getRagasForHour(h);
      assert.ok(ragas.length > 0, `No ragas found for hour ${h}`);
    }
  });

  it('returns valid structure from getCurrentTimeRagas', () => {
    const result = getCurrentTimeRagas(new Date());
    assert.ok(typeof result.hour === 'number');
    assert.ok(result.slot.label);
    assert.ok(Array.isArray(result.ragas));
    assert.ok(result.ragas.length > 0);
  });
});
