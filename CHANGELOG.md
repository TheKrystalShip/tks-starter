# Changelog

## [0.4.0]

- `@thekrystalship/krystal` 3.0.0.

## [0.3.0]

- `@thekrystalship/krystal` 2.0.0.
- The assistant recipe draws the chat as the other products do: docked on a wide screen, a page with
  `layout="page"` on a phone.

## [0.2.3]

- `@thekrystalship/auth-client` 0.1.1: a sign-in callback that keeps failing ends instead of looping.

## [0.2.2]

- An error answer from the site's nginx carries no cache lifetime, so a missing asset is never kept.

## [0.2.1]

- A sign-in callback that carries no return address goes home rather than leaving `/signed-in` on screen.

## [0.2.0]

- Signing in through `@thekrystalship/auth-client`, configured from `config.json`.
- `npm run init` makes a fresh copy a project of its own and deletes itself.
- `deploy/setup.sh` and `deploy/deploy.sh`: the web root, the certificate and the nginx vhost, and a
  deploy that writes `config.json` beside the build.
- `CLAUDE.md`, the README's start steps and recipes, and the project's component page to fill in.
- CI on every push and daily against the newest kit and sign-in package, `init` included.

## [0.1.0]

- The site: the shell, the router, Home, a list page with its detail page, Settings and not found.
- `config.json`, the API client and the session module.
- The theme boot, the manifest, the icons and launch screens, the service worker and its offline page.
- Vitest, and the kit's ESLint and Stylelint configs at error.
