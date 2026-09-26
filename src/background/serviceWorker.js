/**
 * Zen Clock - Manifest V3 Background Service Worker
 * Manages Pomodoro Timer alarms, Kemenag RI prayer time checks, toolbar badges, and desktop notifications.
 */

import {
  calculatePrayerTimes,
  getPrayerName,
  shouldTriggerPrayerAlert,
  getUpcomingPrayerAlarms,
  buildReminderUrl,
  PRAYER_ALERT_WINDOW_SECONDS,
} from '../utils/prayerHelper.js';
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
  PRAYER_DAILY_ROLLOVER: 'ZEN_PRAYER_DAILY_ROLLOVER',
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
  await schedulePrayerAlarms();
  await checkPrayerTimes();
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('[Zen Clock Service Worker] Browser startup.');
  setupAlarms();
  await schedulePrayerAlarms();
  await resumePomodoroIfRunning();
  await checkPrayerTimes();
});

// Ensure alarms are initialized whenever service worker starts
setupAlarms();
schedulePrayerAlarms();

async function ensureDefaults() {
  const settings = await getSettings();
  const pomodoro = await getPomodoroState();
  await saveSettings(settings);
  await savePomodoroState(pomodoro);
}

async function setupAlarms() {
  const existing = await chrome.alarms.get(ALARMS.PRAYER_CHECK);
  if (!existing) {
    chrome.alarms.create(ALARMS.PRAYER_CHECK, { periodInMinutes: 1 });
  }
}

/**
 * Schedules exact timestamp alarms for each upcoming prayer time today
 */
async function schedulePrayerAlarms() {
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

    // 1. Get upcoming prayer alarms for today
    const upcoming = getUpcomingPrayerAlarms(result.allPrayers, now);

    // 2. Clear previous exact prayer alarms to avoid ghost alarms
    const allAlarms = await chrome.alarms.getAll();
    for (const a of allAlarms) {
      if (a.name.startsWith('ZEN_PRAYER_EXACT_')) {
        await chrome.alarms.clear(a.name);
      }
    }

    // 3. Register exact alarm for each upcoming prayer
    for (const item of upcoming) {
      chrome.alarms.create(item.alarmName, { when: item.timestamp });
    }

    // 4. Register midnight rollover alarm (00:01 AM tomorrow) to schedule next day's prayers
    const tomorrowMidnight = new Date(now);
    tomorrowMidnight.setDate(tomorrowMidnight.getDate() + 1);
    tomorrowMidnight.setHours(0, 1, 0, 0);
    chrome.alarms.create(ALARMS.PRAYER_DAILY_ROLLOVER, { when: tomorrowMidnight.getTime() });
  } catch (err) {
    console.error('[Zen Clock] Failed to schedule prayer alarms:', err);
  }
}

/**
 * Handle alarm triggers
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARMS.PRAYER_CHECK) {
    await checkPrayerTimes();
  } else if (alarm.name.startsWith('ZEN_PRAYER_EXACT_')) {
    const prayerKey = alarm.name.replace('ZEN_PRAYER_EXACT_', '');
    await handleExactPrayerAlarm(prayerKey);
  } else if (alarm.name === ALARMS.PRAYER_DAILY_ROLLOVER) {
    await schedulePrayerAlarms();
  } else if (alarm.name === ALARMS.POMODORO_FINISH) {
    await handlePomodoroFinished();
  } else if (alarm.name === ALARMS.POMODORO_TICK) {
    await handlePomodoroTickAlarm();
  }
});

/**
 * Handles exact timestamp alarm for a specific prayer
 */
