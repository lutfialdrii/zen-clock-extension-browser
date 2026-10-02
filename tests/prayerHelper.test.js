import test from 'node:test';
import assert from 'node:assert/strict';
import { getPrayerName, getKemenagCalculationParameters, formatCountdownHoursMinutes } from '../src/utils/prayerHelper.js';
import { getTranslations } from '../src/utils/i18n.js';

test('getPrayerName - Friday (Jumat) dhuhr returns Jum\'at for both id and en', () => {
  // 2026-09-25 is a Friday (day index 5)
  const friday = new Date(2026, 8, 25, 12, 0, 0);
  assert.equal(friday.getDay(), 5, 'Date must be Friday');

  assert.equal(getPrayerName('dhuhr', 'id', friday), "Jum'at");
  assert.equal(getPrayerName('dhuhr', 'en', friday), "Jum'at");
  assert.equal(getPrayerName('Dhuhr', 'id', friday), "Jum'at");
  assert.equal(getPrayerName('DHUHR', 'en', friday), "Jum'at");
});

test('getPrayerName - Non-Friday dhuhr returns Dzuhur (id) and Dhuhr (en)', () => {
  // 2026-09-24 is Thursday (day index 4)
  const thursday = new Date(2026, 8, 24, 12, 0, 0);
  assert.equal(thursday.getDay(), 4, 'Date must be Thursday');

  assert.equal(getPrayerName('dhuhr', 'id', thursday), 'Dzuhur');
  assert.equal(getPrayerName('dhuhr', 'en', thursday), 'Dhuhr');

  // 2026-09-26 is Saturday (day index 6)
  const saturday = new Date(2026, 8, 26, 12, 0, 0);
  assert.equal(saturday.getDay(), 6, 'Date must be Saturday');

  assert.equal(getPrayerName('dhuhr', 'id', saturday), 'Dzuhur');
  assert.equal(getPrayerName('dhuhr', 'en', saturday), 'Dhuhr');
});

test('getPrayerName - Other prayers remain unchanged on Friday', () => {
  const friday = new Date(2026, 8, 25, 12, 0, 0);

  assert.equal(getPrayerName('fajr', 'id', friday), 'Subuh');
  assert.equal(getPrayerName('fajr', 'en', friday), 'Fajr');
  assert.equal(getPrayerName('asr', 'id', friday), 'Ashar');
  assert.equal(getPrayerName('asr', 'en', friday), 'Asr');
  assert.equal(getPrayerName('maghrib', 'id', friday), 'Maghrib');
  assert.equal(getPrayerName('maghrib', 'en', friday), 'Maghrib');
  assert.equal(getPrayerName('isha', 'id', friday), 'Isya');
  assert.equal(getPrayerName('isha', 'en', friday), 'Isha');
});

test('getKemenagCalculationParameters - Applies Kemenag RI standard +2m buffer ihtiyat', () => {
  const params = getKemenagCalculationParameters();
  assert.equal(params.fajrAngle, 20);
  assert.equal(params.ishaAngle, 18);
  assert.equal(params.adjustments.fajr, 2);
  assert.equal(params.adjustments.sunrise, -2);
  assert.equal(params.adjustments.dhuhr, 2);
  assert.equal(params.adjustments.asr, 2);
  assert.equal(params.adjustments.maghrib, 2);
  assert.equal(params.adjustments.isha, 2);
});

test('getTranslations - Provides full translations for id and en', () => {
  const id = getTranslations('id');
  assert.equal(id.prayers.dhuhr, 'Dzuhur');
  assert.ok(id.reminder.quranQuote);

  const en = getTranslations('en');
  assert.equal(en.prayers.dhuhr, 'Dhuhr');
  assert.ok(en.reminder.quranQuote);
});

test('calculatePrayerTimes - Calculates valid prayer times for Jakarta', async () => {
  const { calculatePrayerTimes, POPULAR_CITIES } = await import('../src/utils/prayerHelper.js');
  const jakarta = POPULAR_CITIES.find(c => c.name === 'Jakarta');
  assert.ok(jakarta, 'Jakarta must be in popular cities');

  const testDate = new Date(2026, 8, 25, 10, 0, 0); // Friday 10:00 AM
  const result = calculatePrayerTimes(jakarta, testDate, {}, 'id');

  assert.ok(result);
  assert.equal(result.allPrayers.length, 6);
  assert.equal(result.nextKey, 'dhuhr');
  assert.equal(result.nextPrayerName, "Jum'at", 'Next prayer on Friday 10:00 AM should be Jum\'at');
  assert.ok(result.remainingSeconds > 0);

  // Test post-Isha rollover to tomorrow's Fajr
  const nightDate = new Date(2026, 8, 25, 23, 30, 0); // 11:30 PM
  const nightResult = calculatePrayerTimes(jakarta, nightDate, {}, 'id');
  assert.equal(nightResult.nextKey, 'fajr');
  assert.equal(nightResult.nextPrayerName, 'Subuh');
  assert.ok(nightResult.remainingSeconds > 0);
});

test('formatCountdownHoursMinutes - Formats correctly in both id and en', () => {
  assert.equal(formatCountdownHoursMinutes(0, 'id'), 'sekarang');
  assert.equal(formatCountdownHoursMinutes(0, 'en'), 'now');

  assert.equal(formatCountdownHoursMinutes(30, 'id'), '< 1 menit');
  assert.equal(formatCountdownHoursMinutes(30, 'en'), '< 1 min');

  assert.equal(formatCountdownHoursMinutes(120, 'id'), '2 menit');
  assert.equal(formatCountdownHoursMinutes(60, 'en'), '1 min');
  assert.equal(formatCountdownHoursMinutes(120, 'en'), '2 mins');

  assert.equal(formatCountdownHoursMinutes(3660, 'id'), '1 jam 1 menit');
  assert.equal(formatCountdownHoursMinutes(7320, 'en'), '2 hrs 2 mins');
});

test('buildReminderUrl - Properly formats URL with query params without embedding in base path', async () => {
  const { buildReminderUrl } = await import('../src/utils/prayerHelper.js');

  const base = 'chrome-extension://dmnfclhpjfonamocklepmgcpldnohllf/reminder.html';
  const url1 = buildReminderUrl(base, 'dhuhr', 'Jakarta');
  assert.equal(url1, 'chrome-extension://dmnfclhpjfonamocklepmgcpldnohllf/reminder.html?prayer=dhuhr&city=Jakarta');

  // Strips accidental pre-existing queries to avoid duplicate '?'
  const dirtyBase = 'chrome-extension://dmnfclhpjfonamocklepmgcpldnohllf/reminder.html?prayer=old';
  const url2 = buildReminderUrl(dirtyBase, 'asr', 'Bandung');
  assert.equal(url2, 'chrome-extension://dmnfclhpjfonamocklepmgcpldnohllf/reminder.html?prayer=asr&city=Bandung');

  // Handles missing city or base safely
  const url3 = buildReminderUrl('', 'fajr');
  assert.equal(url3, 'reminder.html?prayer=fajr');

  // Includes prayer time parameter when provided
  const url4 = buildReminderUrl(base, 'maghrib', 'Jakarta', '18:05');
  assert.equal(url4, 'chrome-extension://dmnfclhpjfonamocklepmgcpldnohllf/reminder.html?prayer=maghrib&city=Jakarta&time=18%3A05');
});


