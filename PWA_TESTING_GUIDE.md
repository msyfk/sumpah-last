# PWA Testing Guide - Story App

## Kriteria PWA yang Harus Dipenuhi

### 1. Mengadopsi Arsitektur Application Shell ✅
- [x] Memisahkan bagian konten statis (header, footer, navigation) dan dinamis (content area)
- [x] Shell components di-cache untuk akses offline
- [x] Loading indicator untuk transisi konten dinamis

### 2. Aplikasi Dapat Dipasang ke Homescreen ✅
- [x] Web App Manifest dengan konfigurasi lengkap
- [x] Service Worker terdaftar dan aktif
- [x] Icons dalam berbagai ukuran (72x72, 96x96, 192x192, 512x512)
- [x] Custom install prompt dengan beforeinstallprompt event
- [x] Support untuk iOS Safari dengan instruksi manual

### 3. Aplikasi Dapat Diakses Offline ✅
- [x] Service Worker dengan caching strategies
- [x] Cache First untuk Application Shell
- [x] Network First untuk API calls dengan fallback
- [x] Offline fallback pages
- [x] Offline image placeholder

## Testing Checklist

### A. Installability Test
1. **Desktop Chrome/Edge:**
   - [ ] Buka aplikasi di browser
   - [ ] Periksa apakah muncul install button di address bar
   - [ ] Klik install dan verifikasi app terbuka sebagai standalone
   - [ ] Periksa apakah custom install button muncul di pojok kanan bawah

2. **Mobile Chrome/Safari:**
   - [ ] Buka aplikasi di mobile browser
   - [ ] Untuk Chrome: Periksa "Add to Home Screen" di menu
   - [ ] Untuk Safari: Periksa instruksi iOS install yang muncul
   - [ ] Install dan verifikasi app berjalan dalam standalone mode

### B. Offline Functionality Test
1. **Application Shell:**
   - [ ] Load aplikasi dengan koneksi internet
   - [ ] Matikan koneksi internet
   - [ ] Refresh halaman - shell harus tetap muncul
   - [ ] Navigation harus tetap berfungsi
   - [ ] Header dan footer harus tetap tampil

2. **Content Caching:**
   - [ ] Buka beberapa halaman dengan koneksi internet
   - [ ] Matikan koneksi internet
   - [ ] Navigasi ke halaman yang sudah dikunjungi - harus tetap bisa diakses
   - [ ] Coba akses halaman baru - harus muncul offline fallback

3. **API Fallback:**
   - [ ] Load data stories dengan koneksi internet
   - [ ] Matikan koneksi internet
   - [ ] Refresh halaman - data yang sudah di-cache harus tetap muncul
   - [ ] Coba aksi yang memerlukan API - harus muncul pesan offline yang sesuai

### C. Service Worker Test
1. **Registration:**
   - [ ] Buka Developer Tools > Application > Service Workers
   - [ ] Verifikasi service worker terdaftar dan aktif
   - [ ] Periksa scope: "/"

2. **Caching:**
   - [ ] Buka Developer Tools > Application > Storage > Cache Storage
   - [ ] Verifikasi ada cache: story-app-static-v2, story-app-dynamic-v2, story-app-images-v2
   - [ ] Periksa isi cache sesuai dengan yang diharapkan

### D. Manifest Test
1. **Manifest Properties:**
   - [ ] Buka Developer Tools > Application > Manifest
   - [ ] Verifikasi semua properties terisi dengan benar
   - [ ] Periksa icons dalam berbagai ukuran
   - [ ] Verifikasi display: "standalone"
   - [ ] Periksa theme_color dan background_color

### E. Performance Test
1. **Loading Performance:**
   - [ ] Buka Developer Tools > Lighthouse
   - [ ] Run PWA audit
   - [ ] Skor PWA harus > 90
   - [ ] Periksa semua PWA criteria terpenuhi

2. **Offline Performance:**
   - [ ] Matikan koneksi internet
   - [ ] Navigasi antar halaman harus cepat (< 1 detik)
   - [ ] Tidak ada broken UI elements
   - [ ] Loading indicators berfungsi dengan baik

## Manual Testing Commands

### 1. Start Development Server
```bash
npm run dev
```

### 2. Build for Production
```bash
npm run build
npm run preview
```

### 3. Test Service Worker
```javascript
// Di browser console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});

// Check cache
caches.keys().then(cacheNames => {
  console.log('Cache Names:', cacheNames);
});
```

### 4. Test Install Prompt
```javascript
// Di browser console
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt available');
});
```

### 5. Simulate Offline
- Chrome DevTools > Network > Throttling > Offline
- Atau gunakan: `navigator.onLine` untuk check status

## Expected Results

### ✅ PWA Criteria Met:
1. **Application Shell Architecture**: Static shell cached separately from dynamic content
2. **Installable**: Custom install prompt + native browser install option
3. **Offline Capable**: All UI elements work offline, graceful degradation for network requests

### 🔧 Key Features:
- Service Worker dengan multiple caching strategies
- Offline fallback pages dan images
- Custom install prompt dengan iOS support
- Progressive enhancement untuk berbagai browser
- Responsive design untuk semua device sizes

## Troubleshooting

### Common Issues:
1. **Service Worker tidak register**: Periksa path `/sw.js` dan HTTPS requirement
2. **Install prompt tidak muncul**: Pastikan manifest valid dan service worker aktif
3. **Offline tidak berfungsi**: Periksa cache strategy dan network fallback
4. **Icons tidak muncul**: Verifikasi path icons dan manifest configuration

### Debug Tools:
- Chrome DevTools > Application tab
- Lighthouse PWA audit
- Service Worker debugging
- Network throttling untuk test offline