async function handleExactPrayerAlarm(prayerKey) {
  try {
    const settings = await getSettings();
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const reminderId = `${prayerKey}-${todayStr}`;
    const lastReminded = await getLastRemindedPrayer();

    if (lastReminded !== reminderId) {
      await setLastRemindedPrayer(reminderId);
      await triggerPrayerAlert(prayerKey, now, settings);
    }
  } catch (err) {
    console.error('[Zen Clock] Error handling exact prayer alarm:', err);
  }
}

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
 * Checks prayer times against current time (safety net for missed alarms or computer waking up)
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

      const reminderId = `${prayer.key}-${todayStr}`;
      // Use 15-minute window tolerance to catch delayed wakeups while avoiding duplicates
      if (shouldTriggerPrayerAlert(now, prayerDate, lastReminded, reminderId)) {
        await setLastRemindedPrayer(reminderId);
        await triggerPrayerAlert(prayer.key, prayerDate, settings);
        break;
      }
    }
  } catch (error) {
    console.error('[Zen Clock] Error checking prayer times:', error);
  }
}

/**
 * Triggers prayer alerts: opens reminder tab (if configured) and OS notification
 */
async function triggerPrayerAlert(prayerKey, prayerDate, settings, isTest = false) {
  const lang = settings.language || 'id';
  const t = getTranslations(lang);
  const prayerName = getPrayerName(prayerKey, lang, prayerDate);
  const cityName = settings.city?.name || 'Jakarta';

  // 1. Parameterized: Auto open reminder.html tab (default: true)
  if (settings.autoOpenReminderTab !== false || isTest) {
    const baseReminderUrl = chrome.runtime.getURL('reminder.html');
    const reminderUrl = buildReminderUrl(baseReminderUrl, prayerKey, cityName);
    try {
      chrome.tabs.create({ url: reminderUrl, active: true }, (tab) => {
        if (chrome.runtime.lastError) {
          console.warn('[Zen Clock] tabs.create fallback to windows.create:', chrome.runtime.lastError);
          chrome.windows.create({ url: reminderUrl, focused: true });
        }
      });
    } catch (err) {
      console.warn('[Zen Clock] Tab opening error:', err);
    }
  }

  // 2. Desktop notification
  if (settings.notifyPrayer !== false || isTest) {
    const prefix = isTest ? '[TEST] ' : '';
    const title = prefix + t.notifications.prayerArrived.replace('{name}', prayerName);
    const message = lang === 'en'
      ? `Time for ${prayerName} has arrived in ${cityName}.`
      : `Waktu sholat ${prayerName} untuk wilayah ${cityName} dan sekitarnya telah tiba.`;

    try {
      chrome.notifications.create(`zen_prayer_${prayerKey}_${Date.now()}`, {
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title,
        message,
        priority: 2,
        requireInteraction: true,
        buttons: [
          { title: t.notifications.openReminder || 'Buka Pengingat' },
        ],
      }, (id) => {
        if (chrome.runtime.lastError) {
          console.warn('[Zen Clock] notifications.create error (check OS notification permissions):', chrome.runtime.lastError);
        }
      });
    } catch (err) {
      console.warn('[Zen Clock] Notification creation error:', err);
    }
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
      iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
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
    const parts = notificationId.split('_');
    const prayerKey = parts[2] || 'dhuhr';
    const reminderUrl = buildReminderUrl(chrome.runtime.getURL('reminder.html'), prayerKey);
    chrome.tabs.create({ url: reminderUrl });
  }
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId.startsWith('zen_prayer_')) {
    const parts = notificationId.split('_');
    const prayerKey = parts[2] || 'dhuhr';
    const reminderUrl = buildReminderUrl(chrome.runtime.getURL('reminder.html'), prayerKey);
    chrome.tabs.create({ url: reminderUrl });
  }
});

/**
 * Reactive listener: when storage changes (city, adjustments, theme), instantly recalculate
 */
if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area === 'local') {
      if (changes.zen_settings) {
        console.log('[Zen Clock Service Worker] Settings updated via storage event, rescheduling alarms & rechecking.');
        await schedulePrayerAlarms();
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

      case 'TEST_PRAYER_ALERT': {
        const settings = await getSettings();
        await triggerPrayerAlert(request.prayerKey || 'dhuhr', new Date(), settings, true);
        sendResponse({ success: true });
        break;
      }

      default:
        sendResponse({ error: 'Unknown action' });
    }
  })();

  return true; // Keep message channel open for async response
});
