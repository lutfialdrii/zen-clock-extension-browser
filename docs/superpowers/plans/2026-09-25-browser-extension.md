# extension-browser-zen-clock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready Chromium Manifest V3 browser extension for Google Chrome and Microsoft Edge featuring a 3D retro mechanical flip clock, true background Pomodoro timer, and automated Kemenag RI Muslim prayer times in a compact Action Popup.

**Architecture:** A lightweight React 19 application bundled with Vite and `@crxjs/vite-plugin`. The ephemeral Action Popup communicates with a persistent background Service Worker via `chrome.storage.local` and `chrome.alarms` to keep Pomodoro ticking and prayer notifications active even when the popup is closed.

**Tech Stack:** React 19, Vite 8, `@crxjs/vite-plugin`, `adhan` (v4), `lucide-react`, Manifest V3 WebExtension APIs (`chrome.storage`, `chrome.alarms`, `chrome.notifications`, `chrome.action`), Node.js test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-09-25-extension-browser-zen-clock-design.md`

## Global Constraints

- **Repository Root**: `/Users/sm/Documents/Lutfi/DEV/Learn/extension-browser-zen-clock`
- **Manifest Version**: Manifest V3 strictly.
- **Permissions**: Restricted to `"storage"`, `"alarms"`, and `"notifications"` (zero unnecessary permissions).
- **Popup Dimensions**: Width `380px`, max-height `580px` to fit 13-inch laptop displays.
- **Kemenag RI Standard**: Fajr 20°, Isha 18°, Syafi'i madhab, Rounding Up, +2 minutes buffer ihtiyat.
- **Friday Rule**: On Fridays (`date.getDay() === 5`), Dhuhr is automatically displayed as **"Jum'at"**.
- **No Inline Scripts / Eval**: Strictly comply with extension Content Security Policy (CSP).

---

## File Structure Map

```
extension-browser-zen-clock/
├── manifest.json
├── package.json
├── vite.config.js
├── popup.html
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
│   │   └── serviceWorker.js
│   ├── popup/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   ├── components/
│   │   ├── FlipClock.jsx
│   │   ├── FlipClock.css
│   │   ├── PrayerTime.jsx
│   │   ├── PrayerTime.css
│   │   ├── PomodoroTimer.jsx
│   │   ├── PomodoroTimer.css
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
- Create: `popup.html`
- Create: `.gitignore`
- Create: `public/icons/icon-16.png`, `public/icons/icon-48.png`, `public/icons/icon-128.png`

**Interfaces:**
- Produces: Base project structure and Vite build pipeline for Manifest V3 extension.

- [ ] **Step 1: Create `.gitignore`**
  Ignore `node_modules/`, `dist/`, `releases/`, `*.zip`, `.DS_Store`.

- [ ] **Step 2: Create `package.json`**
  Configure dependencies: `react`, `react-dom`, `adhan`, `lucide-react`.
  DevDependencies: `@vitejs/plugin-react`, `@crxjs/vite-plugin`, `vite`.
  Scripts: `"dev": "vite"`, `"build": "vite build"`, `"test": "node --test tests/*.test.js"`, `"package:zip": "node scripts/package-zip.js"`.

- [ ] **Step 3: Create `manifest.json` (Manifest V3)**
  Define permissions (`storage`, `alarms`, `notifications`), action (`popup.html`), background service worker (`src/background/serviceWorker.js`), and icon mappings.

- [ ] **Step 4: Create `vite.config.js` and `popup.html`**
  Configure Vite with `crx({ manifest })` and `@vitejs/plugin-react`.
  Create `popup.html` referencing `<script type="module" src="/src/popup/main.jsx"></script>`.

- [ ] **Step 5: Copy / Generate Icons in `public/icons/`**
  Copy `publisher-logo-128.png` or resize icons to 16x16, 48x48, and 128x128.

- [ ] **Step 6: Install dependencies and test build**
  Run `npm install && npm run build` to confirm `dist/` is generated with valid Manifest V3 structure.

