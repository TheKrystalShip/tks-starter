# CLAUDE.md

`tks-starter` is a TheKrystalShip web app: a static front end that calls its APIs cross-origin with a
bearer, drawn entirely by `@thekrystalship/krystal` and signed in through `@thekrystalship/auth-client`.
`README.md` says what each part is.

## The rules this site keeps

- **The kit draws everything.** A page composes the kit's components and page layouts. The site styles
  only its own class names, and reaches the kit through props, variants and documented `--k-*` tokens;
  no selector names a `.k-` class, and Stylelint fails the build if one does. A look the kit does not
  offer is a gap in the kit, raised there, never CSS around it.
- **Signing in is invisible.** `src/auth.js` is the one module that knows the session. Only an `ended`
  session is drawn (one screen, one action); `restoring` and `stale` draw nothing, and the site never
  shows a banner, toast or badge about the session. Requests go through `api.js`, which goes through
  the session's `authorizedFetch`.
- **The API is the authority for its data.** A page shows what the API answers, its empty state when
  there is nothing, and the kit's error state when the call fails. Nothing is drawn from a fixture or a
  hard-coded list.
- **One build runs anywhere.** Addresses come from `config.json` beside the build, which the deploy
  writes; nothing about a deployment is in the sources.
- **The service worker keeps the shell, never API data.**

## Commands

```bash
npm run dev            # the dev server
npm run build          # dist/
npm run lint && npm run lint:css && npm test
./deploy/setup.sh      # once per host (sudo): the web root, and with SITE_HOST the certificate and vhost
./deploy/deploy.sh     # every deploy: build, write config.json, sync; nothing restarts
```

A deploy's values (`SITE_HOST`, `SITE_API`, `SITE_ISSUER`, `SITE_CLIENT_ID`) live in the untracked
`deploy/deploy.local.env`; `deploy/deploy.local.env.example` lists them.

## Version tracking

- **Version source:** `"version"` in `package.json`; `deploy/version.sh` prints it.
- Every change a person can see bumps it (patch for a fix, minor for an addition, major for a break),
  with a `CHANGELOG.md` entry in the same commit, tagged `v<version>`.
- The kit and the sign-in package are pinned exactly. Moving a pin is a change of its own: bump, build,
  check the pages, deploy.

## Documentation

Docs and comments describe how the site works now, in the present tense: no history, no "used to", no
work-in-progress notes, no emoji. The reasoning behind a change belongs in its commit message.
