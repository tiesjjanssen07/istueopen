// keeps a copy of the site so it also opens without internet.
// always tries the network first, so updates show up straight away when online.
var CACHE = "istueopen-v1";
var FILES = [
  "./", "index.html", "food.html", "report.html", "privacy.html", "404.html",
  "nl/", "nl/index.html", "nl/eten.html", "nl/melden.html", "nl/privacy.html",
  "style.css", "hours.js", "open.js", "site.js", "favicon.png", "icon-192.png", "manifest.webmanifest", "nl/manifest.webmanifest"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(FILES.map(function (f) { return c.add(f).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // firebase, weather etc. go straight to the network
  e.respondWith(
    fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        return hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error());
      });
    })
  );
});