- [ ] **Step 7: Commit Task 1**
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
- Produces: `getTranslations(lang)` -> returns i18n dictionary.

- [ ] **Step 1: Write unit tests in `tests/prayerHelper.test.js`**
  Test Friday Dhuhr returns `"Jum'at"` for both `'id'` and `'en'`.
  Test non-Friday Dhuhr returns `"Dzuhur"` (`'id'`) / `"Dhuhr"` (`'en'`).
  Test Kemenag RI buffer (+2m ihtiyat).

- [ ] **Step 2: Implement `src/utils/i18n.js`**
  Provide Indonesian and English dictionaries for prayer names, Pomodoro states, notifications, and settings labels.

- [ ] **Step 3: Implement `src/utils/prayerHelper.js`**
  Integrate `adhan`, implement Kemenag RI parameter preset, and `getPrayerName` Friday logic.

- [ ] **Step 4: Run unit tests**
  Execute `node --test tests/prayerHelper.test.js` and verify 100% pass.

- [ ] **Step 5: Commit Task 2**
  `git add . && git commit -m "feat(prayer): implement Kemenag RI prayer engine with Friday Jum'at rule and tests"`

---

### Task 3: Background Service Worker, Alarms & State Management

**Files:**
- Create: `src/utils/storage.js`
- Create: `src/background/serviceWorker.js`

**Interfaces:**
- Produces: `storage` wrapper for `chrome.storage.local` with defaults.
- Produces: Background loop handling `ZEN_TICK` (Pomodoro countdown & badge updates) and `ZEN_PRAYER_CHECK` (Prayer notification triggers).

- [ ] **Step 1: Implement `src/utils/storage.js`**
  Provide typed async helpers `getStoredData()` and `setStoredData(partial)` with defaults for `zen_pomodoro`, `zen_location`, `zen_adjustments`, `zen_language`, `zen_accent`.

- [ ] **Step 2: Implement `src/background/serviceWorker.js`**
  Handle `chrome.runtime.onInstalled` to seed default storage.
  Handle `chrome.alarms.onAlarm` for:
  - Pomodoro ticking: calculate remaining time from `targetEndTime`, update `chrome.action.setBadgeText` and `setBadgeBackgroundColor`. Trigger `chrome.notifications.create` on completion.
  - Prayer check: calculate prayer times with `adhan` + Kemenag params, trigger `chrome.notifications.create` with `🕌 Panggilan Sholat {name}` when time matches current minute.
  Handle `chrome.runtime.onMessage` for actions (`START_POMODORO`, `PAUSE_POMODORO`, `RESET_POMODORO`, `UPDATE_LOCATION`).

- [ ] **Step 3: Build & verify service worker bundling**
  Run `npm run build` to verify service worker compiles without errors into `dist/`.

- [ ] **Step 4: Commit Task 3**
  `git add . && git commit -m "feat(background): implement service worker with alarms, badge counter, and notifications"`

---

### Task 4: Flip Clock & Prayer Times Popup Components

**Files:**
- Create: `src/components/FlipClock.jsx`
- Create: `src/components/FlipClock.css`
- Create: `src/components/PrayerTime.jsx`
- Create: `src/components/PrayerTime.css`

**Interfaces:**
- Consumes: `prayerHelper.js`, `i18n.js`, `storage.js`.
- Produces: Responsive 3D mechanical cards scaled for 380px popup width.

- [ ] **Step 1: Implement `src/components/FlipClock.jsx` & `FlipClock.css`**
  Adapt mechanical 3D card flipping animation with date indicator. Scale proportions so 3 double-card pairs (hours, minutes, seconds) fit comfortably within 380px.

- [ ] **Step 2: Implement `src/components/PrayerTime.jsx` & `PrayerTime.css`**
  Render next prayer badge with live countdown.
  Render 6-row today's prayer table (Subuh, Terbit, Dzuhur/Jum'at, Ashar, Maghrib, Isya).
  Pass prayer date into `getPrayerName` so Friday automatically displays `"Jum'at"`.

