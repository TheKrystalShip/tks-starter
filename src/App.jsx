import { useEffect } from "react";
import { settleSplash } from "@thekrystalship/krystal";
import { Ended } from "./Gate.jsx";
import { Shell } from "./Shell.jsx";
import { session, useSession } from "./auth.js";
import { hasSignIn } from "./config.js";
import { useRoute } from "./router.js";

/**
 * The gate. A session that has ended is the one thing drawn in place of the site. A person who is
 * not signed in on a page that is not public is sent to sign in, and nothing is drawn meanwhile.
 * Restoring and stale sessions draw nothing of their own. The splash leaves after the first commit
 * nothing on screen holds it through.
 */
export function App() {
  useEffect(() => settleSplash());
  const route = useRoute();
  const snapshot = useSession(session);
  const sendToSignIn = hasSignIn() && snapshot.status === "none" && !route.public;

  useEffect(() => {
    if (sendToSignIn) session.signIn({ returnTo: route.href });
  }, [sendToSignIn, route.href]);

  if (snapshot.status === "ended") return <Ended />;
  if (sendToSignIn) return null;
  return <Shell route={route} snapshot={snapshot} />;
}
