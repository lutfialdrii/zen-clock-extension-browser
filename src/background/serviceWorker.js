/**
 * Zen Clock - Manifest V3 Background Service Worker
 * Manages Pomodoro Timer alarms, Kemenag RI prayer time checks, toolbar badges, and desktop notifications.
 */

import { calculatePrayerTimes, getPrayerName } from '../utils/prayerHelper.js';
import {
  getSettings,
  saveSettings,
  getPomodoroState,
  savePomodoroState,
  getLastRemindedPrayer,
  setLastRemindedPrayer,
  DEFAULT_SETTINGS,
  DEFAULT_POMODORO,
} from '../utils/storage.js';
import { getTranslations } from '../utils/i18n.js';

const ALARMS = {
  PRAYER_CHECK: 'ZEN_PRAYER_CHECK',
  POMODORO_FINISH: 'ZEN_POMODORO_FINISH',
  POMODORO_TICK: 'ZEN_POMODORO_TICK',
};

let pomodoroIntervalId = null;

/**
 * Initializes alarms and default state on install or startup
 */
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Zen Clock Service Worker] Installed.');
  await ensureDefaults();
  setupAlarms();
  await checkPrayerTimes();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[Zen Clock Service Worker] Browser startup.');
  setupAlarms();
  await resumePomodoroIfRunning();
  await checkPrayerTimes();
});

async function ensureDefaults() {
  const settings = await getSettings();
  const pomodoro = await getPomodoroState();
  await saveSettings(settings);
  await savePomodoroState(pomodoro);
}

function setupAlarms() {
  chrome.alarms.create(ALARMS.PRAYER_CHECK, { periodInMinutes: 1 });
}

/**
 * Handle alarm triggers
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARMS.PRAYER_CHECK) {
    await checkPrayerTimes();
  } else if (alarm.name === ALARMS.POMODORO_FINISH) {
    await handlePomodoroFinished();
  } else if (alarm.name === ALARMS.POMODORO_TICK) {
    await handlePomodoroTickAlarm();
  }
});

/**
 * Handles periodic minute alarm for Pomodoro when background worker sleeps
 */
async function handlePomodoroTickAlarm() {
  const state = await getPomodoroState();
  if (!state.isRunning || !state.targetEndTime) {
    chrome.alarms.clear(ALARMS.POMODORO_TICK);
    return;
  }

  const remainingSecs = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
  if (remainingSecs <= 0) {
    await handlePomodoroFinished();
  } else {
    const settings = await getSettings();
    const badgeColor = state.mode === 'break' ? '#10b981' : (settings.accentColor || '#fbbf24');
    updateToolbarBadge(formatBadgeTime(remainingSecs), badgeColor);

    if (!pomodoroIntervalId) {
      startTickLoop(state.targetEndTime);
    }
  }
}

/**
 * Checks prayer times against current time (accurate to 1-minute window)
 */
async function checkPrayerTimes() {
  try {
    const settings = await getSettings();
    if (!settings.notifyPrayer && !settings.autoOpenReminderTab) {
      return;
    }

    const city = settings.city || DEFAULT_SETTINGS.city;
    const adjustments = settings.adjustments || DEFAULT_SETTINGS.adjustments;
    const lang = settings.language || 'id';

    const now = new Date();
    const result = calculatePrayerTimes(city, now, adjustments, lang);
    if (!result || !result.allPrayers) return;

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lastReminded = await getLastRemindedPrayer();

    for (const prayer of result.allPrayers) {
      // We only alert for 5 fardh prayers (skip sunrise)
      if (prayer.key === 'sunrise') continue;

      const prayerDate = prayer.date;
      if (!prayerDate) continue;

      // Difference in seconds
      const diffSecs = Math.floor((now.getTime() - prayerDate.getTime()) / 1000);

      // Check if we are within a 90s window after adzan starts
      if (diffSecs >= 0 && diffSecs <= 90) {
        const reminderId = `${prayer.key}-${todayStr}`;
        if (lastReminded !== reminderId) {
          await setLastRemindedPrayer(reminderId);
          await triggerPrayerAlert(prayer.key, prayerDate, settings);
          break;
        }
      }
    }
  } catch (error) {
    console.error('[Zen Clock] Error checking prayer times:', error);
  }
}

/**
 * Triggers prayer alerts: opens reminder tab (if configured) and OS notification
 */
