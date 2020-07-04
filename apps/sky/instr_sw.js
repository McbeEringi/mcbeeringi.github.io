//https://qiita.com/masanarih0ri/items/0845f312cff5c8d0ec60
const STATIC_DATA = [
	'instr.html',
	'https://cdnjs.cloudflare.com/ajax/libs/tone/14.5.45/Tone.js',
	'https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js',
	'instr.png',
	'sky_main.js',
	'sky_style.css',
	'/audio/harp/a2.mp3',
	'/audio/harp/a3.mp3',
	'/audio/harp/ds2.mp3',
	'/audio/harp/ds3.mp3'
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
