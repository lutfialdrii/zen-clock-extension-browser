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
| **M6: Integrasi Root App & Theme Sync** | Navigasi tab popup, integrasi reaktif chrome.storage.onChanged, verifikasi end-to-end | `feat/integration-root-app` | ✅ Selesai |
| **M7: Packaging Zip & Rilis v0.0.1** | Skrip packager otomatis, README & CHANGELOG rilis awal, panduan upload Web Store & Edge Add-ons | `main` | ✅ Selesai |
| **M7.1: Pre-Release Hardening** | Persistensi disk LevelDB, storage reactive listener, anti multi-state Pomodoro guard & SSOT | `fix/pomodoro-state-and-storage` | ✅ Selesai |
| **M7.2: Pomodoro Fullscreen & Routing** | Mode Pomodoro di Desk Clock, auto-routing tab saat sesi aktif, pulsing dot indicator | `fix/pomodoro-fullscreen-and-routing` | ✅ Selesai |
| **M7.3: Prayer Alarms & Reminder Reliability** | Exact timestamp alarm scheduling, toleransi 15m safety net, fallback window, tombol test | `fix/prayer-alarm-scheduler-and-reminder` | ✅ Selesai |
| **M7.4: Full City Catalog, Global Search & GPS** | 500+ kota/kabupaten se-Indonesia (38 provinsi), pencarian global OSM Nominatim, GPS otomatis, timezone-aware | `feat/full-city-catalog-and-global-search` | ✅ Selesai |
| **M7.5: Settings Panel City & Adjust Navigation** | Integrasi navigasi pemilihan kota dan koreksi jam sholat langsung di panel Setting | `feat/settings-panel-city-and-adjust` | ✅ Selesai |
| **M7.6: Live Prayer Time Preview in Adjust Modal** | Pratinjau langsung waktu sholat hasil koreksi menit secara real-time di modal penyesuaian | `feat/adjust-modal-live-time-preview` | ✅ Selesai |
| **M7.7: Support Creator & Project Backing** | Widget apresiasi pengembang di Settings (Saweria & Star GitHub), modular config, dan dokumentasi README | `feat/support-creator-widget` | ✅ Selesai |
| **M7.8: Chrome Web Store Pre-Submission Readiness** | Validasi batas deskripsi (130 char <= 132), normalisasi icon path, perbaikan memory leak, CHROMEWEBSTORE.md | `fix/cws-pre-submission-readiness` | ✅ Selesai |
| **M7.9: Reminder Tab URL & ERR_FILE_NOT_FOUND Fix** | Pemisahan path file base dari query params pada `chrome.runtime.getURL`, helper `buildReminderUrl`, dan parsing hash | `fix/reminder-tab-url-not-found` | ✅ Selesai |



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

### Milestone 6: Integrasi Root App & Theme Sync ✅
- [x] Buat root React application `src/popup/App.jsx` dan styling `src/popup/App.css`.
- [x] Tambahkan tab navigasi header: `Clock`, `Pomodoro`, dan tombol `Settings` & `Desk Clock`.
- [x] Daftarkan listener `chrome.storage.onChanged` untuk sinkronisasi reaktif instan.
- [x] Implementasikan halaman layar penuh `src/deskClock/DeskClockPage.jsx`.
- [x] Implementasikan halaman hening pengingat sholat `src/reminder/ReminderPage.jsx` dengan ayat QS. An-Nisa: 103 dan tombol siap sholat.
- [x] Lakukan verifikasi build Vite lengkap (`npm run build`).

---

### Milestone 7: Packaging Zip & Rilis v0.0.1 ✅
- [x] Buat skrip packager `scripts/package-zip.js` untuk membuat berkas `releases/extension-browser-zen-clock-0.0.1.zip`.
- [x] Susun dokumentasi `README.md` dan `CHANGELOG.md` rilis awal v0.0.1.
- [x] Uji build dan packaging release zip lengkap (122 KB) siap publish ke Chrome Web Store & Edge Add-ons.

