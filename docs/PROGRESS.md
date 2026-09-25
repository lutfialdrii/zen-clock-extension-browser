# Zen Clock Browser Extension: Progress Tracker & Roadmap

Dokumen ini memantau milestone, status implementasi fitur, dan roadmap ekstensi browser **Zen Clock: Pomodoro & Muslim Prayer Times** (Google Chrome & Microsoft Edge).

---

## 📊 Status Ringkasan Milestone

| Milestone | Deskripsi | Target Branch | Status |
| :--- | :--- | :--- | :---: |
| **M0: Fondasi Repositori & Arsitektur** | Inisialisasi repo mandiri, penyusunan arsitektur MV3, SOP branching, dan rencana implementasi | `main` | ✅ Selesai |
| **M1: Scaffolding Vite & Manifest V3** | Setup package.json, vite.config.js dengan @crxjs, manifest.json, popup.html, dan ikon aset | `feat/scaffold-mv3-vite` | ✅ Selesai |
| **M2: Prayer Times Engine & TDD** | Standar Kemenag RI (+2m buffer), auto-rename Jum'at di hari Jumat, kamus i18n, unit test 100% | `feat/kemenag-prayer-engine` | ✅ Selesai |
| **M3: Service Worker, Alarms & Badge** | Background timer di MV3, chrome.alarms, badge countdown toolbar, notifikasi sistem OS | `feat/background-service-worker` | ✅ Selesai |
| **M4: Popup UI (Flip Clock & Sholat)** | Kartu 3D Flip Clock proporsional 380px, kartu waktu sholat terdekat, tabel jadwal 6 waktu | `feat/popup-ui-flipclock` | ✅ Selesai |
| **M5: Pomodoro Timer & Settings** | Flip timer 2-kartu tersinkronisasi ke background, modal ganti kota, koreksi waktu, warna tema, bahasa | `feat/popup-pomodoro-settings` | ✅ Selesai |
| **M6: Integrasi Root App & Theme Sync** | Navigasi tab popup, integrasi reaktif chrome.storage.onChanged, verifikasi end-to-end | `feat/integration-root-app` | ⏳ Siap Dikerjakan |
| **M7: Packaging Zip & Rilis v0.0.1** | Skrip packager otomatis, README & CHANGELOG rilis awal, panduan upload Web Store & Edge Add-ons | `main` | ⏳ Menunggu |

---

## 📝 Detail Tugas per Milestone

### Milestone 0: Fondasi Repositori & Arsitektur ✅
- [x] Inisialisasi repositori terpisah di `/Users/sm/Documents/Lutfi/DEV/Learn/extension-browser-zen-clock`.
- [x] Susun `docs/ARCHITECTURE.md` (arsitektur Service Worker First & Reactive Storage).
- [x] Susun `docs/BRANCHING_STRATEGY.md` (SOP isolasi branch & gerbang kualitas).
- [x] Susun `docs/superpowers/specs/2026-09-25-extension-browser-zen-clock-design.md` (Design Spec lengkap).
- [x] Susun `docs/superpowers/plans/2026-09-25-browser-extension.md` (Implementation Plan terperinci).
- [x] Susun `docs/PROGRESS.md` & `docs/DEV_LOG.md`.

---

### Milestone 1: Scaffolding Vite & Manifest V3 ✅
- [x] Buat file `.gitignore` standar.
- [x] Konfigurasi `package.json` (React 19, Vite, `@crxjs/vite-plugin`, `adhan`, `lucide-react`).
- [x] Konfigurasi `manifest.json` Manifest V3 (permissions: `storage`, `alarms`, `notifications`).
- [x] Konfigurasi `vite.config.js` dengan integrasi CRXJS.
- [x] Buat file `popup.html` dan letakkan ikon di `public/icons/` (16x16, 48x48, 128x128).
- [x] Jalankan `npm install` dan verifikasi `npm run build`.

---

### Milestone 2: Prayer Times Engine, i18n & TDD ✅
- [x] Buat unit tests di `tests/prayerHelper.test.js` (perhitungan Kemenag, auto-rename Jum'at di hari Jumat).
- [x] Implementasikan kamus terjemahan `src/utils/i18n.js` (Bahasa Indonesia & English).
- [x] Implementasikan modul perhitungan astronomi `src/utils/prayerHelper.js`.
- [x] Jalankan `npm test` menggunakan `node --test` dan pastikan 100% lulus.

---

### Milestone 3: Background Service Worker, Alarms & Toolbar Badge ✅
- [x] Implementasikan pembungkus penyimpanan `src/utils/storage.js` dengan nilai default.
- [x] Buat background service worker `src/background/serviceWorker.js`.
- [x] Implementasikan alarm `ZEN_POMODORO_FINISH` & timer loop untuk update badge toolbar via `chrome.action.setBadgeText()`.
- [x] Implementasikan alarm `ZEN_PRAYER_CHECK` dan trigger notifikasi adzan desktop via `chrome.notifications`.
- [x] Handle pesan kontrol Pomodoro dari UI Popup (`START_POMODORO`, `PAUSE_POMODORO`, `RESET_POMODORO`).
- [x] Parameterized auto open reminder tab `reminder.html` saat adzan tiba sesuai opsi `autoOpenReminderTab`.

---

### Milestone 4: Popup UI (3D Flip Clock & Jadwal Sholat) ✅
- [x] Implementasikan kartu 3D flip mekanik responsif `src/components/FlipClock.jsx` dan styling 380px `FlipClock.css`.
- [x] Implementasikan komponen jadwal sholat `src/components/PrayerTime.jsx` dan `PrayerTime.css`.
- [x] Hubungkan logika tanggal agar sholat Dzuhur otomatis berlabel "Jum'at" pada hari Jumat di UI popup.

---

### Milestone 5: Pomodoro Timer 2-Kartu & Settings Modal ✅
- [x] Implementasikan `src/components/PomodoroTimer.jsx` (2 kartu menit & detik yang terhubung ke service worker).
- [x] Implementasikan `src/components/CityPickerModal.jsx` (pencarian kota global & daftar kota populer di Indonesia).
- [x] Implementasikan `src/components/AdjustModal.jsx` (penyesuaian koreksi menit +/- offset tiap waktu sholat).
- [x] Implementasikan `src/components/SettingsModal.jsx`:
  - Parameterized toggle buka tab pengingat hening otomatis (`autoOpenReminderTab`).
  - Pemilihan 6 warna tema + kustom kode HEX.
  - Penggantian bahasa (ID/EN).
  - Pengaturan durasi sesi kerja dan istirahat Pomodoro.

---

### Milestone 6: Integrasi Root App & Theme Sync ⏳
- [ ] Buat root React application `src/popup/App.jsx` dan mount point `src/popup/main.jsx`.
- [ ] Tambahkan tab navigasi header: `Clock`, `Pomodoro`, dan `Settings`.
- [ ] Daftarkan listener `chrome.storage.onChanged` untuk sinkronisasi reaktif instan.
- [ ] Lakukan verifikasi build Vite lengkap (`npm run build`).

---

### Milestone 7: Packaging Zip & Rilis v0.0.1 ⏳
- [ ] Buat skrip packager `scripts/package-zip.js` untuk membuat berkas `releases/extension-browser-zen-clock-0.0.1.zip`.
- [ ] Susun dokumentasi `README.md` dan `CHANGELOG.md` rilis awal v0.0.1.
- [ ] Uji *load unpacked* ekstensi di Chrome (`chrome://extensions`) dan Edge (`edge://extensions`).
