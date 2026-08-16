# Catatan Ceklis Suara

Aplikasi Android sederhana untuk membuat dan mencentang catatan dengan suara.

## Fitur

- Bicara dalam Bahasa Indonesia untuk membuat beberapa checklist sekaligus.
- Perintah suara seperti `tambah`, `buat`, `catat`, `centang`, `selesai`, `sudah`, `hapus`, dan `bersihkan selesai`.
- Input manual sebagai cadangan.
- Data checklist disimpan lokal di perangkat sehingga tetap ada saat aplikasi dibuka kembali.
- Tombol Hapus Selesai dan Kosongkan.

## Contoh suara

`Beli beras, beli minyak, beli telur`

Kemudian:

`Centang beli beras dan beli telur`

## Build APK

Workflow GitHub Actions akan membuat `app-debug.apk` pada branch `android-catatan-ceklis-suara`. Artifact dapat diambil dari tab **Actions** setelah build selesai.

## Catatan izin

Aplikasi meminta izin mikrofon karena fitur pengenalan suara menggunakan `SpeechRecognizer` Android. Ketersediaan pengenalan suara mengikuti layanan yang tersedia di perangkat Android.
