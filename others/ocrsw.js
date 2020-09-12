//https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Offline_Service_workers
//https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja
const cacheName='ocr_cache',STATIC_DATA=[
	'ocr.html',
	'https://unpkg.com/tesseract.js@v2.0.2/dist/tesseract.min.js',
	'ocr_/test.png'
];

self.addEventListener('install',(e)=>{
	e.waitUntil(
		caches.open(cacheName).then((cache)=>{
			return cache.addAll(STATIC_DATA);
		})
	);
	console.log('[ServiceWorker] Install');
});
self.addEventListener('activate',(e)=>{
	console.log('[ServiceWorker] Activate')
	e.waitUntil(
		caches.keys().then((keyList)=>{
			return Promise.all(keyList.map((key)=>{
				if(key !== cacheName){return caches.delete(key);}
			}));
		})
	);
});
self.addEventListener('fetch',(e)=>{
	e.respondWith(
		caches.match(e.request).then((r)=>{
			console.log('[ServiceWorker] Fetching resource: '+e.request.url);
			return r || fetch(e.request).then((response)=>{
				return caches.open(cacheName).then((cache)=>{
					console.log('[ServiceWorker] Caching new resource: '+e.request.url);
					cache.put(e.request,response.clone());
					return response;
				});
			});
		})
	);
});
