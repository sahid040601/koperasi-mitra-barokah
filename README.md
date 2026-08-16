# Koperasi Mitra Barokah

WebApp Koperasi Mitra Barokah — Dashboard, Anggota, Simpanan, Pinjaman, Kasir/POS, Laporan, Pengguna, dan autentikasi JWT.

## Versi yang di-deploy
Repository ini sekarang berisi bundle aplikasi **UI/UX + Kasir/POS + hardening keamanan** terbaru yang kita siapkan. Sumber aplikasi disimpan sebagai `app-release.tar.gz` dan diekstrak otomatis saat deployment Render.

## Deploy gratis ke Render
1. Hubungkan repository ini ke Render.
2. Pilih **New Web Service** dan repository `sahid040601/koperasi-mitra-barokah`.
3. Render akan membaca `render.yaml`.
4. Isi environment variable `JWT_SECRET` dengan random secret minimal 32 byte.
5. Setelah deploy selesai, buka URL `https://koperasi-mitra-barokah.onrender.com` (atau URL Render yang diberikan).

## Akun demo
- admin / admin123
- manajer / manajer123
- pengawas / pengawas123
- KMB-0001 / nasabah123

**Ganti semua password demo sebelum dipakai untuk data sungguhan.**

## Catatan keamanan
- Jangan commit `.env` atau secret asli.
- Backend wajib memakai HTTPS saat diakses publik.
- SQLite pada filesystem ephemeral cocok untuk demo/testing; untuk produksi dengan data penting, pindahkan database ke layanan PostgreSQL/MySQL yang persisten.

## Fitur UI
- Dashboard KPI koperasi
- Anggota dan pendaftaran baru
- Simpanan
- Pinjaman dan angsuran
- Kasir/POS modern dengan katalog, keranjang, qty, diskon, metode pembayaran dan total
- Laporan
- Manajemen pengguna berbasis role
- Logo resmi Koperasi Mitra Barokah
