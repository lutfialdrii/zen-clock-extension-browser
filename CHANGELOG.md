# Changelog

All notable changes to the "Zen Clock: Pomodoro & Muslim Prayer Times" browser extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
