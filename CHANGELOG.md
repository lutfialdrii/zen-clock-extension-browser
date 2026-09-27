# Changelog

All notable changes to the "Zen Clock: Pomodoro & Muslim Prayer Times" browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-27

> First major official production release of **Zen Clock: Pomodoro & Muslim Prayer Times** for Google Chrome and Microsoft Edge.

### 🌟 Key Highlights & Features
- **3D Retro Mechanical Flip Clock**: Minimalist, distraction-free flip clock with smooth CSS 3D folding animations and localized date display.
- **Dedicated Fullscreen Desk Clock Mode (`clock.html`)**: Ambient aesthetic clock display featuring dual view navigation (`FlipClock` & `PomodoroTimer`) with responsive clamp scaling.
- **Persistent Background Pomodoro Engine**: Directly powered by Manifest V3 Background Service Worker and `chrome.alarms`, ensuring timers keep ticking accurately even when the popup is closed or the browser sleeps.
- **Live Extension Toolbar Badge**: Real-time minute countdown with status-based theme coloring (`Amber` for focus work, `Emerald` for break).
- **Single Source of Truth (SSOT) Architecture**: Pomodoro remaining seconds derived purely from `targetEndTime`, preventing UI desynchronization across views.
- **Automated Muslim Prayer Times (Kemenag RI Standard)**:
  - Accurate astronomical calculation via `adhan` library following official Indonesian Ministry of Religious Affairs standards (Fajr 20°, Isha 18°, Shafi'i Madhab, rounding up).
  - Safety buffer *ihtiyat* +2 minutes applied across all fardh prayer times (-2 minutes for Sunrise).
  - Friday Dhuhr is automatically displayed as **"Jum'at"** in both Indonesian and English.
- **Comprehensive Catalog of 514 Indonesian Cities (38 Provinces)**: Full offline coverage across all 514 cities & regencies in Indonesia with official IANA timezones (WIB, WITA, WIT) plus major international cities.
- **Worldwide Location Search & Instant Browser GPS**: Global search powered by OpenStreetMap Nominatim API and one-click zero-setup browser GPS detection with reverse geocoding fallback.
- **Timezone-Aware Calculations**: Prayer schedules strictly reflect the selected city's local timezone (`Intl.DateTimeFormat`) regardless of the host machine's system clock.
- **Live Prayer Adjustment Preview**: Fine-tune minute offsets (-15m to +15m) in the Adjust Modal with dynamic live time preview and 1-click Kemenag reset.
- **Dedicated Peaceful Prayer Reminder Tab (`reminder.html`)**: Serene dark obsidian reminder tab featuring Quranic calligraphy (*QS. An-Nisa: 103*), parameterized automatic tab opening (`autoOpenReminderTab`), and ready-to-pray dismissal.
- **6 Aesthetic Color Themes & Custom HEX**: Preset palettes (*Warm Amber*, *Islamic Emerald*, *Modern Sky Cyan*, *Pomodoro Rose*, *Mystic Purple*, *Monochrome Silver*) and custom HEX color picker with automatic contrast detection.
- **Full Bilingual Support (i18n)**: Seamless language switching between Bahasa Indonesia and English.
- **Support the Creator Widget**: Integrated voluntary Saweria donations (GoPay, OVO, Dana, QRIS) and GitHub star callouts in the Settings Panel.
- **100% Offline-First & Privacy Pledge (`PRIVACY.md`)**: Zero data collection, zero analytics, zero ads, zero trackers, and only 3 minimal standard permissions (`storage`, `alarms`, `notifications`) with zero host permissions.

### 🛡️ Hardening, Performance & Compliance
- **Reminder Tab Navigation Fix (`ERR_FILE_NOT_FOUND`)**: Isolated physical file path from query strings via `buildReminderUrl` and added dual `searchParams` / `hashParams` parsing in `ReminderPage.jsx`.
- **Chrome Web Store Compliance**: Shortened manifest description to 130 characters, strictly below the 132-character dashboard limit.
- **Asset Normalization & Bundle Diet**: Normalized icon paths to `icons/`, eliminating duplicate asset bundles and reducing the release package to 127.19 KB.
- **Memory Leak Elimination**: Captured and cleared interval timers during `FlipClock.jsx` unmount lifecycle.
- **Storage Default Timezone**: Added fallback `timezone: 'Asia/Jakarta'` to `DEFAULT_SETTINGS.city` to prevent race conditions during fresh installations.
- **Reliable Background Alarm Scheduling**: Exact timestamp alarms (`when: timestamp`) with 15-minute tolerance safety net and daily deduplication (`lastReminded`).
- **Automated Distribution Packaging**: Automated packager script generating production zip at `releases/extension-browser-zen-clock-1.0.0.zip`.

## [0.0.1] - 2026-09-26

### Fixed & Hardened
- Fixed reminder tab opening failure (`ERR_FILE_NOT_FOUND`) by isolating the physical file path in `chrome.runtime.getURL('reminder.html')` and appending query parameters via helper `buildReminderUrl`, preventing Chrome's file resolver from interpreting query strings as literal file paths.
- Added dual search and hash parameter parsing (`window.location.search` & `window.location.hash`) in `ReminderPage.jsx` for resilient tab loading.
- Shortened `manifest.json` description to 130 characters to strictly respect the Chrome Web Store Developer Dashboard 132-character maximum limit.
- Normalized icon paths across `manifest.json` and `serviceWorker.js` to `icons/`, eliminating duplicate bundled icon assets and reducing package size from 140.33 KB to 127.08 KB.
- Fixed timer interval memory leak in `FlipClock.jsx` by properly capturing and clearing the interval timer in `useEffect` unmount cleanup.
- Added missing default `timezone: 'Asia/Jakarta'` to `DEFAULT_SETTINGS.city` in `storage.js` to guarantee consistent prayer calculations for global users.
- Removed forbidden `User-Agent` header in `CityPickerModal.jsx` Nominatim geocoding fetch calls per WHATWG Fetch specifications.
- Added comprehensive Chrome Web Store and Microsoft Edge Add-ons submission guide (`CHROMEWEBSTORE.md`).
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
- Integrated Support the Creator section inside the Settings Panel (`SettingsModal.jsx` & `Modals.css`), offering voluntary Saweria donation links (GoPay, OVO, Dana, QRIS) and GitHub repository star callout cards.
- Centralized modular support links configuration (`src/utils/supportLinks.js`) for extensible creator support options without hardcoded component logic.
- Dedicated "Support the Creator / Dukung Pengembang" sections added to `README.md` and `README.id.md`.
- Real-time dynamic prayer time preview in Adjust Time modal (`AdjustModal.jsx` & `Modals.css`), displaying the exact resulting schedule (e.g. `04:28`) alongside the original base time (`asli: 04:26`) as users adjust minute offsets (-15m to +15m).
- Integrated City Selection and Prayer Time Adjustment navigation directly inside the Settings Panel (`SettingsModal.jsx`), displaying the current city, timezone badge, active adjustment status, and one-click triggers without relying exclusively on the next prayer card hover.
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
