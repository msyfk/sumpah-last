# Push Notification Testing Checklist

## 🧪 Testing Checklist untuk Push Notification

### Pre-requisites
- [ ] Aplikasi berjalan di `http://localhost:5174/`
- [ ] Browser mendukung push notifications (Chrome, Firefox, Safari 16+, Edge)
- [ ] HTTPS atau localhost (required untuk push notifications)

### 1. Basic Functionality Test

#### Service Worker Registration
- [ ] Buka DevTools > Application > Service Workers
- [ ] Pastikan service worker terdaftar dengan scope "/"
- [ ] Status harus "activated and running"

#### Browser Support Check
- [ ] Buka halaman Settings
- [ ] Periksa section "Dukungan Browser"
- [ ] Semua fitur harus menunjukkan "✅ Didukung"
- [ ] Notification Permission harus "default", "granted", atau "denied"

### 2. User Flow Test

#### Login dan Akses
- [ ] Login dengan akun valid
- [ ] Push Notification Manager muncul di homepage
- [ ] Link "Pengaturan" tersedia di navbar

#### Aktivasi Push Notification
- [ ] Klik tombol "Aktifkan Notifikasi"
- [ ] Browser meminta permission untuk notifications
- [ ] Klik "Allow" untuk mengizinkan
- [ ] Status berubah menjadi "Notifikasi Aktif"
- [ ] Test notification muncul dalam 1-2 detik
- [ ] Tombol berubah menjadi "Matikan Notifikasi" (merah)

#### Test Notification
- [ ] Test notification muncul dengan:
  - Title: "Story App Test"
  - Body: "Push notification berhasil diaktifkan!"
  - Icon: Vite logo
- [ ] Klik notification membuka/fokus aplikasi
- [ ] Notification hilang otomatis setelah 5 detik

### 3. Settings Page Test

#### Navigation
- [ ] Klik "Pengaturan" di navbar
- [ ] Halaman settings terbuka
- [ ] Push Notification Manager tersedia

#### Debug Information
- [ ] Section "Debug Information" tersedia
- [ ] Klik "Refresh Debug Info"
- [ ] Informasi debug ter-update:
  - Service Supported: Yes
  - Service Worker Registered: Yes
  - Currently Subscribed: Yes
  - Local Subscription: Yes
  - VAPID Public Key: BCCs2eonMI-6H2c...

#### Browser Support Info
- [ ] Service Worker: ✅ Didukung
- [ ] Push Manager: ✅ Didukung
- [ ] Notification API: ✅ Didukung
- [ ] Notification Permission: granted

### 4. Deactivation Test

#### Matikan Notifikasi
- [ ] Klik tombol "Matikan Notifikasi"
- [ ] Status berubah menjadi "Notifikasi Tidak Aktif"
- [ ] Tombol berubah menjadi "Aktifkan Notifikasi" (biru)
- [ ] Debug info menunjukkan "Currently Subscribed: No"

### 5. Error Handling Test

#### Permission Denied
- [ ] Reset browser permissions untuk site
- [ ] Coba aktifkan notifikasi
- [ ] Klik "Block" saat browser meminta permission
- [ ] Error message muncul: "Izin notifikasi ditolak..."

#### Browser Not Supported
- [ ] Test di browser lama (jika tersedia)
- [ ] Pesan "Browser Anda tidak mendukung push notification" muncul
- [ ] Tombol disabled

### 6. Persistence Test

#### Refresh Page
- [ ] Aktifkan push notification
- [ ] Refresh halaman
- [ ] Status tetap "Notifikasi Aktif"
- [ ] Debug info tetap menunjukkan subscription active

#### Close/Reopen Browser
- [ ] Aktifkan push notification
- [ ] Tutup browser
- [ ] Buka browser dan akses aplikasi
- [ ] Login kembali
- [ ] Status push notification tetap aktif

### 7. Console Testing

#### Load Test Script
- [ ] Buka DevTools > Console
- [ ] Copy-paste isi file `test-push-notification.js`
- [ ] Jalankan script
- [ ] Periksa semua test results

#### Manual Functions
- [ ] Jalankan `testNotification()` jika tersedia
- [ ] Jalankan `requestPermission()` jika permission belum granted
- [ ] Jalankan `testSWMessage()` untuk test service worker messaging

### 8. Network Test

#### API Calls
- [ ] Buka DevTools > Network
- [ ] Aktifkan push notification
- [ ] Periksa request ke `https://story-api.dicoding.dev/v1/push/subscribe`
- [ ] Jika endpoint tidak tersedia (404), subscription tetap tersimpan di localStorage

#### Offline Test
- [ ] Aktifkan push notification
- [ ] Disconnect internet
- [ ] Refresh halaman
- [ ] Aplikasi tetap berfungsi (cached)
- [ ] Push notification status tetap tersimpan

### 9. Mobile Test (Opsional)

#### Mobile Browser
- [ ] Akses aplikasi di mobile browser
- [ ] Login dan test push notification
- [ ] UI responsive dan dapat digunakan
- [ ] Notification muncul di mobile

#### PWA Install
- [ ] Browser menampilkan "Install App" prompt
- [ ] Install aplikasi sebagai PWA
- [ ] Push notification berfungsi di PWA

### 10. Cross-Browser Test

#### Chrome
- [ ] Semua fitur berfungsi
- [ ] Service worker registered
- [ ] Push notification aktif

#### Firefox
- [ ] Semua fitur berfungsi
- [ ] Service worker registered
- [ ] Push notification aktif

#### Safari (16+)
- [ ] Basic functionality berfungsi
- [ ] Beberapa keterbatasan mungkin ada

#### Edge
- [ ] Semua fitur berfungsi
- [ ] Service worker registered
- [ ] Push notification aktif

## 🐛 Common Issues & Solutions

### Issue: Service Worker tidak terdaftar
**Solution:** 
- Pastikan file `public/sw.js` ada
- Periksa console untuk error
- Pastikan HTTPS atau localhost

### Issue: Permission denied
**Solution:**
- Reset site permissions di browser settings
- Coba di incognito mode
- Pastikan Do Not Disturb mode off

### Issue: Notification tidak muncul
**Solution:**
- Periksa browser notification settings
- Pastikan permission granted
- Test di browser lain

### Issue: Debug info error
**Solution:**
- Refresh halaman
- Periksa console untuk error detail
- Pastikan service worker active

## ✅ Success Criteria

Implementasi dianggap berhasil jika:
- [ ] Service worker terdaftar dan aktif
- [ ] Push subscription berhasil dengan VAPID key
- [ ] Test notification muncul dan dapat diklik
- [ ] UI responsive dan user-friendly
- [ ] Error handling berfungsi dengan baik
- [ ] Debug information akurat
- [ ] Persistence berfungsi setelah refresh
- [ ] Cross-browser compatibility

## 📊 Test Results Template

```
=== PUSH NOTIFICATION TEST RESULTS ===
Date: ___________
Browser: ___________
Version: ___________

✅ Service Worker Registration: PASS/FAIL
✅ Push Subscription: PASS/FAIL  
✅ Test Notification: PASS/FAIL
✅ Permission Handling: PASS/FAIL
✅ UI Functionality: PASS/FAIL
✅ Error Handling: PASS/FAIL
✅ Persistence: PASS/FAIL
✅ Debug Information: PASS/FAIL

Notes: ___________
```

---

**Happy Testing! 🧪✨**
