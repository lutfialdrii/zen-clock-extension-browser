# Changelog

All notable changes to the "Zen Clock: Pomodoro & Muslim Prayer Times" browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-09-26

### Fixed & Hardened
- Exact timestamp alarm scheduling for each daily prayer time (`ZEN_PRAYER_EXACT_${key}`) using `{ when: timestamp }`, waking the Service Worker at the exact second of adzan.
- Widened prayer safety net tolerance window from 90 seconds to 15 minutes (`PRAYER_ALERT_WINDOW_SECONDS = 900`) with strict duplicate suppression (`lastReminded`), eliminating alarm drops caused by Chrome alarm jitter, background throttling, or laptop lid sleep.
- Top-level alarm registration in Service Worker ensuring alarms are consistently active across browser reloads, profile switches, and worker wakeups.
- Safe fallback window creation (`chrome.windows.create`) when opening reminder tab if no browser windows are currently active.
- Added instant test trigger button ("Uji Notifikasi & Tab Pengingat") in Settings Modal to easily diagnose OS notification permissions and tab opening.
- Automatic prayer check dispatch (`CHECK_PRAYER_NOW`) upon opening popup window.
- Automatic routing to active Pomodoro tab on popup open and fullscreen Desk Clock mount when a session is running (`isRunning === true`).
- Animated pulsing active dot indicator (`.pomodoro-active-dot`) on Pomodoro navigation buttons across popup and fullscreen views.
- Fullscreen Desk Clock mode (`DeskClockPage.jsx`) now features dual view navigation (`FlipClock` & `PomodoroTimer`) with responsive clamp scaling and bidirectional background sync.
- Anti multi-start re-entrancy guard in Service Worker preventing accidental timer resets from concurrent popups or rapid clicks.
- Multi-view Single Source of Truth (SSOT) synchronization deriving remaining Pomodoro seconds directly from `targetEndTime`.
- Background Service Worker reactive storage listener ensuring instant recalculation when location or prayer offsets are changed.

### Added
- Comprehensive database of all 514 cities & regencies across 38 provinces in Indonesia (`src/utils/citiesData.js`) plus major international cities with official IANA timezone mappings (`Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`, etc.).
- Global worldwide location search via OpenStreetMap Nominatim API (`https://nominatim.openstreetmap.org/search`), allowing prayer time calculations for any destination or country worldwide.
- Instant automatic GPS geolocation detection (`navigator.geolocation`) with reverse geocoding fallback for true zero-setup location accuracy.
- Timezone-aware prayer time calculations (`formatTimeHHMM(date, timezone)` using `Intl.DateTimeFormat`), ensuring selected cities display their authentic local prayer times regardless of the host machine's system clock timezone.
- Upgraded City Picker Modal (`CityPickerModal.jsx` & `Modals.css`) with timezone badges (WIB, WITA, WIT), one-click GPS detection, clear button, and global search trigger.
- Automated distribution packaging script (`scripts/package-zip.js`) generating production-ready zip files in `releases/`.
- Integrated root popup view (`App.jsx`) with reactive `chrome.storage.onChanged` listener, theme color injection, and tab navigation.
- Dedicated peaceful prayer reminder page (`ReminderPage.jsx`) featuring Quranic calligraphy (QS. An-Nisa: 103), localized translations, and ready-to-pray dismissal.
- Fullscreen ambient desk clock page (`DeskClockPage.jsx`) with scalable 3D flip digits and native fullscreen browser API support.
- Dual-card Pomodoro timer component (`PomodoroTimer.jsx`) with work/break presets, start/pause/reset states, and service worker bidirectional sync.
- City picker search modal (`CityPickerModal.jsx`) supporting fast filtering across Indonesian and international cities.
- Minute offset fine-tuning modal (`AdjustModal.jsx`) for precision prayer adjustments.
- Settings modal (`SettingsModal.jsx`) with 6 preset accent themes + custom hex input, language switcher, Pomodoro duration controls, and parameterized automatic prayer reminder tab toggle (`autoOpenReminderTab`).
- Proportional 3D retro mechanical Flip Clock component (`FlipClock.jsx`, `FlipUnit.jsx`) optimized for compact 380px extension popup window.
- Interactive Prayer Time component (`PrayerTime.jsx`) featuring upcoming prayer badge, full 6-prayer schedule table popover, active prayer highlighting, and quick settings toggles.
- Manifest V3 background service worker with `chrome.alarms` lifecycle management and toolbar badge countdown (`chrome.action.setBadgeText`).
- Background Pomodoro engine supporting work & break sessions with persistent sleep-proof target end time calculations.
- Automatic prayer time checker loop with parameterized reminder page tab opening (`autoOpenReminderTab`) and desktop notifications (`chrome.notifications`).
- Typed reactive storage layer wrapping `chrome.storage.local` with sensible defaults and fallback support.
- Standard Kemenag RI calculation engine with +2m safety buffer (ihtiyat) for Fajr, Dhuhr, Asr, Maghrib, Isha, and -2m for Sunrise.
- Automatic Friday Dhuhr rename to "Jum'at" in both Indonesian and English.
- Complete bilingual i18n dictionary (Bahasa Indonesia & English).
- Preset list of 30+ popular cities across Indonesia and international locations.
- Comprehensive unit test suite covering prayer calculations, Friday renaming, and countdown formatters.
- Project scaffolding with Manifest V3, React 19, and Vite (@crxjs/vite-plugin).
