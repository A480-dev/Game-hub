const CACHE_NAME = 'gamehub-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/app_runner.py'
];

const GAMES = [
  '/games/snake.js',
  '/games/pong.js',
  '/games/breakout.js',
  '/games/flappy.js',
  '/games/memory.js',
  '/games/tetris.js',
  '/games/space_invaders.js',
  '/games/2048.js',
  '/games/whack_mole.js',
  '/games/asteroids.js',
  '/games/racing.js',
  '/games/pool.js',
  '/games/pacman.js',
  '/games/tower_defense.js',
  '/games/sudoku.js',
  '/games/candy_crush.js',
  '/games/fighter.js',
  '/games/chess.js',
  '/games/solitaire.js',
  '/games/trivia.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/games/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
