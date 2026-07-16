# Project_POS_Maduramart

Project_POS_Maduramart adalah aplikasi POS (Point of Sale) sederhana berbasis Node.js, Express, TypeScript, dan SQLite. Proyek ini dibuat untuk simulasi alur bisnis kasir, mulai dari seeding data, transaksi, hingga laporan penjualan.

> [!WARNING]
> **Status Proyek: Proof of Concept (PoC)**
> Proyek ini saat ini masih dalam tahap PoC (simulasi/dasar). Jika Anda tertarik untuk mengembangkan fitur-fiturnya lebih lanjut ke tahap production/development yang lebih matang, silakan fork repository ini dan mari berkontribusi!

## Fitur Utama

- Seed data dummy untuk user, kategori, dan produk
- Proses transaksi kasir
- Laporan penjualan
- UI sederhana langsung dari browser

## Teknologi yang Digunakan

- Node.js
- Express
- TypeScript
- SQLite3
- CORS

## Cara Memulai (Setup & Run)

Jika ingin mencoba atau mengembangkan proyek ini di komputer lokal Anda, ikuti langkah-langkah berikut:

1. **Fork Repository Ini**  
   Klik tombol **Fork** di pojok kanan atas halaman GitHub ini untuk membuat salinan di akun Anda.

2. **Clone Repository**  
   Clone hasil fork tersebut ke komputer lokal (ganti `USERNAME` dengan username GitHub Anda):

   ```bash
   git clone https://github.com/USERNAME/Project_POS_Maduramart.git
   ```

3. **Masuk ke Folder & Install Dependencies**

   ```bash
   cd Project_POS_Maduramart
   npm install
   ```

4. **Jalankan Aplikasi**

   ```bash
   npm run dev
   ```

5. **Akses di Browser**  
   Buka browser Anda dan akses: http://localhost:3000

## Contoh Alur Penggunaan

- Klik **Jalankan Seeder** untuk mengisi data dummy awal.
- Klik **Proses Transaksi Kasir** untuk mensimulasikan pembuatan transaksi baru.
- Klik **Lihat Laporan Penjualan** untuk melihat rekapitulasi hasil transaksi.

## Struktur Singkat Endpoint API

- `POST /api/seed` → Membuat data dummy (users, categories, products)
- `POST /api/transactions` → Memproses transaksi kasir baru
- `GET /api/reports/sales` → Mengambil data laporan penjualan

## Catatan Tambahan

- Database menggunakan SQLite lokal (file database akan otomatis terbuat saat aplikasi dijalankan).
- Pastikan Node.js sudah terpasang di komputer Anda sebelum menjalankan proyek.
- Jika ingin memodifikasi logika bisnis, rute API, atau UI, Anda bisa melakukan perubahan di dalam folder `src/`.

## Kontribusi & Pengembangan Lebih Lanjut

Karena proyek ini masih berstatus PoC, pintu kontribusi terbuka sangat lebar! Beberapa hal yang bisa ditingkatkan antara lain:

- Validasi data yang lebih ketat menggunakan library seperti Zod atau Joi.
- Penambahan fitur autentikasi (Login/Logout) untuk kasir dan admin.
- Integrasi ke database yang lebih scalable (misal: PostgreSQL/MySQL).
- Perbaikan UI/UX agar lebih interaktif.

Silakan buat Pull Request (PR) jika Anda memiliki peningkatan fitur atau perbaikan bug!

## Lisensi

Proyek ini bersifat open-source dan dapat digunakan secara bebas sebagai bahan pembelajaran maupun dasar pengembangan lebih lanjut.
