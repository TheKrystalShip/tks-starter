// The installed app's service worker (public/sw.js), registered in a production build only: under
// `npm run dev` a worker would sit in front of Vite's module server and hand back stale modules.
//
// It registers once `load` has fired, so the install never competes with the first paint, and a
// failed registration is swallowed: the site works the same uninstalled.

export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  const register = () => { navigator.serviceWorker.register("/sw.js").catch(() => {}); };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
