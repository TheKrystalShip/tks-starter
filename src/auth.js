// The site's session, in one module: the rest of the site imports `session` and `useSession` from
// here and nothing else from the sign-in code.
//
// The session is the interface of `@thekrystalship/auth-client`: `restore`, `signIn`, `signOut`,
// `authorizedFetch`, `subscribe` and `getSnapshot`. The object below implements it with no account
// and a plain `fetch`, until the package is installed. Then this file becomes:
//
//   import { createSession } from "@thekrystalship/auth-client";
//   import { useSession } from "@thekrystalship/auth-client/react";
//   export const session = createSession({ resolve: async () => ({ issuer: config.issuer, clientId: config.clientId }) });
//   export { useSession };

import { useSyncExternalStore } from "react";

const NONE = { status: "none", reason: null, account: null, claims: {}, expiresAt: null };

/** A session that implements the interface with no sign-in behind it. */
export function createStandInSession() {
  let snapshot = NONE;
  const listeners = new Set();
  const set = (next) => {
    snapshot = next;
    listeners.forEach((l) => l());
  };
  return {
    restore: async () => null,
    // Resolves true once the redirect has started, false when the anchor cannot be reached; never rejects.
    signIn: async () => false,
    signOut: async () => set(NONE),
    // Rejects with `code` "ended" or "none" when there is no token to offer.
    fresh: async () => {
      throw Object.assign(new Error("No session."), { code: snapshot.status === "ended" ? "ended" : "none" });
    },
    authorizedFetch: (input, init) => fetch(input, init),
    adopt: (tokens) => {
      const claims = (tokens && tokens.claims) || {};
      set({
        status: "live", reason: null, claims, expiresAt: null,
        account: { id: claims.sub || null, name: claims.name || null, username: claims.preferred_username || null },
      });
    },
    end: (reason) => set({ ...NONE, status: "ended", reason }),
    updateAccount: (patch) => snapshot.account && set({ ...snapshot, account: { ...snapshot.account, ...patch } }),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => snapshot,
    device: {
      // `poll` resolves "signed-in", "refused", "expired" or "cancelled".
      start: async () => ({ userCode: "", verificationUri: "", verificationUriComplete: "", expiresIn: 0, poll: async () => "cancelled", cancel() {} }),
    },
  };
}

export const session = createStandInSession();

/** The session's snapshot, redrawing the caller when it changes. */
export function useSession(s) {
  return useSyncExternalStore(s.subscribe, s.getSnapshot);
}
