// The site's addresses. A page is a path, so a page can be linked to and reloaded; the server answers
// any path that is not a file with the site's index.

import { createStore, useStore } from "@thekrystalship/krystal";
import { homePath, itemsPath, settingsPath } from "./paths.js";

/**
 * The pages. `pattern` is the path, a `:name` segment is a parameter, and `public` marks a page a
 * person who is not signed in may open. Every other page sends them to sign in.
 */
const ROUTES = [
  { view: "home", pattern: homePath },
  { view: "items", pattern: itemsPath },
  { view: "item", pattern: itemsPath + "/:id" },
  { view: "settings", pattern: settingsPath },
].map((route) => ({ ...route, segments: route.pattern.split("/").filter(Boolean) }));

const decode = (s) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

/**
 * What an address is:
 *
 *   view     which page: home, items, item, settings, notfound
 *   params   the parameters the path carries, decoded
 *   public   whether the page is open to a person who is not signed in
 *   path     the path, with no trailing or doubled slash
 *   href     the path and the query string; the key of the page
 *   query    the query string, as URLSearchParams
 *
 * A path no page owns is `notfound`, public, and keeps the address as typed.
 */
function parse(href) {
  const url = new URL(href, window.location.origin);
  const parts = url.pathname.split("/").filter(Boolean);
  const query = url.searchParams;
  for (const route of ROUTES) {
    if (route.segments.length !== parts.length) continue;
    const params = {};
    const matches = route.segments.every((seg, i) => {
      if (seg.startsWith(":")) {
        params[seg.slice(1)] = decode(parts[i]);
        return true;
      }
      return seg === parts[i];
    });
    if (matches) {
      const path = "/" + parts.join("/");
      return { view: route.view, params, public: !!route.public, path, href: path + url.search, query };
    }
  }
  return { view: "notfound", params: {}, public: true, path: url.pathname, href: url.pathname + url.search, query };
}

const here = () => window.location.pathname + window.location.search;

const routeStore = createStore(here());

window.addEventListener("popstate", () => routeStore.setState(here));

/** How many entries this page pushed, so going back never leaves the site. */
let depth = 0;

window.addEventListener("popstate", () => { depth = Math.max(0, depth - 1); });

export function navigate(to, { replace = false } = {}) {
  if (to === here()) return;
  if (replace) window.history.replaceState(null, "", to);
  else {
    window.history.pushState(null, "", to);
    depth += 1;
  }
  routeStore.setState(() => to);
}

/** Back to the page this one was opened from, or to `fallback` when it was opened directly. */
export function goBack(fallback = homePath) {
  if (depth > 0) window.history.back();
  else navigate(fallback, { replace: true });
}

let last = null;

/** The route the address names; see `parse`. */
export function useRoute() {
  const href = useStore(routeStore);
  if (!last || last.href !== href) last = parse(href);
  return last;
}

/** A link that navigates in place. */
export function linkProps(to) {
  return {
    href: to,
    onClick: (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      navigate(to);
    },
  };
}
