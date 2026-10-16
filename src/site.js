// The site's name and the places its navigation lists. The sidebar and the phone's tab bar draw the
// same list; `views` are the routes a place stays lit for.

import { homePath, itemsPath, settingsPath } from "./paths.js";

export const siteName = "Starter";

export const markUrl = "/icons/icon.svg";

export const PLACES = [
  { id: "home", icon: "house", label: "Home", path: homePath, views: ["home"] },
  { id: "items", icon: "list", label: "Items", path: itemsPath, views: ["items", "item"] },
  { id: "settings", icon: "settings", label: "Settings", path: settingsPath, views: ["settings"] },
];
