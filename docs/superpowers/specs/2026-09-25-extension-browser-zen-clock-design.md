# Design Spec: extension-browser-zen-clock (Chrome & Edge Extension)

- **Date**: 2026-09-25
- **Status**: Approved for Implementation Plan
- **Target Repository**: `/Users/sm/Documents/Lutfi/DEV/Learn/extension-browser-zen-clock`
- **Target Platforms**: Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi (Chromium Manifest V3)

---

## 1. Executive Summary & Goals

### 1.1 Background & Objective
Setelah peluncuran **Zen Clock** untuk VS Code (`extension-clock`) dan versi Web PWA (`zen-flip-clock`), langkah strategis berikutnya adalah menghadirkan Zen Clock ke dalam ekosistem browser populer (**Google Chrome** dan **Microsoft Edge**) sebagai ekstensi browser berbasis **Manifest V3**.

Pengguna dapat mengakses jam mekanik 3D retro-modern, timer Pomodoro latar belakang, dan jadwal sholat Kementerian Agama RI langsung dari toolbar browser mereka melalui **Action Popup** ringkas.

### 1.2 Core Requirements
1. **Form Factor**: Action Popup responsif dan elegan (lebar 380px, tinggi maksimal 580px).
2. **True Background Engine**:
   - Pomodoro timer dan pengecekan jadwal sholat tetap berjalan akurat saat popup tertutup menggunakan `chrome.alarms` dan `chrome.storage.local`.
   - Menampilkan sisa waktu Pomodoro di badge ikon toolbar browser (`chrome.action.setBadgeText`).
   - Memicu notifikasi sistem operasi saat sesi selesai atau adzan tiba (`chrome.notifications`).