async function triggerPrayerAlert(prayerKey, prayerDate, settings) {
  const lang = settings.language || 'id';
  const t = getTranslations(lang);
  const prayerName = getPrayerName(prayerKey, lang, prayerDate);
  const cityName = settings.city?.name || 'Jakarta';

  // 1. Parameterized: Auto open reminder.html tab (default: true)
  if (settings.autoOpenReminderTab !== false) {
    const reminderUrl = chrome.runtime.getURL(`reminder.html?prayer=${prayerKey}&city=${encodeURIComponent(cityName)}`);
    chrome.tabs.create({ url: reminderUrl, active: true });
  }

  // 2. Desktop notification
  if (settings.notifyPrayer !== false) {
    const title = t.notifications.prayerArrived.replace('{name}', prayerName);
    const message = lang === 'en'
      ? `Time for ${prayerName} has arrived in ${cityName}.`
      : `Waktu sholat ${prayerName} untuk wilayah ${cityName} dan sekitarnya telah tiba.`;

    chrome.notifications.create(`zen_prayer_${prayerKey}_${Date.now()}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('public/icons/icon-128.png'),
      title,
      message,
      priority: 2,
      requireInteraction: true,
      buttons: [
        { title: t.notifications.openReminder || 'Buka Pengingat' },
      ],
    });
  }
}

/**
 * Toolbar badge updating
 */
function updateToolbarBadge(text, color = '#fbbf24') {
  if (!chrome.action) return;
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
}

function clearToolbarBadge() {
  if (!chrome.action) return;
  chrome.action.setBadgeText({ text: '' });
}

/**
 * Formats badge text to 4 characters or fewer (e.g. "25m", "4:30", "0:45")
 */
function formatBadgeTime(seconds) {
  if (seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 10) return `${mins}m`;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Resumes Pomodoro if browser restarted while timer was running
 */
async function resumePomodoroIfRunning() {
  const state = await getPomodoroState();
  if (state.isRunning && state.targetEndTime) {
    const remainingMs = state.targetEndTime - Date.now();
    const remainingSecs = Math.max(0, Math.round(remainingMs / 1000));
    if (remainingSecs <= 0) {
      await handlePomodoroFinished();
    } else {
      await savePomodoroState({ timeLeft: remainingSecs });
      startTickLoop(state.targetEndTime);
      chrome.alarms.create(ALARMS.POMODORO_FINISH, { when: state.targetEndTime });
      chrome.alarms.create(ALARMS.POMODORO_TICK, { periodInMinutes: 1 });
    }
  }
}

/**
 * Starts 1-second interval loop while active
 */
function startTickLoop(targetEndTime) {
  if (pomodoroIntervalId) clearInterval(pomodoroIntervalId);

  pomodoroIntervalId = setInterval(async () => {
    const remainingMs = targetEndTime - Date.now();
    const remainingSecs = Math.max(0, Math.round(remainingMs / 1000));

    if (remainingSecs <= 0) {
      clearInterval(pomodoroIntervalId);
      pomodoroIntervalId = null;
      await handlePomodoroFinished();
    } else {
      const state = await getPomodoroState();
      const settings = await getSettings();
      const badgeColor = state.mode === 'break' ? '#10b981' : (settings.accentColor || '#fbbf24');
      updateToolbarBadge(formatBadgeTime(remainingSecs), badgeColor);

      // Write to storage every 5 seconds to reduce I/O churn
      if (remainingSecs % 5 === 0) {
        await savePomodoroState({ timeLeft: remainingSecs });
      }
    }
  }, 1000);
}

function stopTickLoop() {
  if (pomodoroIntervalId) {
    clearInterval(pomodoroIntervalId);
    pomodoroIntervalId = null;
  }
  chrome.alarms.clear(ALARMS.POMODORO_FINISH);
  chrome.alarms.clear(ALARMS.POMODORO_TICK);
}

/**
 * Handles Pomodoro session completion
 */
async function handlePomodoroFinished() {
  stopTickLoop();

  const state = await getPomodoroState();
  const settings = await getSettings();
  const lang = settings.language || 'id';
  const t = getTranslations(lang);

  const wasWork = state.mode === 'work';
  const nextMode = wasWork ? 'break' : 'work';
  const nextDuration = (nextMode === 'work' ? (settings.workDuration || 25) : (settings.breakDuration || 5)) * 60;

  await savePomodoroState({
    isRunning: false,
    mode: nextMode,
    timeLeft: nextDuration,
    totalDuration: nextDuration,
    targetEndTime: null,
  });

  clearToolbarBadge();

  if (settings.notifyPomodoro !== false) {
    const title = wasWork ? t.notifications.pomodoroFinished : t.notifications.breakFinished;
    const message = wasWork ? t.notifications.breakPrompt : t.notifications.workPrompt;

    chrome.notifications.create(`zen_pomo_${Date.now()}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('public/icons/icon-128.png'),
      title,
      message,
      priority: 2,
      requireInteraction: true,
    });
  }
}

