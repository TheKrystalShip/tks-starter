import { Button, SettingsPage, ThemePicker } from "@thekrystalship/krystal";
import { session, useSession } from "../auth.js";
import { hasSignIn } from "../config.js";

export function Settings() {
  const { account } = useSession(session);
  const rows = account
    ? [
      account.name && { icon: "user", title: "Name", value: account.name },
      account.username && { icon: "at-sign", title: "Username", value: account.username, mono: true },
      { icon: "log-out", title: "Sign out", control: <Button onClick={() => session.signOut()}>Sign out</Button> },
    ]
    : [
      { icon: "user", title: "Not signed in", control: hasSignIn() && <Button variant="primary" onClick={() => session.signIn()}>Sign in</Button> },
    ];
  return (
    <SettingsPage
      title="Settings"
      sections={[
        { id: "appearance", icon: "palette", title: "Appearance", content: <ThemePicker /> },
        { id: "account", icon: "user", title: "Account", rows: rows.filter(Boolean) },
      ]} />
  );
}
