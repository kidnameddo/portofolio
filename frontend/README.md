# Portofolio Rodo Lemuel Nadeak

Frontend React/Vite untuk portofolio publik dan dashboard admin. Halaman publik dimulai dengan prompt chatbot Gemini; tekan tombol **Lihat!** untuk membuka portofolio.

## Menjalankan secara lokal

Prasyarat: Node.js yang didukung Vite 8, PHP dengan ekstensi `mysqli` dan `curl`, serta MySQL.

1. Jalankan MySQL, lalu siapkan database. Tidak wajib membuat database melalui phpMyAdmin: skrip migrasi membuat database, tabel, dan akun admin otomatis:

   ```powershell
   cd D:\portofolio\porto\backend
   php migration\main.php
   ```

   phpMyAdmin hanya pilihan jika ingin mengelola MySQL lewat antarmuka visual. Perintah ini membutuhkan akun MySQL sesuai pengaturan di `backend/library/dbconnection.php`.

   **Peringatan penting:** migrasi saat ini menghapus lalu membuat ulang database `portofolio`, termasuk seluruh data yang ada di dalamnya. Jalankan hanya untuk instalasi baru atau setelah mencadangkan data.

2. Buat API key baru di Google AI Studio dan aktifkan Gemini API untuk proyeknya. Buka `D:\portofolio\porto\backend\.env`, lalu tempel key setelah `GEMINI_API_KEY=` dan simpan. Key yang pernah dibagikan di percakapan harus dicabut dari Google AI Studio dan jangan digunakan kembali. Setelah itu, jalankan server backend:

   ```powershell
   cd D:\portofolio\porto\backend
   php -S localhost:8000 index.php
   ```

   Jangan tempel key ke source code frontend atau masukkan ke bundle browser. File `backend/.env` hanya dibaca backend dan diabaikan Git. Model default adalah `gemini-2.5-flash`; bila ingin memilih model lain, set `GEMINI_MODEL` pada environment terminal backend.

   ```powershell
   $env:GEMINI_MODEL = "gemini-2.5-flash"
   ```

3. Di terminal lain, jalankan frontend:

   ```powershell
   cd D:\portofolio\porto\frontend
   npm install
   npm run dev
   ```

4. Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

Endpoint Gemini backend adalah `/chat`. Chatbot menampilkan pesan error yang berbeda bila API key belum diatur, key ditolak, kuota habis, atau model tidak tersedia. Ekstensi PHP cURL harus aktif. Akun admin migrasi lokal: `admin` / `admin123`.

Chatbot dibatasi ke informasi Rodo dan isi portofolionya; pertanyaan di luar topik akan ditolak. Backend harus dimulai ulang dari terminal yang sudah mengatur `GEMINI_API_KEY` agar chatbot dapat mengakses key tersebut.

## Deploy ke hosting PHP/Apache

1. Atur `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, dan `GEMINI_API_KEY` di `backend/.env` pada server hosting. Jangan unggah file `.env` ke GitHub. Pastikan database dan tabel sudah disiapkan; `backend/migration/main.php` menghapus database yang ada dan hanya cocok untuk instalasi baru.
2. Unggah isi folder `backend` ke direktori API, misalnya `public_html/api`. File `.htaccess` mengarahkan endpoint API ke router PHP dan melindungi file `.env`.
3. Atur `VITE_API_BASE_URL` ke URL publik direktori API, misalnya `https://contoh.com/api`, sebelum build:

   ```powershell
   $env:VITE_API_BASE_URL = "https://contoh.com/api"
   npm run build
   ```

4. Unggah isi `frontend/dist` ke document root situs. File `.htaccess` frontend mengarahkan rute React ke `index.html`.

Nilai `VITE_API_BASE_URL` masuk ke bundle browser dan harus berisi URL API publik saja, bukan rahasia. Jangan masukkan API key Gemini ke variabel `VITE_*`.
