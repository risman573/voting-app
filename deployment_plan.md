# Rencana Deployment

## Deployment Frontend ke Vercel:
1. Perbarui endpoint API di `src/App.js` untuk menggunakan URL produksi yang sesuai.
2. Gunakan CLI Vercel untuk melakukan deployment:
   - Jalankan `vercel` di terminal dan ikuti petunjuk untuk menyelesaikan deployment.

## Deployment Backend ke Clever Cloud:
1. Pastikan file `.env` di direktori backend sudah dikonfigurasi dengan benar.
2. Gunakan CLI Clever Cloud untuk melakukan deployment:
   - Jalankan `clever deploy` di terminal untuk melakukan deployment layanan backend.

## Langkah Tindak Lanjut:
- Verifikasi bahwa frontend dan backend berfungsi dengan baik setelah deployment.
- Uji endpoint API dari frontend untuk memastikan komunikasi dengan backend berjalan lancar.
