# Engineering & Development Trajectory Log

Dokumen ini adalah catatan teknis internal (*development trajectory log*) proyek **Zen Clock: Pomodoro & Muslim Prayer Times (Browser Extension)** yang mencatat setiap prompt pengguna, analisis masalah, keputusan arsitektur, dan laporan verifikasi commit secara *reverse-chronological* (terbaru di atas).

Untuk ringkasan rilis publik (*public release notes*), lihat [CHANGELOG.md](../CHANGELOG.md) di root direktori.

---

## [0.0.1-pre] - 2026-09-25

### Architecture & Repository Foundation: Inisialisasi Repositori & Template Dokumentasi
- **Prompt Pengguna:**
  > *"kalau saya ingin ngembangin aplikasi ini menjadi extension pada browser terutama chrome dan edge , bagaimana plannya? apakah masih memungkinkan jadi satu code base? atau kita buat menjadi dua code base seperti web dan extension vscode?"*  
  > *"namakan saja extension-browser-zen-clock, dan lanjutkan agar jadi satu code base terpisah agar kita bisa eksekusi di session yang baru"*  
  > *"sebelum eksekusi , aku minta kamu gunakan template untuk dokumentasi seperti pada @docs"*
- **Analisis & Keputusan Arsitektur:**
  - **Pemisahan Repositori**:
    - Diputuskan untuk menggunakan repositori terpisah: `/Users/sm/Documents/Lutfi/DEV/Learn/extension-browser-zen-clock`.
    - Alasan: Browser extension memiliki siklus rilis, tooling (`@crxjs/vite-plugin`), dan target toko (Chrome Web Store & Microsoft Edge Add-ons) yang independen. Pemisahan repositori mencegah interferensi dependensi antara ekstensi VS Code dan ekstensi browser.
  - **Karakteristik Manifest V3**:
    - Action Popup bersifat *ephemeral* (hancur saat klik di luar popup). Oleh karena itu, mesin Pomodoro dan pengecekan waktu sholat tidak boleh bergantung pada siklus hidup React component, melainkan dioperasikan oleh **Background Service Worker** dengan **`chrome.alarms`** dan disinkronkan melalui **`chrome.storage.local`**.
    - Badge countdown di toolbar browser (`chrome.action.setBadgeText`) memberikan visibilitas waktu tanpa harus membuka popup.
  - **Standarisasi Dokumentasi**:
    - Mengadopsi struktur dokumentasi standar yang sama dengan proyek VS Code (`extension-clock/docs`):
      1. `docs/ARCHITECTURE.md`: Prinsip Service-Worker First, diagram alur mermaid, dan protokol komunikasi.
      2. `docs/BRANCHING_STRATEGY.md`: SOP branch isolation, konvensi penamaan branch, dan quality gate.
      3. `docs/PROGRESS.md`: Tabel roadmap milestone dan checklist progres (M0 s.d. M7).
      4. `docs/DEV_LOG.md`: Log lintasan rekayasa teknis per prompt pengguna.
      5. `docs/superpowers/specs/`: Spesifikasi desain teknis rinci.
      6. `docs/superpowers/plans/`: Rencana implementasi teknis langkah-demi-langkah (bite-sized tasks).
- **Hasil & Status Saat Ini:**
  - Repositori `extension-browser-zen-clock` telah diinisialisasi Git di branch `main`.
  - Seluruh dokumen arsitektur, SOP branching, progress tracker, dev log, spec, dan implementation plan telah tersusun lengkap dan rapi.
  - Siap dieksekusi langkah demi langkah mulai dari Milestone 1 / Task 1.
