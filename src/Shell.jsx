import { AppShell, ErrorBoundary, NavItem, Sidebar, SidebarAccount, SidebarGroup, TabBar, useStoredFlag } from "@thekrystalship/krystal";
import { Container } from "@thekrystalship/krystal";
import { session } from "./auth.js";
import { hasSignIn } from "./config.js";
import { Home } from "./pages/Home.jsx";
import { Item } from "./pages/Item.jsx";
import { Items } from "./pages/Items.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import { Settings } from "./pages/Settings.jsx";
import { settingsPath } from "./paths.js";
import { navigate } from "./router.js";
import { PLACES, markUrl, siteName } from "./site.js";

const PAGES = { home: Home, items: Items, item: Item, settings: Settings, notfound: NotFound };

const noDrawer = () => {};

/** The frame every page stands in: the sidebar on wide screens, the tab bar on phones. */
export function Shell({ route, snapshot }) {
  const [collapsed, setCollapsed] = useStoredFlag("tks-starter:sidebar:collapsed");
  const { account } = snapshot;
  const Page = PAGES[route.view];
  const lit = (place) => place.views.includes(route.view);

  return (
    <AppShell
      collapsed={collapsed}
      drawerOpen={false}
      onDrawer={noDrawer}
      sidebar={(
        <Sidebar
          mark={markUrl}
          wordmark={siteName}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          closeNav
          foot={account
            ? (
              <SidebarAccount
                user={{ display: account.name, name: account.username }}
                sub={account.username ? "@" + account.username : null}
                detail={account.username ? "@" + account.username : null}
                collapsed={collapsed}
                items={[
                  { icon: "settings", label: "Settings", onClick: () => navigate(settingsPath) },
                  { icon: "log-out", label: "Sign out", danger: true, onClick: () => session.signOut() },
                ]} />
            )
            : hasSignIn() && <NavItem icon="log-in" label="Sign in" role="button" onClick={() => session.signIn()} />}>
          <SidebarGroup>
            {PLACES.map((p) => <NavItem key={p.id} icon={p.icon} label={p.label} active={lit(p)} onClick={() => navigate(p.path)} />)}
          </SidebarGroup>
        </Sidebar>
      )}
      tabBar={<TabBar items={PLACES.map((p) => ({ id: p.id, icon: p.icon, label: p.label, active: lit(p), onClick: () => navigate(p.path) }))} />}>
      <Container size="lg" className="site-page">
        <ErrorBoundary resetKey={route.href}>
          <Page />
        </ErrorBoundary>
      </Container>
    </AppShell>
  );
}
