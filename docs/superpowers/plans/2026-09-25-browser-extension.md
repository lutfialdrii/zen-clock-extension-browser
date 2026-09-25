# extension-browser-zen-clock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Chromium Manifest V3 browser extension (`extension-browser-zen-clock`) for Google Chrome and Microsoft Edge, faithfully cloning the brand identity, design aesthetics, and behaviors of the VS Code Zen Clock extension (`extension-clock`).

**Architecture:** A modern React 19 application built with Vite and `@crxjs/vite-plugin`. Core background operations (Pomodoro timer, Kemenag RI prayer checks, toolbar badge updates, and desktop notifications) run inside an isolated Manifest V3 Service Worker using `chrome.alarms` and `chrome.storage.local`. The presentation layer comprises an Action Popup (`popup.html`), an expandable Full Desk Clock tab (`clock.html`), and a dedicated Peaceful Prayer Reminder tab (`reminder.html`).

**Tech Stack:** React 19, Vite 8, `@crxjs/vite-plugin`, `adhan` (v4.4.3), `lucide-react`, Manifest V3 WebExtension APIs (`chrome.storage`, `chrome.alarms`, `chrome.notifications`, `chrome.action`, `chrome.tabs`), Node.js native test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-09-25-extension-browser-zen-clock-design.md`

## Global Constraints

- **Repository Root**: `/Users/sm/Documents/Lutfi/DEV/Learn/extension-browser-zen-clock`
- **Manifest Version**: Manifest V3 strictly.
- **Permissions**: Restricted to `"storage"`, `"alarms"`, and `"notifications"` (zero unnecessary permissions).
- **Popup Dimensions**: Width `380px`, max-height `580px` to fit 13-inch laptop displays.
- **Kemenag RI Standard**: Fajr 20°, Isha 18°, Syafi'i madhab, Rounding Up, +2 minutes buffer ihtiyat.
- **Friday Rule**: On Fridays (`date.getDay() === 5`), Dhuhr is automatically displayed as **"Jum'at"**.
- **Reminder Tab Parameter**: `autoOpenReminderTab` defaults to `true` (opens `reminder.html` on prayer arrival). If toggled `false`, only desktop notification is triggered.
- **Theme Accents**: 6 Presets (Warm Amber, Islamic Emerald, Modern Sky, Pomodoro Rose, Mystic Purple, Monochrome) + Custom HEX with auto-contrast.
- **Bilingual (i18n)**: Bahasa Indonesia (default) and English.
- **CSP Compliance**: No inline scripts, no eval.

---

## File Structure Map

```
extension-browser-zen-clock/
├── manifest.json
├── package.json
├── vite.config.js
├── popup.html                 # Action Popup (380px)
├── clock.html                 # Full Screen Desk Clock Tab
├── reminder.html              # Dedicated Peaceful Prayer Reminder Tab
├── .gitignore
├── README.md
├── CHANGELOG.md
├── public/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
├── src/
│   ├── background/
│   │   └── serviceWorker.js   # Background Engine (Alarms, Badge, Notifications, Storage)
│   ├── popup/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   ├── deskClock/
│   │   ├── main.jsx
│   │   └── DeskClockPage.jsx
│   ├── reminder/
│   │   ├── main.jsx
│   │   ├── ReminderPage.jsx
│   │   └── ReminderPage.css
│   ├── components/
│   │   ├── FlipClock.jsx
│   │   ├── FlipClock.css
│   │   ├── FlipUnit.jsx
│   │   ├── PrayerTime.jsx
│   │   ├── PrayerTime.css
│   │   ├── PomodoroTimer.jsx
│   │   ├── PomodoroTimer.css
│   │   ├── CityPickerModal.jsx
│   │   ├── AdjustModal.jsx
│   │   ├── SettingsModal.jsx
│   │   └── SettingsModal.css
│   └── utils/
│       ├── storage.js
│       ├── prayerHelper.js
│       └── i18n.js
├── tests/
│   └── prayerHelper.test.js
└── scripts/
    └── package-zip.js
