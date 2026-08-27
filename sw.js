const CACHE_NAME = 'trig-quiz-v86';
const APP_FILES = [
    './',
    './index.html',
    './manifest.webmanifest',
    './css/style.css?v=86',
    './css/height-compact.css?v=86',
    './js/trig-data.js?v=86',
    './js/audio.js',
    './js/unit-circle.js?v=86',
    './js/pwa.js',
    './js/app.js?v=86',
    './assets/start-face.png',
    './assets/plant-growth-sprites-v1.png'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
});