- [ ] **Step 3: Verify components compile**
  Run `npm run build` and ensure clean Vite compilation.

- [ ] **Step 4: Commit Task 4**
  `git add . && git commit -m "feat(ui): implement compact FlipClock and PrayerTime components for popup"`

---

### Task 5: Pomodoro Timer & Settings Modal Components

**Files:**
- Create: `src/components/PomodoroTimer.jsx`
- Create: `src/components/PomodoroTimer.css`
- Create: `src/components/SettingsModal.jsx`
- Create: `src/components/SettingsModal.css`

**Interfaces:**
- Consumes: `storage.js`, `serviceWorker.js` message API.
- Produces: 2-card flip Pomodoro timer synced to background service worker state, and full settings modal for city/koreksi/theme/language.

- [ ] **Step 1: Implement `src/components/PomodoroTimer.jsx` & `PomodoroTimer.css`**
  2 large flip cards (Minutes & Seconds).
  Start, Pause, Reset buttons dispatching messages to background service worker.
  Listen to `chrome.storage.onChanged` to stay in sync with background timer.

- [ ] **Step 2: Implement `src/components/SettingsModal.jsx` & `SettingsModal.css`**
  City selection (popular Indonesian cities + search input).
  Prayer adjustment offset sliders / number inputs (+/- minutes per prayer).
  6 curated theme accents (Warm Amber, Islamic Emerald, Modern Sky, Pomodoro Rose, Mystic Purple, Monochrome) + custom HEX input.
  Language toggle (`id` / `en`).

- [ ] **Step 3: Verify build**
  Run `npm run build` to verify error-free bundling.

- [ ] **Step 4: Commit Task 5**
  `git add . && git commit -m "feat(ui): implement Pomodoro timer synced to background and settings modal"`

---

### Task 6: Main Popup App Integration & Responsive Styling

**Files:**
- Create: `src/popup/main.jsx`
- Create: `src/popup/App.jsx`
- Create: `src/popup/App.css`

**Interfaces:**
- Produces: Complete root React application mounted to `popup.html`.

- [ ] **Step 1: Implement `src/popup/App.jsx` & `App.css`**
  Header navbar with tabs: `Clock` (icon + label), `Pomodoro` (icon + label), `Settings` (gear icon).
  Dynamic theme accent color injection (`--accent-color`).
  Live state sync with background storage.

- [ ] **Step 2: Implement `src/popup/main.jsx`**
  Mount React 19 root into `document.getElementById('root')`.

- [ ] **Step 3: End-to-end build test**
  Run `npm run build` and ensure complete `dist/` directory is created.

- [ ] **Step 4: Commit Task 6**
  `git add . && git commit -m "feat(popup): integrate full popup app with tab navigation and theme styling"`

---

### Task 7: Packaging, Verification & Documentation

**Files:**
- Create: `scripts/package-zip.js`
- Create: `README.md`
- Create: `CHANGELOG.md`

**Interfaces:**
- Produces: Automated zip packager producing `releases/extension-browser-zen-clock-0.0.1.zip` for Chrome Web Store & Edge Add-ons.
- Produces: Setup and manual testing guide for Chrome and Edge developers.

- [ ] **Step 1: Implement `scripts/package-zip.js`**
  Node script using standard zip compression to package `dist/` into `releases/extension-browser-zen-clock-0.0.1.zip`.

- [ ] **Step 2: Write `README.md` & `CHANGELOG.md`**
  Document project overview, features, installation instructions for Chrome (`chrome://extensions`) and Edge (`edge://extensions`), and `v0.0.1` release notes.

- [ ] **Step 3: Execute full packaging test**
  Run `npm test && npm run build && npm run package:zip`.
  Verify zip file exists in `releases/`.

- [ ] **Step 4: Commit Task 7**
  `git add . && git commit -m "chore(release): add zip packager, documentation, and changelog for v0.0.1"`
