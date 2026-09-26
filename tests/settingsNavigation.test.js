import test from 'node:test';
import assert from 'node:assert/strict';
import { getTranslations } from '../src/utils/i18n.js';
import { DEFAULT_SETTINGS } from '../src/utils/storage.js';

test('i18n - Contains translations for settings city and prayer adjust actions', () => {
  const id = getTranslations('id');
  assert.equal(id.ui.locationAndPrayer, 'Lokasi & Jadwal Sholat');
  assert.equal(id.ui.adjustPrayerTimes, 'Sesuaikan Jam Sholat');
  assert.ok(id.ui.adjustPrayerTimesDesc);
  assert.equal(id.ui.change, 'Ubah');
  assert.equal(id.ui.adjust, 'Atur');

  const en = getTranslations('en');
  assert.equal(en.ui.locationAndPrayer, 'Location & Prayer Schedule');
  assert.equal(en.ui.adjustPrayerTimes, 'Adjust Prayer Times');
  assert.ok(en.ui.adjustPrayerTimesDesc);
  assert.equal(en.ui.change, 'Change');
  assert.equal(en.ui.adjust, 'Adjust');
});

test('Settings Modal - City and adjustment contracts from DEFAULT_SETTINGS', () => {
  assert.ok(DEFAULT_SETTINGS.city, 'Settings must supply city to settings panel');
  assert.equal(typeof DEFAULT_SETTINGS.city.name, 'string');
  assert.ok(DEFAULT_SETTINGS.adjustments, 'Settings must supply adjustments object');
});
