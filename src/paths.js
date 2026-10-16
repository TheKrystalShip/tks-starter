// Every address the site has, built in one place. `router.js` parses what these build.

export const homePath = "/";
export const itemsPath = "/items";
export const itemPath = (id) => "/items/" + encodeURIComponent(id);
export const settingsPath = "/settings";
