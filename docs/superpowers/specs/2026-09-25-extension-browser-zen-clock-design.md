# Design Spec: extension-browser-zen-clock (Cross-Platform Brand Cloning)

- **Date**: 2026-09-25
- **Status**: Approved by User
- **Target Repository**: `/Users/sm/Documents/Lutfi/DEV/Learn/extension-browser-zen-clock`
- **Source of Truth / Blueprint**: `/Users/sm/Documents/Lutfi/DEV/Learn/extension-clock` (VS Code Extension)
- **Target Platforms**: Google Chrome, Microsoft Edge, Brave, Opera, Vivaldi (Chromium Manifest V3)

---

## 1. Brand Identity & Cross-Platform Product Philosophy

Zen Clock adalah brand utilitas produktivitas mindful yang berpusat pada tiga pilar:
1. **Mindful Productivity (3D Flip Clock & Background Pomodoro)**: Jam mekanik flip card 3D yang estetis dan timer kerja/istirahat yang tidak pernah freeze.
2. **Spiritual Balance (Kemenag RI Prayer Times & Friday Jum'at)**: Perhitungan waktu sholat presisi astronomi standar resmi Kementerian Agama Republik Indonesia (+2 menit buffer ihtiyat) dengan penggantian otomatis nama "Dzuhur" menjadi "Jum'at" pada hari Jumat.
3. **Peaceful Serenity (Dedicated Reminder Page & Dark Obsidian Aesthetics)**: Desain visual elegan yang menenangkan dengan pilihan tema warna aksen harmonis dan tab pengingat sholat khusus.

Produk **`extension-browser-zen-clock`** mengadopsi 100% perilaku, estetika, dan fungsionalitas dari versi VS Code (`extension-clock`), disesuaikan dengan arsitektur browser extension Manifest V3.

---

## 2. Feature Parity & Behavioral Mapping

| Fitur di VS Code (`extension-clock`) | Implementasi di Browser (`extension-browser-zen-clock`) | Perilaku & Spesifikasi |
| :--- | :--- | :--- |
| **Extension Host (Node.js)** | **Service Worker (`src/background/serviceWorker.js`)** | Background engine mandiri via `chrome.alarms` + `chrome.storage.local`. Kebal saat popup ditutup. |
| **Status Bar Live Seconds** | **Toolbar Action Badge (`chrome.action`)** | Menampilkan sisa menit Pomodoro di toolbar (`24m` kuning untuk kerja, `04m` hijau untuk istirahat). |
| **3D Zen Flip Clock** | **Action Popup (380px) & Full Tab Desk Clock (`clock.html`)** | Animasi kartu flip 3D mekanik realistis, skala proporsional untuk popup, serta tombol expand ke full-screen tab desk clock. |
| **True Background Pomodoro** | **Background Pomodoro Timer (`chrome.alarms`)** | Menghitung waktu mundur berdasarkan `targetEndTime`. Mengirim notifikasi desktop OS saat sesi selesai. |
| **Jadwal Sholat Kemenag RI** | **Adhan Engine Kemenag Preset (`prayerHelper.js`)** | Subuh 20°, Isya 18°, Syafi'i, Rounding Up, +2m ihtiyat. Khusus hari Jumat, label Dzuhur otomatis menjadi **"Jum'at"**. |
| **ZenPrayerReminderPanel** | **Halaman Pengingat Tab Tenang (`reminder.html`)** | **Parameterized**: Pengguna dapat memilih via Setting apakah membuka tab baru otomatis saat adzan tiba (default: **On / True**) atau hanya notifikasi OS. Menampilkan ayat QS. An-Nisa: 103, countdown, dan tombol aksi "Saya Siap Sholat". |
| **QuickPick Koreksi Sholat** | **Modal Dialog Sesuaikan Jam** | Mengatur offset koreksi menit (+/- menit per jadwal sholat) dengan tombol "Reset ke Standar Kemenag RI". |
| **QuickPick Ganti Kota** | **Modal Dialog Pemilih Kota** | Pilihan kota populer Indonesia, pencarian kota global OSM Nominatim, dan deteksi IP Geolocation. |
| **6 Warna Tema & Custom HEX** | **Harmonized CSS Variable Accent System** | Warm Amber (bawaan), Islamic Emerald, Modern Sky, Pomodoro Rose, Mystic Purple, Monochrome, plus input kode HEX kustom dengan kalkulasi kontras otomatis. |
| **Multi-Language (i18n)** | **Dwibahasa (ID Default & EN)** | Bahasa Indonesia sebagai bahasa utama bawaan, Bahasa Inggris sebagai opsi pengaturan. |

---

## 3. Arsitektur Teknis & Struktur Direktori

### 3.1 Stack
- **Framework**: React 19
- **Bundler**: Vite 8 + `@crxjs/vite-plugin` (Manifest V3 native dengan HMR)
- **Library Astronomi**: `adhan` (v4.4.3)
- **Ikon**: `lucide-react`
- **Target Browser**: Chromium Manifest V3 (Chrome 110+, Edge 110+)

### 3.2 Struktur Berkas
```
extension-browser-zen-clock/
├── manifest.json              # Konfigurasi Manifest V3
├── package.json               # Dependensi & script build/pack
├── vite.config.js             # Vite configuration dengan @crxjs/vite-plugin
├── popup.html                 # Entry point Action Popup
├── clock.html                 # Full Screen Desk Clock View
├── reminder.html              # Dedicated Peaceful Prayer Reminder Tab
├── public/
│   ├── icons/
│   │   ├── icon-16.png        # Toolbar icon (16x16)
│   │   ├── icon-48.png        # Extensions page icon (48x48)
│   │   └── icon-128.png       # Web Store & install icon (128x128)
│   └── audio/
│       └── notification.mp3   # Audio reminder subtle tone
├── src/
    ├── background/
    │   └── serviceWorker.js   # Background Engine (Alarms, Badge, Notifications, Storage)
    ├── popup/
    │   ├── main.jsx           # Mount React ke popup.html
    │   ├── App.jsx            # Tab container (Clock, Pomodoro, Settings)
    │   └── App.css            # Styling Action Popup (lebar 380px)
    ├── reminder/
    │   ├── main.jsx           # Mount React ke reminder.html
    │   ├── ReminderPage.jsx   # Komponen halaman pengingat sholat tenang
    │   └── ReminderPage.css   # Styling tenang, dark obsidian, kaligrafi & quote QS. An-Nisa: 103
    ├── deskClock/
    │   ├── main.jsx           # Mount React ke clock.html
    │   └── DeskClockPage.jsx  # Full tab 3D desk clock mode
    ├── components/
    │   ├── FlipClock.jsx      # Kartu flip mekanik 3D
    │   ├── FlipUnit.jsx       # Sub-unit kartu lipat 3D
    │   ├── PrayerTime.jsx     # Jadwal sholat Kemenag & countdown
    │   ├── PomodoroTimer.jsx  # Timer 2-kartu tersinkronisasi ke background
    │   ├── CityPickerModal.jsx# Dialog pencarian kota
    │   ├── AdjustModal.jsx    # Dialog koreksi menit sholat
    │   └── SettingsModal.jsx  # Dialog pengaturan utama (Bahasa, Tema, Auto-Open Reminder)
    └── utils/
        ├── storage.js         # Wrapper async chrome.storage.local dengan fallback defaults
        ├── prayerHelper.js    # Perhitungan waktu sholat Kemenag RI & auto-Jum'at
        └── i18n.js            # Dwibahasa ID & EN
```

---

## 4. Spesifikasi Manifest V3 (`manifest.json`)

```json
{
  "manifest_version": 3,
  "name": "Zen Clock: Pomodoro & Muslim Prayer Times",
  "version": "0.0.1",
  "description": "A mindful 3D retro mechanical flip clock, background Pomodoro timer, and automated Muslim prayer times with Kemenag RI standards.",
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

---

## 5. Background Engine & State Management

### 5.1 Skema Data `chrome.storage.local`
```js
{
  zen_pomodoro: {
    isRunning: false,
    mode: 'work', // 'work' | 'break'
    timeLeft: 1500, // 25 menit
    targetEndTime: null
  },
  zen_location: {
    name: 'Jakarta',
    lat: -6.2088,
    lng: 106.8456
  },
  zen_adjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0
  },
  zen_settings: {
    language: 'id', // 'id' | 'en'
    accentColor: '#fbbf24', // Warm amber default
    autoOpenReminderTab: true // Parameterized: true = buka reminder.html, false = notif only
  }
}
```

### 5.2 Background Alarms & Lifecycle
1. **Pomodoro Alarm (`ZEN_POMODORO_TICK`)**:
   - Berjalan per detik saat `isRunning: true`.
   - Menghitung sisa waktu dari `targetEndTime - Date.now()`.
   - Memperbarui badge toolbar:
     - Work: `chrome.action.setBadgeText({ text: `${mins}m` })`, background `#fbbf24`.
     - Break: `chrome.action.setBadgeText({ text: `${mins}m` })`, background `#10b981`.
     - Selesai / Pause: badge dihapus atau menampilkan `⏸️`.
   - Saat sesi berakhir:
     - `chrome.notifications.create()` memicu notifikasi native.
     - Mode otomatis berganti ke 'break' atau 'work'.

