const CACHE = 'agriverse-v8';

const CORE_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/nav.js',
    '/manifest.json',
    '/favicon.ico',
    '/favicon.png',
    '/images/icon-192.png',
    '/images/icon-512.png',
    '/images/logoss.jpg',
];

// Install — cache core files
self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE)
            .then(c => c.addAll(CORE_FILES))
            .catch(() => {})
    );
    self.skipWaiting();
});

// Activate — delete old caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', e => {
    // Skip non-GET and API requests
    if (e.request.method !== 'GET') return;
    if (e.request.url.includes('agri-project-ol6n.onrender.com')) return;
    if (e.request.url.includes('generativelanguage.googleapis.com')) return;

    e.respondWith(
        fetch(e.request)
            .then(res => {
                // Cache successful responses
                if (res && res.status === 200) {
                    const clone = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return res;
            })
            .catch(() => caches.match(e.request)
                .then(cached => cached || new Response(
                    '<h2 style="font-family:sans-serif;text-align:center;margin-top:3rem;">📡 No internet connection.<br><small>Please check your network.</small></h2>',
                    { headers: { 'Content-Type': 'text/html' } }
                ))
            )
    );
});
