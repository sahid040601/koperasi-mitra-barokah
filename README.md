# Koperasi Mitra Barokah

WebApp koperasi + POS/Kasir berbasis Node.js, Express, SQLite, dan UI responsif.

## Struktur

```text
koperasi-mitra-barokah/
├── package.json
├── server.js
├── public/
│   ├── index.html
│   └── app.js
├── render.yaml
├── .env.example
└── data/
```

## Jalankan lokal

```bash
npm install
cp .env.example .env
# isi JWT_SECRET dan password awal
npm start
```

Buka `http://localhost:3000`.

## Deploy gratis di Render

Repository sudah memakai source Node.js langsung sehingga Render tidak perlu mengekstrak bundle.

- Runtime: **Node**
- Branch: **main**
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check: `/api/health`
- Plan: **Free**

Environment secret yang wajib diisi di Render:

- `JWT_SECRET` — minimal 32 karakter acak
- `INITIAL_ADMIN_PASSWORD`
- `INITIAL_MANAJER_PASSWORD`
- `INITIAL_PENGAWAS_PASSWORD`
- `INITIAL_NASABAH_PASSWORD`

`NODE_ENV` dan `CORS_ORIGIN` sudah disiapkan oleh `render.yaml`.

## Catatan database

Versi ini memakai SQLite pada folder `data/`. Filesystem Render Free bersifat ephemeral, sehingga cocok untuk demo/testing tetapi **tidak untuk data koperasi produksi** tanpa penyimpanan/database persisten.

## Keamanan

- JWT secret tidak memiliki fallback yang lemah.
- CORS dibatasi lewat `CORS_ORIGIN`.
- Rate limit login dan pendaftaran publik aktif.
- Password awal tidak ditanam di source code.
- Header keamanan dasar dan batas body request aktif.
