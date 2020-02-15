//https://qiita.com/umamichi/items/0e2b4b1c578e7335ba20
self.addEventListener('install', function(e){console.log('[ServiceWorker] Install');});
self.addEventListener('activate', function(e){console.log('[ServiceWorker] Activate');});

self.addEventListener('fetch', function(event){});
