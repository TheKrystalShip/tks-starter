// The four pages a person keeps on the phone's tab bar, besides Home, kept in this browser's storage.
// A project that keeps per-account settings in its API keeps the choice there as well, and adopts the
// account's copy over this one when it loads, so the bar follows the person between devices. A null
// choice is the defaults.

import { createStore } from "@thekrystalship/krystal";

const KEY = "tks-starter:tab-dock";

/**
 * The free slots when the person has chosen none, left to right: ids of the router's places. An empty
 * id leaves the slot empty until the person fills it.
 */
export const DEFAULT_SLOTS = ["items", "", "", "settings"];

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function readLocal() {
  try {
    const slots = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(slots) && slots.length === DEFAULT_SLOTS.length && slots.every((id) => typeof id === "string") ? slots : null;
  } catch {
    return null;
  }
}

/** The person's four slots, or null for the defaults. */
export const tabDockStore = createStore(readLocal());

/** The person changed the bar: shown at once and kept in this browser. */
export function saveSlots(ids) {
  const choice = same(ids, DEFAULT_SLOTS) ? null : [...ids];
  try {
    if (choice) localStorage.setItem(KEY, JSON.stringify(choice));
    else localStorage.removeItem(KEY);
  } catch { /* storage may be unavailable; the bar keeps this session's choice */ }
  tabDockStore.setState(choice);
}
