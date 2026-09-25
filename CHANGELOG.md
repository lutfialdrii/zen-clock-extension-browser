# Changelog

All notable changes to the "Zen Clock: Pomodoro & Muslim Prayer Times" browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-09-25

### Added
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
