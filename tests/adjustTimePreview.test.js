import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrayerTimes } from '../src/utils/prayerHelper.js';

test('Adjust Time Preview - Minute offsets dynamically shift formatted prayer times', () => {
  const city = {
    name: 'Jakarta',
    region: 'DKI Jakarta',
    lat: -6.2088,
    lng: 106.8456,
    timezone: 'Asia/Jakarta',
  };

  const testDate = new Date('2026-09-26T12:00:00Z');

  // Baseline calculation (0 offset)
  const baseCalc = calculatePrayerTimes(city, testDate, {}, 'id');
  assert.ok(baseCalc);

  const baseFajr = baseCalc.allPrayers.find((p) => p.key === 'fajr').time;
  const baseDhuhr = baseCalc.allPrayers.find((p) => p.key === 'dhuhr').time;

  // Add +3m to fajr and -2m to dhuhr
  const adjustedCalc = calculatePrayerTimes(
    city,
    testDate,
    { fajr: 3, dhuhr: -2 },
    'id'
  );
  assert.ok(adjustedCalc);

  const adjFajr = adjustedCalc.allPrayers.find((p) => p.key === 'fajr').time;
  const adjDhuhr = adjustedCalc.allPrayers.find((p) => p.key === 'dhuhr').time;

  // Convert "HH:MM" to total minutes to verify arithmetic difference
  const toMins = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  assert.equal(
    toMins(adjFajr) - toMins(baseFajr),
    3,
    `Fajr time should shift by +3 minutes (from ${baseFajr} to ${adjFajr})`
  );
  assert.equal(
    toMins(adjDhuhr) - toMins(baseDhuhr),
    -2,
    `Dhuhr time should shift by -2 minutes (from ${baseDhuhr} to ${adjDhuhr})`
  );
});

test('Adjust Time Preview - Respects international city timezones when adjusting', () => {
  const makkah = {
    name: 'Makkah',
    region: 'Saudi Arabia',
    lat: 21.4225,
    lng: 39.8262,
    timezone: 'Asia/Riyadh',
  };

  const testDate = new Date('2026-09-26T12:00:00Z');

  const baseCalc = calculatePrayerTimes(makkah, testDate, {}, 'id');
  const baseSubuh = baseCalc.allPrayers.find((p) => p.key === 'fajr').time;

  // Makkah Fajr baseline is 04:50
  assert.equal(baseSubuh, '04:50');

  // Adjust +5 minutes -> 04:55
  const adjCalc = calculatePrayerTimes(makkah, testDate, { fajr: 5 }, 'id');
  const adjSubuh = adjCalc.allPrayers.find((p) => p.key === 'fajr').time;
  assert.equal(adjSubuh, '04:55');
});
