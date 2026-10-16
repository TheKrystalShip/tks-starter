import { Card, Grid, PageHeader } from "@thekrystalship/krystal";
import { itemsPath, settingsPath } from "../paths.js";
import { linkProps } from "../router.js";
import { siteName } from "../site.js";

export function Home() {
  return (
    <>
      <PageHeader title={siteName} />
      <Grid min={280} gap="md">
        <Card icon="list" title="Items" href={itemsPath} onOpen={linkProps(itemsPath).onClick}>The list page and its detail page</Card>
        <Card icon="settings" title="Settings" href={settingsPath} onOpen={linkProps(settingsPath).onClick}>Theme and account</Card>
      </Grid>
    </>
  );
}
