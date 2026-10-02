import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRaceDates, raceStatus } from '../src/lib/race-dates.mjs';

test('parse official dates including year boundaries', () => {
  assert.deepEqual(parseRaceDates('Jan 30 - Jan 31, 2027'), { startDate: '2027-01-30', endDate: '2027-01-31' });
  assert.deepEqual(parseRaceDates('Dec 31 - Jan 01, 2028'), { startDate: '2027-12-31', endDate: '2028-01-01' });
  assert.throws(() => parseRaceDates('Feb 30 - Mar 01, 2027'));
});

test('30-day countdown boundary and selected events share date status', () => {
  const event = { startDate: '2027-01-30', endDate: '2027-01-31', timeZone: 'America/Chicago' };
  assert.equal(raceStatus(event, new Date('2026-12-30T18:00:00Z')).soon, false);
  assert.equal(raceStatus(event, new Date('2026-12-31T18:00:00Z')).soon, true);
  assert.equal(raceStatus(event, new Date('2027-01-30T18:00:00Z')).label, 'Starts today');
  assert.equal(raceStatus(event, new Date('2027-01-31T18:00:00Z')).label, 'In progress');
  assert.equal(raceStatus(event, new Date('2027-02-01T18:00:00Z')).ended, true);
});

test('use venue local date, not visitor date', () => {
  const event = { startDate: '2027-01-30', endDate: '2027-01-31', timeZone: 'America/Los_Angeles' };
  assert.equal(raceStatus(event, new Date('2027-01-30T02:00:00Z')).days, 1);
});