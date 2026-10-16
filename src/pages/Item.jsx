import { Button, Card, DetailPage, FactList } from "@thekrystalship/krystal";
import { hasApi } from "../config.js";
import { itemsPath } from "../paths.js";
import { linkProps, navigate, useRoute } from "../router.js";
import { useApi } from "../useApi.js";

const scalar = ([, v]) => ["string", "number", "boolean"].includes(typeof v);

export function Item() {
  const { id } = useRoute().params;
  const { data, loading, error, reload } = useApi(hasApi() ? "/items/" + encodeURIComponent(id) : null);
  const missing = !hasApi() || (error && error.status === 404);
  const name = (data && data.name) || id;
  return (
    <DetailPage
      crumbs={[{ label: "Items", href: itemsPath }, { label: name }]}
      onNavigate={(href, e) => { e.preventDefault(); navigate(href); }}
      title={name}
      loading={loading}
      error={missing ? null : error}
      onRetry={reload}
      isEmpty={missing}
      emptyIcon="search-x"
      emptyTitle="Item not found"
      emptyAction={<Button {...linkProps(itemsPath)}>Back to items</Button>}>
      {data && (
        <Card title="Details">
          <FactList rows={Object.entries(data).filter(scalar).map(([label, value]) => ({ label, value: String(value), mono: true }))} />
        </Card>
      )}
    </DetailPage>
  );
}
