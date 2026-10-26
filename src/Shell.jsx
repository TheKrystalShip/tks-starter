import { AppShell, ErrorBoundary, NavItem, Sidebar, SidebarAccount, SidebarGroup, TabDock, useStore, useStoredFlag } from "@thekrystalship/krystal";
import { Container } from "@thekrystalship/krystal";
import { session } from "./auth.js";
import { config, hasSignIn } from "./config.js";
import { Home } from "./pages/Home.jsx";
import { Item } from "./pages/Item.jsx";
import { Items } from "./pages/Items.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import { Settings } from "./pages/Settings.jsx";
import { settingsPath } from "./paths.js";
import { PLACES, SECTIONS, navigate, placesOf } from "./router.js";
import { siteName, tksMarkUrl } from "./site.js";
import { DEFAULT_SLOTS, saveSlots, tabDockStore } from "./tabDock.js";

const PAGES = { home: Home, items: Items, item: Item, settings: Settings, notfound: NotFound };

const noDrawer = () => {};

/** The frame every page stands in: the sidebar on wide screens, the tab dock on phones. */
export function Shell({ route, snapshot }) {
  const [collapsed, setCollapsed] = useStoredFlag("tks-starter:sidebar:collapsed");
  const { account } = snapshot;
  const Page = PAGES[route.view];
  const slots = useStore(tabDockStore) || DEFAULT_SLOTS;
  const lit = (place) => place.views.includes(route.view);
  const item = (p) => ({ id: p.id, icon: p.icon, label: p.label, active: lit(p), onClick: () => navigate(p.path) });

  return (
    <AppShell
      collapsed={collapsed}
      drawerOpen={false}
      onDrawer={noDrawer}
      sidebar={(
        <Sidebar
          mark={tksMarkUrl}
          wordmark={siteName}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          closeNav
          foot={account
            ? (
              <SidebarAccount
                user={{ display: account.name, name: account.username }}
                collapsed={collapsed}
                onProfile={() => window.location.assign(config.issuer + "/account")}
                onSettings={() => navigate(settingsPath)}
                onSignOut={() => session.signOut()} />
            )
            : hasSignIn() && <NavItem icon="log-in" label="Sign in" role="button" onClick={() => session.signIn()} />}>
          <SidebarGroup>
            {SECTIONS.filter((g) => g.sidebar).flatMap((g) => placesOf(g.id)).map((p) => (
              <NavItem key={p.id} icon={p.icon} label={p.label} active={lit(p)} onClick={() => navigate(p.path)} />
            ))}
          </SidebarGroup>
        </Sidebar>
      )}
      tabBar={(
        <TabDock
          home={item(PLACES[0])}
          sections={SECTIONS.map((g) => ({ id: g.id, label: g.label, items: placesOf(g.id).map(item) }))}
          slots={slots}
          defaultSlots={DEFAULT_SLOTS}
          onSlotsChange={saveSlots} />
      )}>
      <Container size="lg" className="site-page">
        <ErrorBoundary resetKey={route.href}>
          <Page />
        </ErrorBoundary>
      </Container>
    </AppShell>
  );
}
