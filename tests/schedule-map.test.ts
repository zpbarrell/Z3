import test from 'node:test';
import assert from 'node:assert/strict';
import { mapEvents, mapPath } from '../src/lib/schedule-map';
import { parseSchedule } from '../src/lib/schedule';
import { raceStatus } from '../src/lib/race-dates.mjs';
import tracks from '../src/data/tracks.json';

function fixture(id: string, year: string) {
  return `<div class="container d-none d-md-flex"><a href="/race/?id=${id}"><h4>Barber Motorsports Park, Leeds AL</h4></a><p><a>Jan 30 - Jan 31, ${year}<br>Entry Deadline: Jan 09, ${year}</a></p><h4>Test race ${year}</h4></div>`;
}

test('parse official race IDs and exclude 2026 from map data', () => {
  const events = parseSchedule(fixture('old', '2026') + fixture('new', '2027'));
  const mapped = mapEvents(events);
  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].id, 'new');
  assert.equal(mapped[0].startDate, '2027-01-30');
  assert.equal(mapped[0].selected, false);
  assert.ok(mapPath && mapPath.length > 1000);
  assert.ok(mapped[0].x > 0 && mapped[0].x < 960);
});

test('selected races retain star status while countdown turns red', () => {
  const [event] = mapEvents(parseSchedule(fixture('463', '2027')), ['463']);
  assert.equal(event.selected, true);
  assert.equal(raceStatus(event, new Date('2027-01-10T18:00:00Z')).soon, true);
});

test('repeated track events have distinct marker positions', () => {
  const mapped = mapEvents(parseSchedule(fixture('first', '2027') + fixture('second', '2027')));
  assert.notEqual(mapped[0].y, mapped[1].y);
  assert.equal(mapped[0].trackY, mapped[1].trackY);
});

test('new unmapped tracks require an explicit coordinate entry', () => {
  const events = parseSchedule(fixture('new', '2027').replace('Barber Motorsports Park', 'Unknown Track'));
  assert.throws(() => mapEvents(events), /Add track coordinates/);
});

test('nearby track markers remain separated at minimum map width', () => {
  const [template] = parseSchedule(fixture('template', '2027'));
  const events = tracks.flatMap((track, index) => [0, 1].map((repeat) => ({
    ...template, id: `${index}-${repeat}`, venue: `${track.name}, USA`,
  })));
  const mapped = mapEvents(events);
  for (const [index, first] of mapped.entries()) {
    for (const second of mapped.slice(index + 1)) {
      assert.ok(Math.abs(first.x - second.x) >= 52 || Math.abs(first.y - second.y) >= 52);
    }
  }
});

test('Indianapolis preference stars all events at qualifying tracks only', () => {
  const [template] = parseSchedule(fixture('template', '2027'));
  const events = tracks.map((track, index) => ({ ...template, id: String(index), venue: `${track.name}, USA` }));
  const preferred = mapEvents(events).filter((event) => event.selected).map((event) => event.track.name).sort();
  assert.deepEqual(preferred, ['Autobahn Country Club', 'GingerMan Raceway', 'Mid-Ohio Sports Car Course', 'NCM Motorsports Park']);
});