// The deploy's own addresses, read from `/config.json` beside the build before the first render, so
// one build runs anywhere. `api` is the API's address, `issuer` the sign-in anchor's, `clientId` this
// site's client at that anchor; an empty value means unset.
//
// The last file read is kept in this browser, so a page opened with no connection still knows its
// addresses.

const KEY = "tks-starter:config";

export const config = { api: "", issuer: "", clientId: "" };

export async function loadConfig() {
  let read = null;
  try {
    const res = await fetch("/config.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(String(res.status));
    read = await res.json();
    try { localStorage.setItem(KEY, JSON.stringify(read)); } catch { /* storage refused */ }
  } catch {
    try { read = JSON.parse(localStorage.getItem(KEY)); } catch { /* none kept */ }
  }
  if (read && typeof read === "object") {
    for (const name of Object.keys(config)) if (typeof read[name] === "string") config[name] = read[name];
  }
  return config;
}

/** Whether the deploy names an API, so a page asks it for data. */
export const hasApi = () => config.api !== "";

/** Whether the deploy names a sign-in anchor and a client, so a site can require a person to sign in. */
export const hasSignIn = () => config.issuer !== "" && config.clientId !== "";
