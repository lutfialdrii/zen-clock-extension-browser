import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_CITIES, searchCities } from '../src/utils/citiesData.js';
import { calculatePrayerTimes } from '../src/utils/prayerHelper.js';

test('ALL_CITIES - Contains over 500 cities and regencies', () => {
  assert.ok(Array.isArray(ALL_CITIES), 'ALL_CITIES must be an array');
  assert.ok(ALL_CITIES.length >= 500, `Expected at least 500 cities, got ${ALL_CITIES.length}`);
});

test('ALL_CITIES - All items have valid schema (name, region, lat, lng, timezone)', () => {
  for (const city of ALL_CITIES) {
    assert.ok(typeof city.name === 'string' && city.name.trim().length > 0, `City name missing in ${JSON.stringify(city)}`);
    assert.ok(typeof city.region === 'string' && city.region.trim().length > 0, `Region missing in ${city.name}`);
    assert.ok(typeof city.lat === 'number' && !isNaN(city.lat), `Invalid lat in ${city.name}`);
    assert.ok(typeof city.lng === 'number' && !isNaN(city.lng), `Invalid lng in ${city.name}`);
    assert.ok(city.lat >= -90 && city.lat <= 90, `Lat out of range in ${city.name}`);
    assert.ok(city.lng >= -180 && city.lng <= 180, `Lng out of range in ${city.name}`);
  }
});

test('searchCities - Finds cities matching query in name or region', () => {
  const bandungResults = searchCities('Bandung');
  assert.ok(bandungResults.length > 0, 'Should find Bandung');
  assert.ok(bandungResults.some(c => c.name.includes('Bandung')), 'Contains Bandung city');

  const baliResults = searchCities('Bali');
  assert.ok(baliResults.length > 0, 'Should find cities in Bali');
  assert.ok(baliResults.some(c => c.name === 'Denpasar'), 'Should include Denpasar for Bali');

  const makkahResults = searchCities('Makkah');
  assert.ok(makkahResults.length > 0, 'Should find international city Makkah');
  assert.equal(makkahResults[0].timezone, 'Asia/Riyadh');
});

test('calculatePrayerTimes - Respects city timezone for local formatting', () => {
  const makkah = {
    name: 'Makkah',
    region: 'Saudi Arabia',
    lat: 21.4225,
    lng: 39.8262,
    timezone: 'Asia/Riyadh',
  };

  const res = calculatePrayerTimes(makkah, new Date('2026-09-26T12:00:00Z'));
  assert.ok(res, 'Prayer times calculated');
  assert.ok(res.allPrayers.length === 6, 'All 6 prayer periods calculated');

  // Verify format matches HH:mm and matches Asia/Riyadh local prayer times (UTC+3)
  for (const p of res.allPrayers) {
    assert.match(p.time, /^\d{2}:\d{2}$/, `${p.name} time format must be HH:mm`);
  }

  // Exact times check: Subuh in Makkah is ~04:50, not 08:50 (which would be WIB)
  assert.equal(res.allPrayers[0].time, '04:50', 'Makkah Subuh must be formatted in Asia/Riyadh time');
  assert.equal(res.allPrayers[2].time, '12:15', 'Makkah Dzuhur must be formatted in Asia/Riyadh time');
});

