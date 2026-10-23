// The site's name and the places its navigation lists; `views` are the routes a place stays lit for.
// The sidebar lists PLACES and opens Settings from the account menu; the phone's tab bar, which has no
// account menu, draws TABS, PLACES and Settings.

import { homePath, itemsPath, settingsPath } from "./paths.js";

export const siteName = "Starter";

// The site's own mark (identity.js), for a screen that stands for the site alone. The sidebar carries
// the organisation's.
export const markUrl = "/icons/icon.svg";

export { default as tksMarkUrl } from "@thekrystalship/krystal/assets/tks-mark.png";

export const PLACES = [
  { id: "home", icon: "house", label: "Home", path: homePath, views: ["home"] },
  { id: "items", icon: "list", label: "Items", path: itemsPath, views: ["items", "item"] },
];

export const TABS = [
  ...PLACES,
  { id: "settings", icon: "settings", label: "Settings", path: settingsPath, views: ["settings"] },
];