2. **Prayer Check Alarm (`ZEN_PRAYER_CHECK`)**:
   - Berjalan setiap 30 detik untuk memeriksa ketibaan waktu sholat (toleransi delta 0-60 detik).
   - Saat waktu sholat tiba:
     - Label sholat dievaluasi via `getPrayerName(key, lang, date)` (hari Jumat otomatis berlabel **Jum'at**).
     - **Pemeriksaan Parameter `autoOpenReminderTab`**:
       - Jika `true`: Service worker memanggil `chrome.tabs.create({ url: `reminder.html?prayer=${p.name}&time=${p.time}&location=${loc.name}` })` dan memicu notifikasi desktop.
       - Jika `false`: Hanya memicu `chrome.notifications.create()` dengan pesan ajakan membuka pengingat.

---

## 6. Halaman Pengingat Tab Tenang (`reminder.html`)

Halaman ini mengkloning pengalaman `ZenPrayerReminderPanel` dari VS Code:
- **Tampilan Visual**:
  - Background deep dark obsidian `#09090c` dengan ambient glow warna tema aktif.
  - Heading tenang: `🕌 Panggilan Sholat {nama}`.
  - Waktu sholat dan kota aktif yang terformat rapi.
  - Kutipan Al-Qur'an resmi:
    *“Maka dirikanlah shalat itu (sebagaimana biasa). Sungguh, shalat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.”* (QS. An-Nisa': 103).
- **Tombol Aksi**:
  - `✓ Saya Siap Sholat (Tutup Tab)`: Menutup tab reminder (`window.close()`).
  - `⏱️ Buka Zen Clock Full View`: Mengarahkan ke `clock.html`.
  - `⚙️ Matikan Auto-Open Tab Ini`: Mengubah setting `autoOpenReminderTab` menjadi `false` langsung di storage.

---

## 7. Action Popup UI & Responsiveness (380px)

- **Header Bar**:
  - Logo Zen Clock mini + nama brand.
  - Tab switcher: `[Clock]` (Flip Clock & Prayer Times), `[Pomodoro]` (Timer 2-kartu), `[Settings]` (Gear icon).
  - Tombol expand pop-out: membuka `clock.html` di tab baru.
- **Clock Tab**:
  - Kartu jam 3D mekanik (proporsional 380px).
  - Kartu penunjuk waktu sholat berikutnya dengan badge hitung mundur.
  - Tabel 6 waktu sholat lengkap hari ini (Subuh, Terbit, Dzuhur/Jum'at, Ashar, Maghrib, Isya).
- **Pomodoro Tab**:
  - Dua kartu flip raksasa (Menit & Detik).
  - Tombol aksi Mulai / Jeda / Reset dengan konfirmasi keamanan agar tidak ter-reset tidak sengaja.
- **Settings Tab / Modal**:
  - Pemilih kota (daftar kota populer Indonesia + pencarian input).
  - Pengatur koreksi waktu sholat (+/- menit per waktu sholat).
  - Tombol toggle: **Buka Tab Pengingat Otomatis saat Adzan** (Default: *Aktif*).
  - Pemilih warna tema: 6 preset warna visual + input kode HEX kustom.
  - Pemilih bahasa antarmuka: Bahasa Indonesia / English.

---

## 8. Build, Testing & Store Packaging Pipeline

### 8.1 Scripts
- `npm run dev`: Vite development server dengan HMR.
- `npm run build`: Kompilasi produksi ke folder `dist/`.
- `npm test`: Menjalankan pengujian logika sholat dan auto-Jum'at via `node --test`.
- `npm run package:zip`: Memaketkan folder `dist/` menjadi `releases/extension-browser-zen-clock-0.0.1.zip` siap unggah ke Chrome Web Store & Microsoft Edge Add-ons.

### 8.2 Checklist Verifikasi
1. `npm test` lulus 100%.
2. Load unpacked di `chrome://extensions` dan `edge://extensions`.
3. Verifikasi Pomodoro berjalan di background saat popup ditutup dan badge toolbar berdetak.
4. Verifikasi `autoOpenReminderTab` membuka `reminder.html` saat waktu sholat disimulasikan.
5. Verifikasi toggle setting mematikan auto-open tab dan hanya memunculkan notifikasi OS.
6. Verifikasi pergantian kata Dzuhur menjadi "Jum'at" pada tanggal hari Jumat.
