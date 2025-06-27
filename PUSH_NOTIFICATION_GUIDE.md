# Push Notification Implementation Guide

## Overview
Implementasi push notification pada STORYAPP2 menggunakan Web Push API dengan VAPID keys dari Dicoding Story API.

## VAPID Public Key
```
BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk
```

## File Structure
```
STORYAPP2/
├── public/
│   ├── manifest.json          # Web App Manifest untuk PWA
│   └── sw.js                  # Service Worker untuk push notification
├── src/
│   ├── components/
│   │   └── PushNotificationManager.js  # Komponen UI untuk mengelola notifikasi
│   ├── pages/
│   │   └── SettingsPage.js    # Halaman pengaturan notifikasi
│   ├── services/
│   │   └── pushNotificationService.js  # Service untuk push notification
│   └── main.js                # Inisialisasi service worker
└── index.html                 # Manifest dan meta tags PWA
```

## Features Implemented

### 1. Service Worker (public/sw.js)
- **Caching**: Cache aplikasi untuk offline functionality
- **Push Event Handler**: Menangani push notification yang masuk
- **Notification Click Handler**: Menangani klik pada notifikasi
- **Background Sync**: Untuk sinkronisasi data offline

### 2. Push Notification Service (src/services/pushNotificationService.js)
- **Browser Support Check**: Mengecek dukungan push notification
- **Service Worker Registration**: Mendaftarkan service worker
- **Subscription Management**: Subscribe/unsubscribe push notification
- **VAPID Key Conversion**: Konversi VAPID public key ke format yang benar
- **Server Communication**: Komunikasi dengan API untuk subscription

### 3. UI Components (src/components/PushNotificationManager.js)
- **Status Indicator**: Menampilkan status notifikasi (aktif/tidak aktif)
- **Toggle Button**: Tombol untuk mengaktifkan/menonaktifkan notifikasi
- **Permission Request**: Meminta izin notifikasi dari user
- **Test Notification**: Mengirim notifikasi test

### 4. Settings Page (src/pages/SettingsPage.js)
- **Notification Settings**: Pengaturan push notification
- **Account Information**: Informasi akun user
- **Browser Support Info**: Informasi dukungan browser
- **App Information**: Informasi aplikasi

### 5. PWA Support
- **Web App Manifest**: Konfigurasi PWA
- **Theme Colors**: Warna tema aplikasi
- **Icons**: Icon aplikasi untuk berbagai ukuran
- **Installable**: Aplikasi dapat diinstall sebagai PWA

## How to Use

### 1. Login ke Aplikasi
- Buka aplikasi di browser
- Login dengan akun yang valid
- Push notification hanya tersedia untuk user yang login

### 2. Aktifkan Push Notification
- Setelah login, akan muncul Push Notification Manager di homepage
- Atau buka halaman "Pengaturan" dari menu navigasi
- Klik tombol "Aktifkan Notifikasi"
- Browser akan meminta izin untuk menampilkan notifikasi
- Klik "Allow" untuk mengizinkan

### 3. Test Notification
- Setelah notifikasi diaktifkan, akan muncul test notification
- Notifikasi akan muncul dengan judul "Story App Test"
- Klik notifikasi untuk membuka aplikasi

### 4. Manage Subscription
- Status subscription disimpan di localStorage sebagai fallback
- Subscription dikirim ke server jika endpoint tersedia
- User dapat menonaktifkan notifikasi kapan saja

## Browser Support

### Supported Features
- ✅ Service Worker
- ✅ Push Manager API
- ✅ Notification API
- ✅ Web App Manifest
- ✅ Background Sync

### Browser Compatibility
- ✅ Chrome 50+
- ✅ Firefox 44+
- ✅ Safari 16+ (with limitations)
- ✅ Edge 17+
- ❌ Internet Explorer (not supported)

## API Integration

### Subscription Endpoint
```javascript
POST https://story-api.dicoding.dev/v1/push/subscribe
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
Body: {
  subscription: {
    endpoint: "...",
    keys: {
      p256dh: "...",
      auth: "..."
    }
  }
}
```

### Unsubscribe Endpoint
```javascript
POST https://story-api.dicoding.dev/v1/push/unsubscribe
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'
}
Body: {
  subscription: { ... }
}
```

## Testing

### Manual Testing
1. Open application in browser
2. Login with valid credentials
3. Navigate to Settings page
4. Check browser support information
5. Enable push notifications
6. Verify test notification appears
7. Test notification click behavior

### Browser DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Check Service Workers section
4. Verify service worker is registered and active
5. Check Push Messaging section for subscription details

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Check browser console for errors
   - Ensure HTTPS or localhost
   - Verify sw.js file exists in public folder

2. **Permission Denied**
   - Check browser notification settings
   - Reset site permissions if needed
   - Try in incognito mode

3. **Subscription Failed**
   - Verify VAPID public key is correct
   - Check network connectivity
   - Ensure user is logged in

4. **Notifications Not Appearing**
   - Check browser notification settings
   - Verify Do Not Disturb mode is off
   - Test with different browsers

### Debug Tips
- Use browser DevTools Console for error messages
- Check Application > Service Workers for registration status
- Monitor Network tab for API calls
- Use Push Messaging section in DevTools

## Security Considerations

1. **VAPID Keys**: Public key is safe to expose, private key must be kept secret
2. **User Consent**: Always request permission before subscribing
3. **HTTPS Required**: Push notifications only work over HTTPS
4. **Token Validation**: Verify user authentication before subscription

## Future Enhancements

1. **Rich Notifications**: Add images, actions, and custom data
2. **Notification Categories**: Different types of notifications
3. **Scheduling**: Schedule notifications for specific times
4. **Analytics**: Track notification engagement
5. **Personalization**: Customize notifications based on user preferences
