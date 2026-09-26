# Chrome Web Store & Microsoft Edge Add-ons Submission Guide

This document is the single source of truth for submitting and publishing **Zen Clock: Pomodoro & Muslim Prayer Times** to the **Chrome Web Store Developer Dashboard** and **Microsoft Partner Center (Edge Add-ons)**.

---

## 1. Store Listing Metadata

- **Extension Name:** `Zen Clock: Pomodoro & Muslim Prayer Times`
- **Short Description (130 chars / Max 132 chars):**
  ```text
  3D retro flip clock, background Pomodoro timer, and automated Muslim prayer times with Kemenag RI standards for Chrome and Edge.
  ```
- **Category:** `Productivity` / `Workflow & Planning`
- **Primary Language:** `English` (with complete Indonesian translation)
- **Support / Contact Email:** `lutfialdripermana@gmail.com`
- **Homepage URL:** `https://github.com/lutfialdrii/zen-clock-extension-browser`

### Detailed Description (Markdown / Plain Text for Store Listing)
```text
Zen Clock brings peace, mindful focus, and punctuality to your browser with a mechanical 3D retro flip clock, background Pomodoro focus timer, and automated Muslim prayer time notifications.

✨ KEY FEATURES:

🕰️ 3D Mechanical Retro Flip Clock
- Smooth flip animations showing hours, minutes, and seconds.
- Fullscreen Desk Clock mode (ambient aesthetic mode for dedicated desk displays).
- 6 curated aesthetic accent color themes + custom HEX color picker.

🍅 Background Pomodoro Timer
- Work & Break focus sessions (25m / 5m customizable presets).
- Persistent Background Service Worker: Timers keep running even when the popup is closed or the browser sleeps.
- Real-time countdown badge directly on the browser extension toolbar.
- Non-intrusive desktop notifications upon session completion.

🕌 Automated Muslim Prayer Times
- Official Kemenag RI calculation standard with +2-minute safety buffer (ihtiyat).
- Comprehensive offline database of 514 cities & regencies across 38 Indonesian provinces.
- Automatic Friday rename: "Dzuhur" dynamically displays as "Jum'at" on Fridays.
- Global city search via OpenStreetMap and zero-setup one-click browser GPS detection.
- Timezone-aware calculations (WIB, WITA, WIT, and international timezones).
- Minute offset fine-tuning (-15m to +15m) with live schedule preview.
- Serene Quranic reminder tab (QS. An-Nisa: 103) upon adzan arrival.

🔒 PRIVATE, SECURE & AD-FREE:
- 100% offline-first: Prayer times are calculated mathematically directly on your device.
- Zero analytics, zero ad trackers, zero cookies, and zero user data collection.
- Free and open-source under the MIT License.
```

---

## 2. Permissions Justification (For Review Team)

When prompted by the Chrome Web Store Developer Dashboard, copy and paste these exact explanations:

| Permission | Why It's Needed (Store Review Justification) |
| :--- | :--- |
| `storage` | Required to locally store user preferences (selected accent color, city coordinates, custom minute adjustments, and Pomodoro presets) and maintain persistent timer states without requiring an external database. |
| `alarms` | Required to wake up the background service worker at the exact time of each daily prayer and Pomodoro session completion, and to periodically refresh the toolbar badge countdown. |
| `notifications` | Required to display non-intrusive desktop alerts when a Pomodoro focus or break session finishes, and when a daily prayer time arrives. |

> **Host Permissions:** None (`0`). Zen Clock does not require host permissions. Location search to OpenStreetMap Nominatim is performed directly via standard client-side `fetch()` with zero credentials.

---

## 3. Single Purpose Statement

```text
Zen Clock provides a peaceful, retro mechanical flip clock with an integrated Pomodoro focus timer and astronomical Muslim prayer time countdowns in a single unified productivity view.
```

---

## 4. Privacy & Data Use Disclosure

In the **Privacy** tab of the Chrome Developer Dashboard, declare the following:

- **Single Purpose Compliance:** Confirmed.
- **Permission Justification:** Provided as detailed above.
- **Does this extension collect or transmit user data?** Select **NO**.
  - No personally identifiable information (PII).
  - No health, financial, authentication, or browsing history data.
  - No tracking of visited URLs or keystrokes.
- **Location Data:**
  - Coordinates (latitude/longitude) are obtained only when the user voluntarily selects a city or clicks "Use Current GPS Location".
  - Coordinates are stored purely in `chrome.storage.local` on the user's local disk to compute astronomical sun positions client-side.
  - No location data is sold, transferred, or transmitted to third parties or remote analytics servers.

---

## 5. Store Visual Assets Checklist

Prepare these promotional graphic assets before submitting:

| Asset | Dimensions | Requirements | Status |
| :--- | :--- | :--- | :---: |
| **Extension Icon** | 128 x 128 px | PNG with transparent or dark background | ✅ Ready (`public/icons/icon-128.png`) |
| **Small Promo Tile** | 440 x 280 px | PNG or JPEG, no border, text within safe area | 📋 To prepare |
| **Store Screenshots** | 1280 x 800 px (or 640 x 400 px) | 1 to 5 PNG screenshots showing Flip Clock, Pomodoro, Prayer Schedule, Settings | 📋 To capture from browser |

---

## 6. Pre-Submission Packaging & Upload Verification

```bash
# 1. Run all unit tests
npm test

# 2. Compile and package the production zip
npm run package:zip
```

The resulting file:
`releases/extension-browser-zen-clock-0.0.1.zip` (approx. 138-140 KB) is completely self-contained and ready for upload to:
- **Chrome Web Store:** [https://chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole)
- **Microsoft Partner Center:** [https://partner.microsoft.com/dashboard/microsoftedge](https://partner.microsoft.com/dashboard/microsoftedge)
