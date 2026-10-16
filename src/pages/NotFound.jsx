import { Button, EmptyState } from "@thekrystalship/krystal";
import { homePath } from "../paths.js";
import { linkProps } from "../router.js";

export function NotFound() {
  return (
    <EmptyState icon="compass" title="Page not found" actions={<Button variant="primary" {...linkProps(homePath)}>Home</Button>} />
  );
}
