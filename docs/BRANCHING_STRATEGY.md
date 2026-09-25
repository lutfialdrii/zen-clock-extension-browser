# Git Branching Strategy & Isolation SOP

Dokumen ini adalah pedoman wajib bagi setiap developer dan AI Assistant yang bekerja di repositori **extension-browser-zen-clock**.

---

## 🛡️ Hukum Utama: Isolasi Branch (Branch Isolation)

> **"Dilarang melakukan coding fitur baru atau perbaikan langsung di branch `main`."**
> 
> Branch `main` harus selalu dalam kondisi **stabil, terverifikasi bebas error, dan siap di-package menjadi file `.zip` ekstensi browser kapan saja**.

Setiap pekerjaan (fitur baru, perbaikan bug, refactoring, perbaruan dokumentasi) **WAJIB** dikerjakan di branch terisolasi (*isolated branch*) atau *Git Worktree*.

---

## 🌿 Konvensi Penamaan Branch

Format penamaan branch adalah `<tipe>/<nama-spesifik-kebab-case>`:

| Tipe | Contoh Branch | Penggunaan |
| :--- | :--- | :--- |
| `feat/` | `feat/scaffold-mv3-vite` | Inisialisasi tooling Vite & Manifest V3 |
| `feat/` | `feat/kemenag-prayer-engine` | Logika waktu sholat Kemenag RI & auto-Jum'at |
| `feat/` | `feat/background-service-worker`| Background alarm, toolbar badge, dan desktop notifikasi |
| `feat/` | `feat/popup-ui-flipclock` | Tampilan 3D Flip Clock & jadwal sholat di popup |
| `feat/` | `feat/popup-pomodoro-settings` | Tampilan Pomodoro & modal pengaturan |
| `fix/` | `fix/popup-dimensions-overflow`| Perbaikan bug visual atau fungsional |
| `docs/` | `docs/architecture-and-specs` | Pembaruan panduan teknis atau dokumentasi |
| `chore/` | `chore/packaging-zip-script` | Pembaruan build pipeline atau skrip packager |

---

## 🔄 Siklus Alur Kerja Pengembangan Fitur

```mermaid
graph LR
    MAIN[main branch (stable)] -->|checkout -b feat/...| FEAT[feat/... branch]
    FEAT --> CODE[TDD / Implementation]
    CODE --> VERIFY[Quality Gate Verification]
    VERIFY --> DOCS[Update CHANGELOG & PROGRESS & DEV_LOG]
    DOCS --> MERGE[Merge to main]
    MERGE --> MAIN
```

### Langkah 1: Buat Branch Terisolasi
Pastikan `main` berada di commit terbaru, lalu buat branch fitur:
```bash
git checkout main
git pull origin main
git checkout -b feat/<nama-fitur>
```

### Langkah 2: Implementasi Kode
Terapkan perubahan dengan mematuhi prinsip arsitektur di [docs/ARCHITECTURE.md](ARCHITECTURE.md).

### Langkah 3: Gerbang Kualitas & Verifikasi (Quality Gate)
Sebelum menggabungkan branch ke `main`, seluruh verifikasi berikut **wajib lulus 100%**:
```bash
# 1. Jalankan Unit Tests
npm test

# 2. Compile & Bundle Ekstensi Vite
npm run build

# 3. Uji Packaging Distribusi Zip
npm run package:zip
```

### Langkah 4: Dokumentasikan Pembaruan
Perbarui berkas dokumentasi wajib sebelum merge:
1. `docs/PROGRESS.md`: Tandai sub-tugas yang telah selesai.
2. `docs/DEV_LOG.md`: Catat keputusan teknis, akar masalah, dan hasil verifikasi.
3. `CHANGELOG.md`: Catat perubahan rilis publik.

### Langkah 5: Merge ke `main`
```bash
git checkout main
git merge feat/<nama-fitur> --no-ff -m "merge: feat(<nama-fitur>) into main"
```
