# Privacy Policy for Zen Clock: Pomodoro & Muslim Prayer Times

**Last Updated:** September 27, 2026  
**Extension Name:** Zen Clock: Pomodoro & Muslim Prayer Times  
**Developer:** Lutfi Aldri Permana ([@lutfialdrii](https://github.com/lutfialdrii))  
**Repository:** [https://github.com/lutfialdrii/zen-clock-extension-browser](https://github.com/lutfialdrii/zen-clock-extension-browser)  
**Contact:** lutfialdripermana@gmail.com

---

## 1. Overview & Commitment to Privacy

Zen Clock: Pomodoro & Muslim Prayer Times ("Zen Clock") is designed from the ground up with a **local-first, privacy-by-design** architecture. We believe that spiritual mindfulness and productivity tools should never compromise your privacy or collect your personal data.

Zen Clock is completely free, open-source under the MIT License, and 100% ad-free.

---

## 2. What Data We Collect and Store

Zen Clock **does not collect, harvest, sell, or transmit any personally identifiable information (PII)** or browsing activity to any external server. 

All user data is stored strictly on your local machine using the Chrome Extension `chrome.storage.local` API:

| Data Type | Purpose | Storage Location | Transmitted Externally? |
| :--- | :--- | :--- | :---: |
| **Theme & UI Preferences** | Saves your selected accent color (HEX) and language preference (ID / EN). | `chrome.storage.local` | ❌ No |
| **City Coordinates (Lat/Lng)** | Used solely to calculate astronomical sun positions client-side via the official Kemenag RI formula. | `chrome.storage.local` | ❌ No |
| **Prayer Minute Offsets** | Saves your custom minute adjustments (-15m to +15m) for local mosque synchronization. | `chrome.storage.local` | ❌ No |
| **Pomodoro Timer State** | Stores active focus/break duration and target completion timestamp so the timer survives browser restarts. | `chrome.storage.local` | ❌ No |
| **Reminder Preferences** | Stores whether you wish to auto-open the serene reminder tab or receive desktop notifications only. | `chrome.storage.local` | ❌ No |

---

## 3. Geolocation Data Handling

- **Manual City Selection (Default):** Zen Clock includes an offline database of 514 Indonesian cities and 40+ international cities. Selecting a city from this database does not trigger any network requests.
- **Browser GPS Detection (Optional):** If you voluntarily click the *"Use Current GPS Location"* button, the browser requests one-time permission via the standard `navigator.geolocation` API. The coordinates are stored exclusively on your device.
- **Online City Search (Optional):** If you search for an unlisted international city, Zen Clock queries the public OpenStreetMap Nominatim API (`nominatim.openstreetmap.org`) over HTTPS. No cookies, trackers, or user identifiers are sent with this query.

---

## 4. Permissions Justification

Zen Clock requests only the absolute minimum permissions required for its functionality:

- `storage`: Required to save user settings and persistent timer state locally without external databases.
- `alarms`: Required to wake up the background service worker at the exact time of prayer calls and Pomodoro completion, and to update the toolbar badge countdown.
- `notifications`: Required to display non-intrusive desktop alerts when a Pomodoro session completes or a prayer time arrives.

**Host Permissions:** Zen Clock requests **zero (`0`) host permissions**. It does not access, read, or alter any webpage you visit.

---

## 5. Third-Party Services, Tracking & Cookies

- **Analytics & Telemetry:** None. Zen Clock contains no Google Analytics, Mixpanel, Sentry, or other tracking SDKs.
- **Advertising:** None. Zen Clock is 100% ad-free.
- **Cookies:** Zen Clock does not set or read any cookies.
- **Voluntary Creator Support:** Zen Clock contains voluntary support links to Saweria and GitHub. These links open in standard external browser tabs (`target="_blank"`, `rel="noopener noreferrer"`) and do not track users or gate any core extension features.

---

## 6. Data Retention & Deletion

Since all data is stored locally in `chrome.storage.local`:
- You can reset all settings anytime from the in-app Settings modal.
- Uninstalling the extension completely and immediately removes all stored data from your machine.

---

## 7. Changes to This Privacy Policy

If we make any modifications to this Privacy Policy, the updated version will be committed directly to this repository with a revised "Last Updated" date.

---

## 8. Contact Us

If you have questions or feedback regarding this Privacy Policy or the security of Zen Clock, please open an issue on GitHub or contact:

- **GitHub Issues:** [https://github.com/lutfialdrii/zen-clock-extension-browser/issues](https://github.com/lutfialdrii/zen-clock-extension-browser/issues)
- **Email:** lutfialdripermana@gmail.com
