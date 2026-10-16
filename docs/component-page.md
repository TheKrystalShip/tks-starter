# tks-starter

<!-- The project's page in kgsm-docs/components/, to be filled in and moved there. -->

One sentence: what the site is for.

## What it owns

What it draws, and for whom. It holds no state of its own beyond the browser's.

## Role

A **static web app**: built files served from a web root, calling its API and its sign-in anchor at
their own addresses.

## Depends on, and depended on by

| Peer | Transport | Which way | When absent |
|---|---|---|---|
| `@thekrystalship/krystal` | npm package, pinned | Draws every page | The site does not build |
| `@thekrystalship/auth-client` | npm package, pinned | Signs people in | The site does not build |
| The sign-in anchor | OpenID Connect, a public client | The site is its client | The session holds while it can; then the person signs in again |
| Its API | HTTPS with a bearer | The site calls it | Pages draw the kit's error state |

## Contracts it takes part in

- `systems/identity/sign-in.md`: the browser half of signing in.
- `systems/design-system/`: the kit it is drawn from.

## Where its own docs live

The repository's `README.md` and `CLAUDE.md`.
