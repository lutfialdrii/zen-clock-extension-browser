/**
 * Storage Helper for Zen Clock Browser Extension
 * Wraps chrome.storage.local with fallbacks, defaults, and multi-state consistency guards
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

export const STORAGE_KEYS = {
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
 * Pure Single Source of Truth (SSOT) helper to compute remaining seconds
 */
export function calculateRemainingPomodoroSeconds(state) {
  if (!state) return DEFAULT_POMODORO.timeLeft;
  if (state.isRunning && state.targetEndTime) {
    return Math.max(0, Math.round((state.targetEndTime - Date.now()) / 1000));
  }
  return typeof state.timeLeft === 'number' ? state.timeLeft : DEFAULT_POMODORO.timeLeft;
}

/**
 * Checks if a Pomodoro session is actively running and not expired
 */
export function isPomodoroActive(state) {
  if (!state || !state.isRunning) return false;
  if (state.targetEndTime && state.targetEndTime <= Date.now()) return false;
  return true;
}


/**
 * Gets settings merged with defaults and legacy migration support
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
    chrome.storage.local.get([STORAGE_KEYS.SETTINGS, 'zen_location', 'zen_adjustments'], (result) => {
      if (chrome.runtime?.lastError) {
        console.error('Storage getSettings error:', chrome.runtime.lastError);
        resolve({ ...DEFAULT_SETTINGS });
        return;
      }

      const base = result[STORAGE_KEYS.SETTINGS] || {};

      // Migrate legacy separate keys if present
      if (!base.city && result.zen_location) {
        base.city = result.zen_location;
      }
      if (!base.adjustments && result.zen_adjustments) {
        base.adjustments = result.zen_adjustments;
      }

      const merged = {
        ...DEFAULT_SETTINGS,
        ...base,
        city: { ...DEFAULT_SETTINGS.city, ...(base.city || {}) },
        adjustments: { ...DEFAULT_SETTINGS.adjustments, ...(base.adjustments || {}) },
      };

      resolve(merged);
    });
  });
}

/**
 * Updates partial settings
 */
export async function saveSettings(partial) {
  const current = await getSettings();
  const updated = {
    ...current,
    ...partial,
    city: partial.city ? { ...current.city, ...partial.city } : current.city,
    adjustments: partial.adjustments ? { ...current.adjustments, ...partial.adjustments } : current.adjustments,
  };

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
 * Gets Pomodoro state merged with defaults and SSOT remaining time calculation
 */
export async function getPomodoroState() {
  if (!isChromeStorageAvailable()) {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.POMODORO);
      const parsed = local ? { ...DEFAULT_POMODORO, ...JSON.parse(local) } : { ...DEFAULT_POMODORO };
      parsed.timeLeft = calculateRemainingPomodoroSeconds(parsed);
      return parsed;
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

      const raw = result[STORAGE_KEYS.POMODORO] || {};
      const pomodoro = { ...DEFAULT_POMODORO, ...raw };

      // SSOT computation
      if (pomodoro.isRunning && pomodoro.targetEndTime) {
        const remaining = Math.max(0, Math.round((pomodoro.targetEndTime - Date.now()) / 1000));
        pomodoro.timeLeft = remaining;
        if (remaining <= 0) {
          pomodoro.isRunning = false;
          pomodoro.targetEndTime = null;
        }
      }

      resolve(pomodoro);
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
