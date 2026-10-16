// The site's session, in one module: the rest of the site imports `session` and `useSession` from
// here and nothing else from the sign-in code. The anchor and this site's client come from
// `config.json`; a deploy that names neither runs with no one signed in.

import { createSession } from "@thekrystalship/auth-client";
import { config, hasSignIn } from "./config.js";

export { useSession } from "@thekrystalship/auth-client/react";

export const session = createSession({
  resolve: async () => {
    if (!hasSignIn()) throw new Error("This deploy names no sign-in anchor.");
    return { issuer: config.issuer, clientId: config.clientId };
  },
});
