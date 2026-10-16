// The site's service worker.
//
// It satisfies the browser's installability criteria with a functional `fetch` handler and holds the
// whole build, so the installed app opens and gets around with no connection.
//
// The build writes `BUILD` below: its version and every file it put in dist/, the index as `/`. A
// worker installing fetches all of them into a cache named by that version, and installs only when
// every one arrived, so the cache it serves is always one whole build: the index and the chunks it
// names, the fonts and the icons. Activating drops every other build's cache. A deploy is a new
// version, which the browser finds on the next online page load.
//
// A page is fetched from the network first. When the network fails, the build's index answers: the
// server answers every page with the same index, so the one copy under "/" stands for all of them.
// When even that is missing, `offline.html`, kept in a cache of its own, answers.
//
// It allowlists. Only page loads and the files the build wrote are ever served from a cache; every
// other request reaches the network untouched. No API answer is ever kept here: a cached
// authenticated 200 hides an ended session from the page and can hand one person's data to whoever
// opens the app next.

// Written by the build (vite.config.js); in development nothing registers this worker.
const BUILD = { version: "dev", files: [] };

const PREFIX = "tks-starter-build-";
const CACHE = PREFIX + BUILD.version;
const OFFLINE_CACHE = "tks-starter-offline";
const OFFLINE_PAGE = "/offline.html";

// The build's files, by path: the only requests ever answered from the build's cache.
const BUILT = new Set(BUILD.files);

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      // Fetched past the HTTP cache, so the worker holds what this deploy serves. One file failing
      // fails the install, which leaves the worker before it, and its whole build, in place.
      caches.open(CACHE).then((cache) => cache.addAll(BUILD.files.map((url) => new Request(url, { cache: "reload" })))),
      caches.open(OFFLINE_CACHE).then((cache) => cache.add(new Request(OFFLINE_PAGE, { cache: "reload" }))),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => (isShell(res) ? res : shell().then((held) => held || res)))
        .catch(() => shell().then((held) => held || offline()))
    );
    return;
  }

  if (!BUILT.has(url.pathname) || url.pathname === "/") return;

  // A file of the build: from the cache, and from the network for one the cache somehow lacks.
  event.respondWith(caches.match(url.pathname, { cacheName: CACHE }).then((cached) => cached || fetch(req)));
});

const shell = () => caches.match("/", { cacheName: CACHE });

const offline = () => caches.match(OFFLINE_PAGE, { cacheName: OFFLINE_CACHE }).then((page) => page || Response.error());

// A successful same-origin HTML document: the site's index, which the server answers for every page.
function isShell(res) {
  return !!res && res.status === 200 && res.type === "basic"
    && (res.headers.get("content-type") || "").startsWith("text/html");
}
