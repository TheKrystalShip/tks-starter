# tks-starter

A TheKrystalShip web app to start a project from: a static front end that calls its APIs cross-origin
with a bearer, built on `@thekrystalship/krystal`.

## What is in it

- **The shell** (`src/Shell.jsx`): the kit's `AppShell` with the `Sidebar` on wide screens and the
  `TabBar` on phones, an `ErrorBoundary` around the page, and `src/site.js` listing the places both draw.
- **The router** (`src/router.js`): real paths over the History API. A page is a row of `ROUTES`; a
  `:name` segment is a parameter and `public: true` opens a page to a person who is not signed in.
  Addresses are built in `src/paths.js`. The server answers every path that is not a file with
  `index.html`.
- **The pages** (`src/pages/`): Home, a list page with its detail page over the kit's `ListPage`,
  `DetailPage` and `DataState`, Settings (the theme picker and the account section) and not found. The
  list page asks `GET /items` and the detail page `GET /items/:id` only when `config.json` names an API;
  with none, they draw their empty states.
- **Configuration** (`public/config.json`, `src/config.js`): the API's address, the sign-in issuer and
  this site's client id, read before the first render. One build runs anywhere.
- **API calls** (`src/api.js`, `src/useApi.js`): a base address from the config, JSON in and out, and an
  `ApiError` whose message `DataState` draws. Requests go through the session's `authorizedFetch`.
- **The session** (`src/auth.js`): the interface of `@thekrystalship/auth-client`, in one module. The
  gate (`src/App.jsx`) draws one screen for an `ended` session, sends a person who is not signed in on a
  non-public page to `session.signIn`, and draws nothing for `restoring` or `stale`. The page requires
  sign-in only when the config names an issuer and a client.
- **The theme** (`vite.config.js`): `/theme-boot.js` is written from the kit's theme list and storage
  key and loaded first in the page's head, so the stored theme paints before the first frame and the
  theme picker agrees with it.
- **Installing and offline** (`public/manifest.webmanifest`, `public/sw.js`, `public/offline.html`,
  `src/registerSW.js`): the worker holds the shell and the hashed assets, fetches pages network-first,
  answers with the held index when the network fails, and with `offline.html` when that is missing. It
  keeps no API data. It registers in production builds only.
- **Icons and launch screens** (`scripts/make-icons.mjs`): `npm run icons` makes every icon and iOS
  launch image under `public/` from `public/icon-source.svg`. It needs `rsvg-convert`.
- **Lint**: the kit's ESLint and Stylelint configs at error. A site styles its own class names and
  reaches the kit through props, variants and tokens, never through a `.k-` selector.

## Commands

| Command | |
|---|---|
| `npm run dev` | The dev server on `:5176`. |
| `npm run build` | The static site in `dist/`. |
| `npm run preview` | Serves `dist/` on `:4176`. |
| `npm run lint`, `npm run lint:css` | ESLint and Stylelint. |
| `npm test` | Vitest. |
| `npm run icons` | Remakes the icons and launch screens. |

`@thekrystalship/krystal` installs from GitHub Packages: `.npmrc` maps the scope, and the workstation's
`~/.npmrc` holds a token with `read:packages`.