---

### Milestone 7.1: Pre-Release Hardening: Storage Persistence & Pomodoro Anti-Desync ✅
- [x] Daftarkan listener `chrome.storage.onChanged` di Background Service Worker agar perubahan kota/lokasi & koreksi waktu sholat seketika memicu pembaruan jadwal dan timer.
- [x] Terapkan Anti Multi-Start Guard di `START_POMODORO` handler Service Worker untuk mencegah reset tidak sengaja saat timer sedang aktif.
- [x] Tambahkan alarm periodik `ZEN_POMODORO_TICK` (1 menit) di `chrome.alarms` untuk menjaga konsistensi toolbar badge saat Service Worker tertidur.
- [x] Pastikan seluruh UI (`PomodoroTimer.jsx`, Popup, Desk Clock) secara murni menurunkan sisa waktu dari `targetEndTime - Date.now()` (Single Source of Truth).
- [x] Buat unit test `tests/storageAndGuard.test.js` untuk memvalidasi guard dan formula SSOT (12/12 lulus).
- [x] Lakukan verifikasi penuh: `npm test && npm run package:zip`.

---

### Milestone 7.2: Pomodoro Fullscreen & Active Routing Fixes ✅
- [x] Tambahkan mode Pomodoro di layar penuh Desk Clock (`DeskClockPage.jsx`) dengan toggle tampilan Clock & Pomodoro, layout clamp responsif, dan sinkronisasi background.
- [x] Implementasikan auto-routing ke tab Pomodoro saat membuka popup widget jika status Pomodoro sedang aktif (`isPomodoroActive`).
- [x] Tambahkan dot icon beranimasi pulsing (`.pomodoro-active-dot`) saat Pomodoro aktif di tampilan Popup maupun Fullscreen Desk Clock.
- [x] Buat unit test `tests/pomodoroRouting.test.js` (17/17 tests passing).
- [x] Verifikasi penuh: `npm test && npm run package:zip`.

---

### Milestone 7.3: Prayer Alarms & Reminder Reliability ✅
- [x] Implementasikan penjadwalan alarm waktu tepat (`schedulePrayerAlarms`) dengan `chrome.alarms.create(alarmName, { when: timestamp })` untuk tiap sholat fardhu hari ini.
- [x] Perluas jendela toleransi safety net (`PRAYER_ALERT_WINDOW_SECONDS = 900`, 15 menit) dengan proteksi anti duplikasi harian (`lastReminded`), mencegah alarm terlewat akibat throttling latar belakang atau laptop tidur sejenak.
- [x] Daftarkan inisialisasi alarm di top-level Service Worker untuk menjamin alarm tetap terpasang di semua siklus hidup Service Worker.
- [x] Tambahkan fallback pembukaan jendela peramban (`chrome.windows.create`) jika `chrome.tabs.create` gagal saat tidak ada jendela aktif.
- [x] Tambahkan tombol diagnostik uji coba pengingat ("Uji Notifikasi & Tab Pengingat") di `SettingsModal.jsx` untuk verifikasi instan pembukaan tab dan notifikasi OS.
- [x] Buat unit test `tests/prayerAlarmScheduler.test.js` (22/22 tests passing).
- [x] Verifikasi penuh: `npm test && npm run package:zip`.

---

