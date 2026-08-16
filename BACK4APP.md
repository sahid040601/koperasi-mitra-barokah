# Deploy Koperasi Mitra Barokah ke Back4app (Gratis, tanpa kartu)

Back4app Containers menyediakan Free plan untuk container, deployment dari GitHub, dan menyatakan Free tier tidak memerlukan kartu kredit.

## Pengaturan
- Repository: `sahid040601/koperasi-mitra-barokah`
- Branch: `main`
- Deployment: GitHub
- Dockerfile: `Dockerfile` di root repository
- Port aplikasi: `3000`
- Start command di container: `npm start`

## Environment Variables
Wajib:
- `JWT_SECRET` = secret acak minimal 32 karakter
- `INITIAL_ADMIN_PASSWORD`
- `INITIAL_MANAJER_PASSWORD`
- `INITIAL_PENGAWAS_PASSWORD`
- `INITIAL_NASABAH_PASSWORD`

Opsional:
- `DATA_DIR=/app/data`
- `CORS_ORIGIN` = URL publik aplikasi jika akses API lintas origin diperlukan

## Catatan
SQLite berada di filesystem container. Untuk demo/testing ini cukup, tetapi untuk produksi dengan data koperasi penting gunakan database persisten/terkelola.
