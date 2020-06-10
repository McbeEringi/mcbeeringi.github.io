//https://qiita.com/masanarih0ri/items/0845f312cff5c8d0ec60
const STATIC_DATA = [
	'ocr.html',
	'/img/test.png'
];

self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open('cache_v1').then(function(cache) {
			return cache.addAll(STATIC_DATA);
		})
	);
	console.log('[ServiceWorker] Install');
});
self.addEventListener('activate', function(e){console.log('[ServiceWorker] Activate');});
self.addEventListener('fetch', function(e) {
	console.log(e.request.url);
	e.respondWith(
		caches.match(e.request).then(function(response) {
			return response || fetch(e.request);
		})
	);
});
