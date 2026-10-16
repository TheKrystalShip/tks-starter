// The site's API, over the session's `authorizedFetch`: the address comes from `config.api`, bodies
// go in and come out as JSON, and every failure is an `ApiError` whose message is fit to show, which
// is what a `DataState` draws.

import { session } from "./auth.js";
import { config } from "./config.js";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** The words of a failed answer: the body's own `message`, `error` or `title`, else the status line. */
async function messageOf(res) {
  try {
    const body = await res.json();
    const text = body && (body.message || body.error || body.title);
    if (typeof text === "string" && text) return text;
  } catch { /* not JSON */ }
  return res.statusText || "The request failed (" + res.status + ").";
}

async function send(method, path, body) {
  if (!config.api) throw new ApiError(0, "No API is configured.");
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  let res;
  try {
    res = await session.authorizedFetch(config.api.replace(/\/+$/, "") + path, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "The API cannot be reached.");
  }
  if (!res.ok) throw new ApiError(res.status, await messageOf(res));
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path) => send("GET", path),
  post: (path, body) => send("POST", path, body),
  put: (path, body) => send("PUT", path, body),
  patch: (path, body) => send("PATCH", path, body),
  delete: (path) => send("DELETE", path),
};
