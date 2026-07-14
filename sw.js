/* 簡單的離線快取：第一次載入後，沒網路也能開 */
const CACHE = 'jz-v1';
const CORE = ['.', 'index.html', 'manifest.json',
  'assets/pals/chick/1.svg', 'assets/pals/chick/2.svg', 'assets/pals/chick/3.svg',
  'assets/pals/chick/4.svg', 'assets/pals/chick/5.svg', 'assets/pals/chick/6.svg',
  'assets/pals/chick/7.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(hit => hit ||
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('.')))
  );
});