3. **Kemenag RI Standard Prayer Times**:
   - Formula resmi Kemenag RI (Subuh 20°, Isya 18°, Syafi'i, +2 menit buffer ihtiyat).
   - Penyesuaian otomatis: Label "Dzuhur" otomatis berubah menjadi **"Jum'at"** setiap hari Jumat.
   - Penyesuaian koreksi menit (+/- offset menit) per waktu sholat.
4. **Bilingual Support (i18n)**:
   - Bahasa Indonesia (bawaan) dan English (opsional).
5. **Aesthetic Customization**:
   - 6 preset warna tema (Warm Amber, Islamic Emerald, Modern Sky, Pomodoro Rose, Mystic Purple, Monochrome) + Custom HEX input.

---

## 2. Technical Stack & Tooling

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | React 19 | Konsisten dengan codebase Zen Clock yang ada |
| **Bundler** | Vite 8 + `@crxjs/vite-plugin` | Manifest V3 native, Hot Module Replacement (HMR) saat development |
| **Astronomical Math** | `adhan` | Library presisi tinggi untuk perhitungan waktu sholat |
| **Icons** | `lucide-react` | Ringan, konsisten, dan scalable |
| **Extension Standard** | Chromium Manifest V3 | Standar resmi Google Chrome Web Store & Edge Add-ons |

---

## 3. Project Directory Architecture

```
extension-browser-zen-clock/
├── manifest.json              # Konfigurasi Manifest V3
├── package.json               # Dependensi & script build/pack
├── vite.config.js             # Vite configuration dengan @crxjs/vite-plugin
├── popup.html                 # HTML container untuk Action Popup
├── public/
│   ├── icons/
│   │   ├── icon-16.png        # Toolbar icon (16x16)
│   │   ├── icon-48.png        # Extension management icon (48x48)
│   │   └── icon-128.png       # Web Store & install icon (128x128)
│   └── audio/
│       └── notification.mp3   # Audio subtle beep / reminder
└── src/
    ├── background/
    │   └── serviceWorker.js   # Background Engine (Alarms, Badge, Notifications, Storage)
    ├── popup/
    │   ├── main.jsx           # React DOM mount point
    │   ├── App.jsx            # Tab container (Clock, Pomodoro, Settings)
    │   └── App.css            # Layout & popup styling
    ├── components/
    │   ├── FlipClock.jsx      # Kartu flip mekanik 3D (responsif 380px)
    │   ├── PrayerTime.jsx     # Jadwal sholat Kemenag & countdown
    │   ├── PomodoroTimer.jsx  # Timer 2-kartu tersinkronisasi ke background
    │   └── SettingsModal.jsx  # Dialog ganti kota, koreksi waktu, warna, bahasa
    └── utils/
        ├── storage.js         # Wrapper async chrome.storage.local
        ├── prayerHelper.js    # Perhitungan waktu sholat Kemenag RI & auto-Jum'at
        └── i18n.js            # Dwibahasa ID & EN
```

---

## 4. Manifest V3 Configuration

Berkas `manifest.json`:
```json
{
  "manifest_version": 3,
  "name": "Zen Clock: Pomodoro & Muslim Prayer Times",
  "version": "0.0.1",
  "description": "A mindful 3D retro flip clock, background Pomodoro timer, and automated Muslim prayer times with Kemenag RI standards.",
  "icons": {
    "16": "public/icons/icon-16.png",
    "48": "public/icons/icon-48.png",
    "128": "public/icons/icon-128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "public/icons/icon-16.png",
      "48": "public/icons/icon-48.png",
      "128": "public/icons/icon-128.png"
    }
  },
  "background": {
    "service_worker": "src/background/serviceWorker.js",
    "type": "module"
  },
  "permissions": [
    "storage",
    "alarms",
    "notifications"
  ]
}
```

*Catatan Keamanan & Review Web Store*:
Hanya 3 permission yang diminta (`storage`, `alarms`, `notifications`). Tidak memerlukan permission invasif seperti `<all_urls>`, `tabs`, atau `webRequest`, sehingga proses review di Chrome Web Store dan Edge Add-ons dapat berlangsung cepat tanpa hambatan privasi.

---

## 5. Detailed Component Specifications

### 5.1 Background Service Worker (`src/background/serviceWorker.js`)
Service worker bertindak sebagai "Extension Host" di lingkungan browser:
1. **Penyimpanan State di `chrome.storage.local`**:
   - `zen_pomodoro`: `{ isRunning, mode: 'work'|'break', timeLeft, targetEndTime }`
   - `zen_location`: `{ name, lat, lng }` (bawaan: Jakarta)
   - `zen_adjustments`: `{ fajr, sunrise, dhuhr, asr, maghrib, isha }`
   - `zen_language`: `'id'` | `'en'`
   - `zen_accent`: `'#fbbf24'`
2. **Alarm Timer (`chrome.alarms`)**:
   - Alarm `ZEN_TICK` berjalan setiap 1 detik ketika Pomodoro aktif, memperbarui badge toolbar:
     - Work mode: `chrome.action.setBadgeText({ text: '24m' })`, background `#fbbf24`.
     - Break mode: `chrome.action.setBadgeText({ text: '04m' })`, background `#10b981`.
     - Idle mode: badge dikosongkan (`""`).
   - Alarm `ZEN_PRAYER_CHECK` memeriksa ketibaan waktu sholat setiap 30 detik.
3. **Desktop Notifications (`chrome.notifications`)**:
   - Saat Pomodoro selesai:
     - Judul: `⏱️ Waktu Pomodoro Selesai!`
     - Pesan: `Waktunya istirahat sejenak.`
   - Saat waktu sholat tiba:
     - Judul: `🕌 Panggilan Sholat {nama}` (misal: "Panggilan Sholat Jum'at" pada hari Jumat)
     - Pesan: `Waktu Sholat {nama} telah tiba untuk wilayah {lokasi}.`

### 5.2 Action Popup UI (`src/popup/`)
1. **Container Dimensions**:
   - Lebar: `380px`
   - Tinggi: Otomatis sesuai tab aktif (maksimal `580px`).
2. **Tab Navigasi**:
   - `[Clock]`: Menampilkan `FlipClock` di atas dan kartu `PrayerTime` di bawah.
   - `[Pomodoro]`: Menampilkan 2 kartu flip Pomodoro besar dengan tombol Start/Pause/Reset.
   - `[Settings]`: Pengaturan kota pencarian, penyesuaian koreksi menit Kemenag, pemilihan warna aksen, dan penggantian bahasa.
3. **Reactivity**:
   - Popup mendaftarkan listener `chrome.storage.onChanged`. Ketika status timer berubah dari service worker, UI popup langsung ter-update secara real-time tanpa delay.

### 5.3 Prayer Engine (`src/utils/prayerHelper.js`)
- Menggunakan parameter resmi Kementerian Agama RI:
  - Fajr Angle: 20°
  - Isha Angle: 18°
  - Madhab: Shafi'i
  - Rounding: Rounding Up
  - Ihtiyat: +2 menit untuk Subuh, Terbit (-2m), Dzuhur, Ashar, Maghrib, Isya.
- Logic Khusus Hari Jumat:
  ```js
  if (normalizedKey === 'dhuhr' && targetDate.getDay() === 5) {
    return "Jum'at";
  }
  ```

---

## 6. Build, Testing, & Packaging Pipeline

### 6.1 NPM Scripts (`package.json`)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "node --test tests/*.test.js",
    "package:zip": "npm run build && node scripts/package-zip.js"
  }
}
```

### 6.2 Testing Workflow
- **Unit Testing**: Logika perhitungan sholat, format countdown, dan auto-rename Jum'at diuji menggunakan native Node test runner (`node --test`).
- **Manual Verification di Browser**:
  1. Buka `chrome://extensions` (Chrome) atau `edge://extensions` (Edge).
  2. Aktifkan **Developer mode**.
  3. Klik **Load unpacked** dan pilih folder `dist/`.
  4. Uji buka popup, jalankan Pomodoro, tutup popup, lalu periksa apakah badge toolbar berdetak dan notifikasi sistem muncul saat timer habis.

---

## 7. Execution Strategy (Next Session)

Rencana eksekusi pada sesi berikutnya akan dijalankan melalui skill `writing-plans`:
1. Inisialisasi repositori mandiri `/Users/sm/Documents/Lutfi/DEV/Learn/extension-browser-zen-clock`.
2. Setup tooling Vite + React + `@crxjs/vite-plugin`.
3. Porting dan modularisasi komponen UI (`FlipClock`, `PrayerTime`, `PomodoroTimer`, `prayerHelper`).
4. Implementasi background service worker, alarms, badge counter, dan notifikasi.
5. Verifikasi pengujian lokal (load unpacked) di Chrome/Edge dan pembuatan berkas zip distribusi.
