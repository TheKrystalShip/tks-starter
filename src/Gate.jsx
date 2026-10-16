import { Button, CardScreen } from "@thekrystalship/krystal";
import { session } from "./auth.js";
import { markUrl, siteName } from "./site.js";

/** The one screen the site draws for a session that has ended, with its one action. */
export function Ended() {
  return (
    <CardScreen mark={markUrl} wordmark={siteName} tagline="You have been signed out.">
      <Button variant="primary" size="lg" wide onClick={() => session.signIn()}>Sign in again</Button>
    </CardScreen>
  );
}