/**
 * Handles user interaction on notifications
 */
chrome.notifications.onButtonClicked.addListener((notificationId) => {
  if (notificationId.startsWith('zen_prayer_')) {
    chrome.tabs.create({ url: chrome.runtime.getURL('reminder.html') });
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('zen_prayer_')) {
    chrome.tabs.create({ url: chrome.runtime.getURL('reminder.html') });
  }
});

/**
 * Reactive listener: when storage changes (city, adjustments, theme), instantly recalculate
 */
if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === 'local') {
      if (changes.zen_settings) {
        console.log('[Zen Clock Service Worker] Settings updated via storage event, rechecking prayer times.');
        await checkPrayerTimes();

        const newSettings = changes.zen_settings.newValue;
        const pState = await getPomodoroState();
        if (pState.isRunning) {
          const badgeColor = pState.mode === 'break' ? '#10b981' : (newSettings?.accentColor || '#fbbf24');
          updateToolbarBadge(formatBadgeTime(pState.timeLeft), badgeColor);
        }
      }
    }
  });
}

/**
 * Handles messages from Popup UI, Desk Clock, and Reminder pages
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    switch (request.type) {
      case 'START_POMODORO': {
        const state = await getPomodoroState();

        // ANTI-MULTI-START RE-ENTRANCY GUARD:
        // If timer is already running with a future targetEndTime, do not overwrite or reset!
        if (state.isRunning && state.targetEndTime && state.targetEndTime > Date.now()) {
          console.log('[Zen Clock Service Worker] Pomodoro already running, ignoring duplicate start.');
          sendResponse({
            success: true,
            targetEndTime: state.targetEndTime,
            alreadyRunning: true,
          });
          break;
        }

        const settings = await getSettings();
        const timeLeft = request.timeLeft || state.timeLeft;
        const targetEndTime = Date.now() + timeLeft * 1000;

        await savePomodoroState({
          isRunning: true,
          timeLeft,
          targetEndTime,
          mode: request.mode || state.mode,
        });

        chrome.alarms.create(ALARMS.POMODORO_FINISH, { when: targetEndTime });
        chrome.alarms.create(ALARMS.POMODORO_TICK, { periodInMinutes: 1 });
        startTickLoop(targetEndTime);

        const badgeColor = state.mode === 'break' ? '#10b981' : (settings.accentColor || '#fbbf24');
        updateToolbarBadge(formatBadgeTime(timeLeft), badgeColor);
        sendResponse({ success: true, targetEndTime });
        break;
      }

      case 'PAUSE_POMODORO': {
        const state = await getPomodoroState();
        stopTickLoop();

        let timeLeft = state.timeLeft;
        if (state.targetEndTime) {
          timeLeft = Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
        }

        await savePomodoroState({
          isRunning: false,
          timeLeft,
          targetEndTime: null,
        });

        updateToolbarBadge('PAUS', '#64748b');
        sendResponse({ success: true, timeLeft });
        break;
      }

      case 'RESET_POMODORO': {
        const settings = await getSettings();
        stopTickLoop();

        const mode = request.mode || 'work';
        const duration = (mode === 'work' ? (settings.workDuration || 25) : (settings.breakDuration || 5)) * 60;

        await savePomodoroState({
          isRunning: false,
          mode,
          timeLeft: duration,
          totalDuration: duration,
          targetEndTime: null,
        });

        clearToolbarBadge();
        sendResponse({ success: true, timeLeft: duration });
        break;
      }

      case 'SWITCH_POMODORO_MODE': {
        const settings = await getSettings();
        stopTickLoop();

        const mode = request.mode === 'break' ? 'break' : 'work';
        const duration = (mode === 'work' ? (settings.workDuration || 25) : (settings.breakDuration || 5)) * 60;

        await savePomodoroState({
          isRunning: false,
          mode,
          timeLeft: duration,
          totalDuration: duration,
          targetEndTime: null,
        });

        clearToolbarBadge();
        sendResponse({ success: true, mode, timeLeft: duration });
        break;
      }

      case 'GET_STATUS': {
        const settings = await getSettings();
        const pomodoro = await getPomodoroState();
        sendResponse({ settings, pomodoro });
        break;
      }

      case 'CHECK_PRAYER_NOW': {
        await checkPrayerTimes();
        sendResponse({ success: true });
        break;
      }

      default:
        sendResponse({ error: 'Unknown action' });
    }
  })();

  return true; // Keep message channel open for async response
});
