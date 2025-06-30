const CACHE_NAME = 'ular-tangga-cache-v2';
// Daftar file yang akan di-cache untuk mode offline
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'LudoSnake-192.png',
  'LudoSnake-512.png'
];

// Event 'install': Dijalankan saat service worker pertama kali diinstal
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka');
        return cache.addAll(urlsToCache); // Menambahkan semua file ke cache
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Event 'fetch': Dijalankan setiap kali ada permintaan jaringan (request)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika file ditemukan di cache, kembalikan dari cache
        if (response) {
          return response;
        }
        // Jika tidak, coba ambil dari jaringan
        return fetch(event.request);
      }
    )
  );
});