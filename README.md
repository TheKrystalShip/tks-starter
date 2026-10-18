# tks-starter

A TheKrystalShip web app: a static front end that calls its APIs cross-origin
with a bearer, drawn by `@thekrystalship/krystal` and signed in through `@thekrystalship/auth-client`.

## Starting a project

1. Make a repository from this template and clone it.
2. `npm install`, then `npm run init`: it asks for the project's name, title, host, sign-in issuer,
   client id and API, writes them in, and deletes itself.
3. Register the client at the issuer as a public client, with `https://<host>/signed-in` as its redirect
   and `https://<host>/` as its post-sign-out address (`init` prints both).
4. Replace `public/icon-source.svg` and run `npm run icons`.
5. `./deploy/setup.sh` once on the host, then `./deploy/deploy.sh`.
6. Fill in `docs/component-page.md` and move it to `kgsm-docs/components/`.
7. For an Android app of the site, run `tks-shell`'s `new-app.sh` into this repository
   (`kgsm-docs/systems/shell/README.md`).

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
- **The session** (`src/auth.js`): `@thekrystalship/auth-client`, configured from `config.json`, in one
  module. The gate (`src/App.jsx`) draws one screen for an `ended` session, sends a person who is not
  signed in on a non-public page to sign in, and draws nothing for `restoring` or `stale`. The site
  requires sign-in only when the config names an issuer and a client.
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
| `npm run init` | Makes a fresh copy a project of its own, once. |
| `npm run dev` | The dev server on `:5176`. |
| `npm run build` | The static site in `dist/`. |
| `npm run preview` | Serves `dist/` on `:4176`. |
| `npm run lint`, `npm run lint:css` | ESLint and Stylelint. |
| `npm test` | Vitest. |
| `npm run icons` | Remakes the icons and launch screens. |

`@thekrystalship/krystal` installs from GitHub Packages: `.npmrc` maps the scope, and the workstation's
`~/.npmrc` holds a token with `read:packages`.
| `./deploy/setup.sh` | Once per host: the web root and, with `SITE_HOST`, the certificate and the nginx vhost. |
| `./deploy/deploy.sh` | Builds, writes `config.json` from `deploy/deploy.local.env`, and syncs into the web root. |

## Recipes

- **The assistant.** Pin `@thekrystalship/krystal-chat` at the kit's version and point
  `createAssistantClient` at the harness plugin that serves the product; tokens come from
  `session.fresh()`. On a wide screen the chat is `docked` in the shell's `Dock`, a panel beside the
  page; on a phone it is a tab of its own, a route drawing `Chat` with `layout="page"` and `framed`.
  A product's own blocks go in its `slots`. MovieBot's site is the worked example.
- **A television mode.** Mark the root `data-tv`, start the kit's spatial focus
  (`@thekrystalship/krystal/lib/spatialFocus`), draw the television pages from the kit's TV components,
  and sign the screen in with `session.device.start()`. MovieBot's site is the worked example.
- **Packaging for other hosts.** The workspace's `scripts/ci-template/` and the distribution canon in
  `kgsm-docs/systems/distribution/`.
