/**
 * Storage Helper for Zen Clock Browser Extension
 * Wraps chrome.storage.local with fallbacks and defaults
 */

export const DEFAULT_SETTINGS = {
  language: 'id',
  accentColor: '#fbbf24', // Warm Amber (Classic Zen Clock default)
  themeMode: 'dark',
  autoOpenReminderTab: true, // Parameterized: auto opens reminder.html on prayer time
  notifyPrayer: true,
  notifyPomodoro: true,
  workDuration: 25, // minutes
  breakDuration: 5,  // minutes
  city: {
    name: 'Jakarta',
    region: 'DKI Jakarta',
    lat: -6.2088,
    lng: 106.8456,
  },
  adjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
};

export const DEFAULT_POMODORO = {
  isRunning: false,
  mode: 'work', // 'work' | 'break'
  timeLeft: 25 * 60,
  totalDuration: 25 * 60,
  targetEndTime: null,
};

const STORAGE_KEYS = {
  SETTINGS: 'zen_settings',
  POMODORO: 'zen_pomodoro',
  LAST_REMINDED: 'zen_last_reminded_prayer',
};

/**
 * Checks if chrome.storage is available (browser extension runtime)
 */
function isChromeStorageAvailable() {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
}

/**
 * Gets settings merged with defaults
 */
export async function getSettings() {
  if (!isChromeStorageAvailable()) {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return local ? { ...DEFAULT_SETTINGS, ...JSON.parse(local) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
      if (chrome.runtime?.lastError) {
        console.error('Storage getSettings error:', chrome.runtime.lastError);
        resolve({ ...DEFAULT_SETTINGS });
        return;
      }
      resolve({ ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] || {}) });
    });
  });
}

/**
 * Updates partial settings
 */
export async function saveSettings(partial) {
  const current = await getSettings();
  const updated = { ...current, ...partial };

  if (!isChromeStorageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Local storage error:', e);
    }
    return updated;
  }

  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated }, () => {
      resolve(updated);
    });
  });
}

/**
 * Gets Pomodoro state merged with defaults
 */
export async function getPomodoroState() {
  if (!isChromeStorageAvailable()) {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.POMODORO);
      return local ? { ...DEFAULT_POMODORO, ...JSON.parse(local) } : { ...DEFAULT_POMODORO };
    } catch {
      return { ...DEFAULT_POMODORO };
    }
  }

  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.POMODORO], (result) => {
      if (chrome.runtime?.lastError) {
        console.error('Storage getPomodoroState error:', chrome.runtime.lastError);
        resolve({ ...DEFAULT_POMODORO });
        return;
      }
      resolve({ ...DEFAULT_POMODORO, ...(result[STORAGE_KEYS.POMODORO] || {}) });
    });
  });
}

/**
 * Updates partial Pomodoro state
 */
export async function savePomodoroState(partial) {
  const current = await getPomodoroState();
  const updated = { ...current, ...partial };

  if (!isChromeStorageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify(updated));
    } catch (e) {
      console.error('Local storage error:', e);
    }
    return updated;
  }

  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.POMODORO]: updated }, () => {
      resolve(updated);
    });
  });
}

/**
 * Gets last reminded prayer ID to avoid repeated triggers
 */
export async function getLastRemindedPrayer() {
  if (!isChromeStorageAvailable()) {
    return localStorage.getItem(STORAGE_KEYS.LAST_REMINDED) || '';
  }

  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.LAST_REMINDED], (result) => {
      resolve(result[STORAGE_KEYS.LAST_REMINDED] || '');
    });
  });
}

/**
 * Sets last reminded prayer ID
 */
export async function setLastRemindedPrayer(id) {
  if (!isChromeStorageAvailable()) {
    localStorage.setItem(STORAGE_KEYS.LAST_REMINDED, id);
    return;
  }

  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.LAST_REMINDED]: id }, () => {
      resolve();
    });
  });
}
