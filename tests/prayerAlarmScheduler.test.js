import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldTriggerPrayerAlert,
  getUpcomingPrayerAlarms,
  PRAYER_ALERT_WINDOW_SECONDS,
} from '../src/utils/prayerHelper.js';

test('shouldTriggerPrayerAlert - Fires when within 15-minute window and not yet reminded', () => {
  const prayerTime = new Date('2026-09-26T12:00:00Z');
  // 3 minutes after prayer time
  const now = new Date('2026-09-26T12:03:00Z');
  const reminderId = 'dhuhr-2026-09-26';
  const lastRemindedId = 'fajr-2026-09-26';

  const shouldTrigger = shouldTriggerPrayerAlert(now, prayerTime, lastRemindedId, reminderId);
  assert.equal(shouldTrigger, true, 'Should trigger when within window');
});

test('shouldTriggerPrayerAlert - Does NOT fire if already reminded for this prayer today', () => {
  const prayerTime = new Date('2026-09-26T12:00:00Z');
  const now = new Date('2026-09-26T12:02:00Z');
  const reminderId = 'dhuhr-2026-09-26';
  const lastRemindedId = 'dhuhr-2026-09-26'; // Already reminded!

  const shouldTrigger = shouldTriggerPrayerAlert(now, prayerTime, lastRemindedId, reminderId);
  assert.equal(shouldTrigger, false, 'Should NOT trigger again if already reminded');
});

test('shouldTriggerPrayerAlert - Does NOT fire if prayer time is in the future', () => {
  const prayerTime = new Date('2026-09-26T12:00:00Z');
  // 1 minute before prayer time
  const now = new Date('2026-09-26T11:59:00Z');
  const reminderId = 'dhuhr-2026-09-26';
  const lastRemindedId = '';

  const shouldTrigger = shouldTriggerPrayerAlert(now, prayerTime, lastRemindedId, reminderId);
  assert.equal(shouldTrigger, false, 'Should NOT trigger before prayer time');
});

test('shouldTriggerPrayerAlert - Does NOT fire if prayer time is older than 15-minute window', () => {
  const prayerTime = new Date('2026-09-26T12:00:00Z');
  // 16 minutes after prayer time
  const now = new Date('2026-09-26T12:16:00Z');
  const reminderId = 'dhuhr-2026-09-26';
  const lastRemindedId = '';

  const shouldTrigger = shouldTriggerPrayerAlert(now, prayerTime, lastRemindedId, reminderId);
  assert.equal(shouldTrigger, false, 'Should NOT trigger beyond 15-minute tolerance window');
});

test('getUpcomingPrayerAlarms - Filters out sunrise and past prayers, returns upcoming fardh prayers', () => {
  const baseDate = new Date('2026-09-26T10:00:00Z');

  const allPrayers = [
    { key: 'fajr', name: 'Subuh', date: new Date('2026-09-26T04:26:00Z') }, // Past
    { key: 'sunrise', name: 'Terbit', date: new Date('2026-09-26T05:39:00Z') }, // Sunrise (skip)
    { key: 'dhuhr', name: 'Dzuhur', date: new Date('2026-09-26T11:47:00Z') }, // Future
    { key: 'asr', name: 'Ashar', date: new Date('2026-09-26T14:56:00Z') }, // Future
    { key: 'maghrib', name: 'Maghrib', date: new Date('2026-09-26T17:50:00Z') }, // Future
    { key: 'isha', name: 'Isya', date: new Date('2026-09-26T19:00:00Z') }, // Future
  ];

  const upcoming = getUpcomingPrayerAlarms(allPrayers, baseDate);
  assert.equal(upcoming.length, 4, 'Should have 4 upcoming prayers (dhuhr, asr, maghrib, isha)');
  assert.equal(upcoming[0].key, 'dhuhr');
  assert.equal(upcoming[0].alarmName, 'ZEN_PRAYER_EXACT_dhuhr');
  assert.equal(upcoming[0].timestamp, new Date('2026-09-26T11:47:00Z').getTime());
});