```

---

## Tasks

### Task 1: Scaffolding, Tooling & Manifest V3 Configuration

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `manifest.json`
- Create: `popup.html`, `clock.html`, `reminder.html`
- Create: `.gitignore`
- Create: `public/icons/icon-16.png`, `public/icons/icon-48.png`, `public/icons/icon-128.png`

**Interfaces:**
- Produces: Base project structure and Vite build pipeline for Manifest V3 extension with multi-page entries (popup, clock, reminder).

- [x] **Step 1: Create `.gitignore`**
  Ignore `node_modules/`, `dist/`, `releases/`, `*.zip`, `.DS_Store`.

- [x] **Step 2: Create `package.json`**
  Configure dependencies: `react`, `react-dom`, `adhan`, `lucide-react`.
  DevDependencies: `@vitejs/plugin-react`, `@crxjs/vite-plugin`, `vite`.
  Scripts: `"dev": "vite"`, `"build": "vite build"`, `"test": "node --test tests/*.test.js"`, `"package:zip": "node scripts/package-zip.js"`.

- [x] **Step 3: Create `manifest.json` (Manifest V3)**
  Define permissions (`storage`, `alarms`, `notifications`), action (`popup.html`), background service worker (`src/background/serviceWorker.js`), and icon mappings.

- [x] **Step 4: Create HTML entry points and `vite.config.js`**
  Create `popup.html`, `clock.html`, and `reminder.html`.
  Configure Vite with `crx({ manifest })` and rollup inputs for multi-page support.

- [x] **Step 5: Provide icons in `public/icons/`**
  Generate crisp 16x16, 48x48, and 128x128 icons with the Zen Clock branding.

- [x] **Step 6: Install dependencies and test build**
  Run `npm install && npm run build` to confirm `dist/` is generated with valid Manifest V3 structure.

- [x] **Step 7: Commit Task 1**
  `git add . && git commit -m "chore: scaffold extension-browser-zen-clock with Vite and Manifest V3"`

---

### Task 2: Prayer Engine, i18n & Unit Tests (TDD)

**Files:**
- Create: `src/utils/i18n.js`
- Create: `src/utils/prayerHelper.js`
- Create: `tests/prayerHelper.test.js`

**Interfaces:**
- Produces: `getPrayerName(key, lang, date)` -> returns prayer label (with Friday `"Jum'at"` handling).
- Produces: `getKemenagCalculationParameters(adjustments)` -> returns CalculationParameters.
- Produces: `formatCountdownHoursMinutes(diffSeconds, lang)` -> returns formatted string.
- Produces: `getTranslations(lang)` -> returns full bilingual dictionary (ID default, EN).

- [ ] **Step 1: Write unit tests in `tests/prayerHelper.test.js`**
  Test Friday Dhuhr returns `"Jum'at"` for both `'id'` and `'en'`.
  Test non-Friday Dhuhr returns `"Dzuhur"` (`'id'`) / `"Dhuhr"` (`'en'`).
  Test Kemenag RI buffer (+2m ihtiyat).

- [ ] **Step 2: Implement `src/utils/i18n.js`**
  Port full translations from `extension-clock` (Quran quotes, prayer names, countdown labels, reminder messages, settings).

- [ ] **Step 3: Implement `src/utils/prayerHelper.js`**
  Integrate `adhan`, implement Kemenag RI parameter preset, and `getPrayerName` Friday logic.

- [ ] **Step 4: Run unit tests**
  Execute `node --test tests/prayerHelper.test.js` and verify 100% pass.

- [ ] **Step 5: Commit Task 2**
  `git add . && git commit -m "feat(prayer): implement Kemenag RI prayer engine with Friday Jum'at rule and tests"`

---

### Task 3: Background Service Worker, Alarms & Parameterized Reminder Engine

**Files:**
- Create: `src/utils/storage.js`
- Create: `src/background/serviceWorker.js`

**Interfaces:**
- Produces: `storage` wrapper for `chrome.storage.local` with defaults for pomodoro, location, adjustments, settings (`autoOpenReminderTab: true`, `accentColor`, `language`).
- Produces: Background loop handling `ZEN_POMODORO_TICK` (Pomodoro countdown & badge updates) and `ZEN_PRAYER_CHECK` (Prayer notification & parameterized tab opening).

- [ ] **Step 1: Implement `src/utils/storage.js`**
  Provide typed async helpers `getStoredData()` and `setStoredData(partial)` with defaults.

- [ ] **Step 2: Implement `src/background/serviceWorker.js`**
  Handle `chrome.runtime.onInstalled` to seed default storage.
  Handle `chrome.alarms.onAlarm` for:
  - Pomodoro ticking: calculate remaining time from `targetEndTime`, update `chrome.action.setBadgeText` and `setBadgeBackgroundColor`. Trigger `chrome.notifications.create` on completion.
  - Prayer check: calculate prayer times with `adhan` + Kemenag params.
    - Check setting `autoOpenReminderTab`:
      - If `true` (default): Call `chrome.tabs.create({ url: 'reminder.html?prayer=...' })` + `chrome.notifications.create()`.
      - If `false`: Only trigger `chrome.notifications.create()`.
  Handle `chrome.runtime.onMessage` for actions (`START_POMODORO`, `PAUSE_POMODORO`, `RESET_POMODORO`, `UPDATE_LOCATION`, `UPDATE_SETTINGS`).

- [ ] **Step 3: Build & verify service worker bundling**
  Run `npm run build` to verify service worker compiles without errors into `dist/`.

- [ ] **Step 4: Commit Task 3**
  `git add . && git commit -m "feat(background): implement service worker with alarms, badge counter, and parameterized reminder tab"`

---

### Task 4: Flip Clock & Prayer Times Popup Components

**Files:**
- Create: `src/components/FlipClock.jsx`
- Create: `src/components/FlipClock.css`
- Create: `src/components/FlipUnit.jsx`
- Create: `src/components/PrayerTime.jsx`
- Create: `src/components/PrayerTime.css`

**Interfaces:**
- Consumes: `prayerHelper.js`, `i18n.js`, `storage.js`.
- Produces: Responsive 3D mechanical cards scaled for 380px popup width.

- [ ] **Step 1: Implement `src/components/FlipClock.jsx`, `FlipUnit.jsx`, & `FlipClock.css`**
  Port mechanical 3D card folding animation with smooth CSS card transitions and date indicator. Scale proportions so 3 double-card pairs fit comfortably within 380px.

- [ ] **Step 2: Implement `src/components/PrayerTime.jsx` & `PrayerTime.css`**
  Render next prayer badge with live countdown.
  Render 6-row today's prayer table (Subuh, Terbit, Dzuhur/Jum'at, Ashar, Maghrib, Isya).
  Pass prayer date into `getPrayerName` so Friday automatically displays `"Jum'at"`.

- [ ] **Step 3: Verify components compile**
  Run `npm run build` and ensure clean Vite compilation.

- [ ] **Step 4: Commit Task 4**
  `git add . && git commit -m "feat(ui): implement compact FlipClock and PrayerTime components for popup"`

---

### Task 5: Pomodoro Timer, Modals & Settings Components

**Files:**
- Create: `src/components/PomodoroTimer.jsx`
- Create: `src/components/PomodoroTimer.css`
- Create: `src/components/CityPickerModal.jsx`
- Create: `src/components/AdjustModal.jsx`
- Create: `src/components/SettingsModal.jsx`
- Create: `src/components/SettingsModal.css`

**Interfaces:**
- Consumes: `storage.js`, `serviceWorker.js` message API.
- Produces: 2-card flip Pomodoro timer synced to background service worker state, and full settings modal for city/koreksi/theme/language/auto-open reminder.

- [ ] **Step 1: Implement `src/components/PomodoroTimer.jsx` & `PomodoroTimer.css`**
  2 large flip cards (Minutes & Seconds).
  Start, Pause, Reset buttons dispatching messages to background service worker.
  Listen to `chrome.storage.onChanged` to stay in sync with background timer.

- [ ] **Step 2: Implement `CityPickerModal.jsx` & `AdjustModal.jsx`**
  City selection (popular Indonesian cities + search input).
  Prayer adjustment offset sliders / number inputs (+/- minutes per prayer) with Reset to Kemenag RI standard button.

- [ ] **Step 3: Implement `SettingsModal.jsx` & `SettingsModal.css`**
  6 curated theme accents (Warm Amber, Islamic Emerald, Modern Sky, Pomodoro Rose, Mystic Purple, Monochrome) + custom HEX input.
  Language switcher (`id` / `en`).
  **Auto-Open Reminder Tab toggle**: Toggle setting `autoOpenReminderTab` (Default: On).

- [ ] **Step 4: Verify build**
  Run `npm run build` to verify error-free bundling.

- [ ] **Step 5: Commit Task 5**
  `git add . && git commit -m "feat(ui): implement Pomodoro timer synced to background, city picker, and settings modal"`

---

### Task 6: Dedicated Reminder Page (`reminder.html`) & Desk Clock (`clock.html`)

**Files:**
- Create: `src/reminder/main.jsx`
- Create: `src/reminder/ReminderPage.jsx`
- Create: `src/reminder/ReminderPage.css`
- Create: `src/deskClock/main.jsx`
- Create: `src/deskClock/DeskClockPage.jsx`

**Interfaces:**
- Produces: Standalone peaceful reminder tab with Quranic quote (QS. An-Nisa: 103), local prayer info, and action buttons.
- Produces: Full-screen desk clock page for dedicated desk display.

- [ ] **Step 1: Implement `ReminderPage.jsx` & `ReminderPage.css`**
  Deep dark obsidian aesthetic (`#09090c`) with active theme ambient glow.
  Render `🕌 Panggilan Sholat {name}`, local prayer time, and Quranic verse.
  Action buttons: "✓ Saya Siap Sholat (Tutup Tab)", "⏱️ Buka Zen Clock Full View", "⚙️ Matikan Auto-Open Tab Ini".

