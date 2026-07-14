/* 離線快取 v2：index 走網路優先（更新才拿得到新版），圖片等資產用快取優先 */
const CACHE = 'jz-v2';
const CORE = ['.', 'index.html', 'manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const isPage = e.request.mode === 'navigate' || e.request.url.endsWith('index.html');
  if (isPage) {
    // 網路優先：有網路拿最新版，沒網路用快取
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('.')))
    );
  } else {
    // 快取優先：圖片、字體載過就不再重抓
    e.respondWith(
      caches.match(e.request).then(hit => hit ||
        fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return res;
        }))
    );
  }
});
