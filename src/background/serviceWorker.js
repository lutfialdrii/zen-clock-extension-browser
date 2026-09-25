/**
 * Zen Clock - Manifest V3 Background Service Worker
 * Manages Pomodoro Timer alarms, Kemenag RI prayer time checks, toolbar badges, and notifications.
 */

console.log('[Zen Clock Service Worker] Initialized.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Zen Clock Service Worker] Installed.');
  chrome.storage.local.get(['zen_settings'], (result) => {
    if (!result.zen_settings) {
      chrome.storage.local.set({
        zen_settings: {
          language: 'id',
          accentColor: '#fbbf24',
          autoOpenReminderTab: true,
        },
        zen_location: {
          name: 'Jakarta',
          lat: -6.2088,
          lng: 106.8456,
        },
        zen_adjustments: {
          fajr: 0,
          sunrise: 0,
          dhuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0,
        },
        zen_pomodoro: {
          isRunning: false,
          mode: 'work',
          timeLeft: 1500,
          targetEndTime: null,
        },
      });
    }
  });
});