### Milestone 7.4: Full City Catalog, Global Search & GPS Geolocation ✅
- [x] Bangun katalog komprehensif 539+ kota dan kabupaten (`src/utils/citiesData.js`), mencakup seluruh 514 kota/kabupaten di 38 provinsi Indonesia beserta pemetaan zona waktu resmi (WIB: `Asia/Jakarta`, WITA: `Asia/Makassar`, WIT: `Asia/Jayapura`) serta kota internasional utama.
- [x] Implementasikan pencarian global seluruh dunia menggunakan OpenStreetMap Nominatim API (`https://nominatim.openstreetmap.org/search`) untuk lokasi mana pun di dunia.
- [x] Implementasikan deteksi lokasi instan via GPS browser (`navigator.geolocation.getCurrentPosition`) dengan reverse geocoding otomatis.
- [x] Terapkan *Timezone-Aware Prayer Calculation* (`formatTimeHHMM(date, timezone)`) dengan `Intl.DateTimeFormat`, menjamin jadwal waktu sholat kota yang dipilih selalu tampil akurat sesuai waktu lokal kota tersebut (misal Makkah UTC+3, London UTC+0, Jayapura UTC+9) tanpa terpengaruh zona waktu komputer host peramban.
- [x] Perbarui antarmuka modal pemilihan kota (`CityPickerModal.jsx` & `Modals.css`) dengan badge zona waktu (WIB, WITA, WIT), pengelompokan hasil pencarian global OSM, dan tombol bersihkan pencarian.
- [x] Tambahkan kamus terjemahan bilingual (`useGps`, `detectingGps`, `gpsDenied`, `searchWorldwide`, `searchingOnline`, `globalResults`).
- [x] Buat unit test `tests/citiesData.test.js` (26/26 tests passing).
- [x] Verifikasi penuh: `npm test && npm run package:zip`.

---

### Milestone 7.5: Settings Panel City & Adjust Navigation ✅
- [x] Tambahkan bagian "Lokasi & Jadwal Sholat" di posisi teratas panel Pengaturan (`SettingsModal.jsx`), memuat baris interaktif kota terpilih lengkap dengan badge zona waktu dan deskripsi wilayah.
- [x] Tambahkan baris interaktif "Sesuaikan Jam Sholat" (Ihtiyat) di panel Pengaturan dengan indikator status penyesuaian kustom.
- [x] Sambungkan event handler `onOpenCityPicker` dan `onOpenAdjustModal` baik pada popup utama (`App.jsx`) maupun fullscreen desk clock (`DeskClockPage.jsx`), menyimpan pengaturan aktif sebelum membuka modal tujuan.
- [x] Tambahkan styling `.settings-action-row` di `Modals.css` dengan micro-interactions responsif (hover highlight, chevron slide, badge status).
- [x] Tambahkan kamus terjemahan dwibahasa di `src/utils/i18n.js` (`locationAndPrayer`, `adjustPrayerTimes`, `adjustPrayerTimesDesc`, `change`, `adjust`).
- [x] Buat unit test `tests/settingsNavigation.test.js` (28/28 tests passing).
- [x] Verifikasi penuh: `npm test && npm run package:zip`.

---

### Milestone 7.6: Live Prayer Time Preview in Adjust Modal ✅
- [x] Integrasikan perhitungan waktu sholat dinamis (`calculatePrayerTimes`) di dalam `AdjustModal.jsx` berbasis lokasi kota aktif (`city`).
- [x] Tampilkan *pill* pratinjau jam sholat yang berubah secara real-time saat tombol stepper `+` atau `-` ditekan (misal `04:26` -> `04:28`).
- [x] Berikan sorotan visual (warna aksen tema) dan keterangan waktu dasar (`asli: 04:26` / `base: 04:26`) pada baris waktu sholat yang dimodifikasi.
- [x] Tampilkan nama kota dan wilayah pada subtitle `AdjustModal` untuk memperjelas konteks jadwal sholat yang sedang disesuaikan.
- [x] Sambungkan prop `city={settings?.city}` ke komponen `AdjustModal` pada `App.jsx` dan `DeskClockPage.jsx`.
- [x] Buat unit test `tests/adjustTimePreview.test.js` (30/30 tests passing).
- [x] Verifikasi penuh: `npm test && npm run package:zip`.

---

