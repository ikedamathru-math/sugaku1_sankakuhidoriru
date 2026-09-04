const CACHE_NAME = 'trig-quiz-v156-achievement-sequence-fix';
const APP_FILES = [
    './',
    './index.html',
    './manifest.webmanifest',
    './css/style.css?v=156',
    './css/height-compact.css?v=156',
    './js/trig-data.js?v=156',
    './js/audio.js?v=156',
    './js/unit-circle.js?v=156',
    './js/pwa.js?v=156',
    './js/app.js?v=156',
    './assets/start-face.png',
    './assets/start-face-white.png',
    './assets/start-icon-white.png',
    './assets/plant-growth-sprites-v3.png',
    './assets/start-icon-crown.png',
    './assets/title-sankakuhidoriru-transparent-v1.png',
    './assets/personal-best-mascot.png',
    './assets/plant-growth-sprites-v1.png',
    './assets/best-score-popup.png',
    './assets/rank-s-plus-pompons.png',
    './assets/rank-s-guts-pose.png',
    './assets/rank-a-clapping.png',
    './assets/rank-b-whistle.png',
    './assets/rank-c-all-fours.png',
    './assets/point-p/default.svg',
    './assets/point-p/guide.svg',
    './assets/point-p/happy.svg',
    './assets/point-p/thinking.svg',
    './assets/audio/race.wav',
    './assets/audio/sprint.wav',
    './assets/audio/secret-march.wav',
    './assets/audio/secret-dark-hero.wav',
    './assets/audio/result-s.wav',
    './assets/audio/result-a.wav',
    './assets/audio/result-b.wav',
    './assets/audio/result-c.wav'
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
    const isNavigation = event.request.mode === 'navigate';
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request).then(cached => {
                if (cached) return cached;
                return isNavigation ? caches.match('./index.html') : Response.error();
            }))
    );
});