- [ ] **Step 2: Implement `DeskClockPage.jsx`**
  Full-screen layout of 3D mechanical flip clock with date and prayer widget.

- [ ] **Step 3: End-to-end multi-page build verification**
  Run `npm run build` and ensure `dist/reminder.html`, `dist/clock.html`, and `dist/popup.html` are all compiled cleanly.

- [ ] **Step 4: Commit Task 6**
  `git add . && git commit -m "feat(reminder): implement dedicated peaceful prayer reminder tab and desk clock view"`

---

### Task 7: Main Popup Integration, Packaging & Verification

**Files:**
- Create: `src/popup/main.jsx`
- Create: `src/popup/App.jsx`
- Create: `src/popup/App.css`
- Create: `scripts/package-zip.js`
- Create: `README.md`
- Create: `CHANGELOG.md`

**Interfaces:**
- Produces: Complete root React application mounted to `popup.html`.
- Produces: Automated zip packager producing `releases/extension-browser-zen-clock-0.0.1.zip`.

- [ ] **Step 1: Implement `src/popup/App.jsx` & `App.css`**
  Header navbar with tabs: `Clock` (icon + label), `Pomodoro` (icon + label), `Settings` (gear icon), and pop-out expand button.
  Dynamic theme accent color injection (`--accent-color`).
  Live state sync with background storage.

- [ ] **Step 2: Implement `scripts/package-zip.js`**
  Node script to zip `dist/` into `releases/extension-browser-zen-clock-0.0.1.zip`.

- [ ] **Step 3: Write `README.md` & `CHANGELOG.md`**
  Document project overview, features, installation instructions for Chrome (`chrome://extensions`) and Edge (`edge://extensions`), and `v0.0.1` release notes.

- [ ] **Step 4: Execute full packaging test**
  Run `npm test && npm run build && npm run package:zip`.
  Verify zip file exists in `releases/`.

- [ ] **Step 5: Commit Task 7**
  `git add . && git commit -m "chore(release): complete popup app, zip packager, documentation, and changelog for v0.0.1"`
