/**
 * sw.js — Service Worker for xzy's website
 * Cache-first strategy: serves cached assets instantly, updates cache in background.
 */
'use strict';

var CACHE_NAME = 'xzy-site-v20260805';
var ASSETS = [
    '/',
    '/style.css',
    '/components.js',
    '/script.js',
    '/searchIndex.json',
    '/manifest.json',
    '/favicon.ico',
    '/media/logo.png'
];

/* ---- Install: pre-cache core assets ---- */
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS);
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

/* ---- Activate: clean old caches ---- */
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (k) { return k !== CACHE_NAME; })
                    .map(function (k) { return caches.delete(k); })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

/* ---- Fetch: cache-first, update in background ---- */
self.addEventListener('fetch', function (e) {
    // Only handle GET requests to our own origin
    if (e.request.method !== 'GET') return;
    var url = new URL(e.request.url);
    if (url.origin !== self.location.origin) return;

    e.respondWith(
        caches.match(e.request).then(function (cached) {
            var fetchPromise = fetch(e.request).then(function (response) {
                if (response && response.status === 200) {
                    var copy = response.clone();
                    caches.open(CACHE_NAME).then(function (cache) {
                        cache.put(e.request, copy);
                    });
                }
                return response;
            }).catch(function () {
                // Network failed — if we have a cached response, it was already returned
            });

            return cached || fetchPromise;
        })
    );
});
