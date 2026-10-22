// 엑셀 실무 드릴 서비스워커: 온라인이면 새 파일, 오프라인이면 저장해 둔 파일
const V = 'excel-drill-579dc4b783';
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('excel-drill-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(V);
    try {
      const net = await Promise.race([fetch(r, { cache: 'no-cache' }), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 5000))]);
      if (net && net.ok) c.put(r, net.clone());
      return net;
    } catch (err) {
      return (await c.match(r, { ignoreSearch: true })) || (r.mode === 'navigate' ? await c.match('./') : Response.error());
    }
  })());
});