### Milestone 7.7: Support Creator & Project Backing ✅
- [x] Bangun modul konfigurasi tautan dukungan terpusat (`src/utils/supportLinks.js`) untuk Saweria (`https://saweria.co/lutfialdrii`) dan repositori GitHub.
- [x] Tambahkan kamus terjemahan dwibahasa di `src/utils/i18n.js` (`supportCreator`, `supportCreatorDesc`, `supportSaweria`, `supportSaweriaDesc`, `supportGitHub`, `supportGitHubDesc`).
- [x] Desain dan integrasikan seksi "Dukung Pengembang / Support the Creator" di dalam `SettingsModal.jsx` dengan kartu Saweria & Star GitHub yang elegan dan responsif.
- [x] Perbarui `README.md` dan `README.id.md` dengan seksi "💖 Support the Creator / Dukung Pengembang" serta tautan donasi sukarela.
- [x] Buat unit test `tests/supportLinks.test.js` (32/32 tests passing).
- [x] Verifikasi penuh: `npm test && npm run package:zip`.

---

### Milestone 7.8: Chrome Web Store Pre-Submission Readiness ✅
- [x] Pangkas panjang teks deskripsi di `manifest.json` menjadi 130 karakter untuk mematuhi batas keras validasi Chrome Developer Dashboard (maksimal 132 karakter).
- [x] Normalisasi jalur aset ikon dari `public/icons/` menjadi `icons/` pada `manifest.json` dan `src/background/serviceWorker.js`, mengeliminasi duplikasi aset dan memangkas ukuran paket zip dari 140.33 KB menjadi 127.08 KB.
- [x] Perbaiki potensi kebocoran memori (memory leak) timer interval pada `FlipClock.jsx` dengan menangkap dan membersihkan `interval` pada fungsi pembersihan `useEffect`.
- [x] Tambahkan properti zona waktu default `timezone: 'Asia/Jakarta'` pada `DEFAULT_SETTINGS.city` di `src/utils/storage.js` untuk konsistensi perhitungan waktu sholat bagi pengguna global.
- [x] Hapus header `User-Agent` terlarang pada pemanggilan `fetch()` OpenStreetMap Nominatim di `src/components/CityPickerModal.jsx`.
- [x] Optimalkan inisialisasi alarm service worker (`setupAlarms`) agar idempoten dan tidak membuat ulang alarm yang sudah ada.
- [x] Susun dokumen panduan lengkap pengajuan ke toko ekstensi (`CHROMEWEBSTORE.md`) yang memuat justifikasi izin, pernyataan tujuan tunggal, dan kebijakan privasi.
- [x] Verifikasi penuh: `npm test` (32/32 lulus) dan `npm run package:zip` (127.08 KB).

---

### Milestone 7.9: Reminder Tab URL & ERR_FILE_NOT_FOUND Fix ✅
- [x] Analisis akar masalah `ERR_FILE_NOT_FOUND`: Pemanggilan `chrome.runtime.getURL('reminder.html?prayer=...')` menyebabkan Chrome memperlakukan query string sebagai bagian literal dari nama file fisik di sistem berkas, sehingga gagal menemukan file.
- [x] Implementasikan helper murni `buildReminderUrl(baseUrl, prayerKey, cityName)` di `src/utils/prayerHelper.js` yang memisahkan path fisik berkas dari query string parameters (`?prayer=...&city=...`).
- [x] Perbarui pemanggilan URL pengingat di `src/background/serviceWorker.js` pada pembukaan tab otomatis (`triggerPrayerAlert`) dan event klik notifikasi OS (`onButtonClicked` & `onClicked`).
- [x] Tambahkan dukungan parsing parameter ganda (`searchParams` dan `hashParams`) pada `src/reminder/ReminderPage.jsx` untuk menjamin kompatibilitas pembukaan tab dalam berbagai format URL.
- [x] Buat unit test `buildReminderUrl` di `tests/prayerHelper.test.js` (33/33 tests passing).
- [x] Lakukan kompilasi dan pemaketan rilis: `npm test && npm run package:zip` (127.19 KB).





