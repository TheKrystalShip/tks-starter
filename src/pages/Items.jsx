import { ListPage, ListRow } from "@thekrystalship/krystal";
import { hasApi } from "../config.js";
import { itemPath } from "../paths.js";
import { linkProps } from "../router.js";
import { useApi } from "../useApi.js";

export function Items() {
  const { data, loading, error, reload } = useApi(hasApi() ? "/items" : null);
  return (
    <ListPage
      title="Items"
      label="Items"
      items={data || []}
      renderItem={(item) => {
        const to = itemPath(item.id);
        return <ListRow key={item.id} title={item.name || item.id} href={to} onOpen={linkProps(to).onClick} />;
      }}
      loading={loading}
      error={error}
      onRetry={reload}
      emptyIcon="inbox"
      emptyTitle="No items" />
  );
}
