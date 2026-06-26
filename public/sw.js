// Service Worker no-op
// Previne 404s quando browsers/extensões buscam /sw.js
// Não registra nem intercepta nenhuma request — apenas responde 200 rapidamente.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())
