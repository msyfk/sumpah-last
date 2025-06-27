# Story App

Aplikasi berbasis web untuk berbagi cerita dengan fitur lokasi. Dibangun dengan JavaScript vanilla dan arsitektur Model-View-Presenter (MVP).

## Struktur Proyek

```
story-app/
├── src/
│   ├── components/     # Komponen UI yang dapat digunakan kembali
│   ├── models/         # Pengelolaan data dan komunikasi dengan API
│   ├── presenters/     # Penghubung antara Model dan View
│   ├── pages/          # Halaman-halaman aplikasi
│   ├── services/       # Layanan API
│   ├── utils/          # Fungsi utilitas
│   ├── App.js          # Entry point aplikasi
│   ├── App.css         # Styling utama
│   └── index.js        # Bootstrap aplikasi
├── index.html          # File HTML utama
└── package.json        # Konfigurasi proyek
```

## Fitur

- Autentikasi (Login/Register)
- Melihat daftar cerita
- Menambahkan cerita baru dengan foto
- Mengambil foto menggunakan kamera
- Menambahkan lokasi pada cerita
- Melihat lokasi cerita pada peta

## Teknologi

- JavaScript Vanilla
- Arsitektur Model-View-Presenter (MVP)
- Leaflet.js untuk peta
- Single Page Application (SPA)
- Aksesibilitas sesuai standar WCAG

