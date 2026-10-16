// make-icons.mjs — makes every install icon and iOS launch screen from one source image.
//
//   npm run icons        (needs rsvg-convert; not part of any build)
//
// The source is `public/icon-source.svg` (or `icon-source.png`): the mark on a full-bleed tile, 512
// units square. The output is committed under `public/icons/` and `public/splash/`, and nothing in
// `npm run build` invokes this: a build must not depend on a system package that only this task needs.
//
// `CANVAS` is the launch screens' background and matches the manifest's `background_color` and the
// `theme-color` in `index.html`.

import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
const CANVAS = "#0B0F14";

const SOURCE = ["icon-source.svg", "icon-source.png"].map((f) => resolve(OUT, f)).find(existsSync);
if (!SOURCE) throw new Error("public/ has no icon-source.svg or icon-source.png.");

const icon = (name) => resolve(OUT, "icons", name);
mkdirSync(resolve(OUT, "icons"), { recursive: true });

function render(w, h, out) {
  mkdirSync(dirname(out), { recursive: true });
  execFileSync("rsvg-convert", ["-w", String(w), "-h", String(h), SOURCE, "-o", out]);
}

// The favicon is the vector itself when the source is one, and the 32px PNG is for browsers that take no SVG.
if (SOURCE.endsWith(".svg")) copyFileSync(SOURCE, icon("icon.svg"));
render(32, 32, icon("icon-32.png"));

// `any` icons, and Safari's home-screen icons.
for (const px of [192, 512]) render(px, px, icon(`icon-${px}.png`));
for (const px of [152, 167, 180]) render(px, px, icon(`apple-touch-icon-${px}.png`));

// `maskable`: Android crops it to the launcher's shape, so the source's tile must be a flat fill with
// its mark well inside the 80% safe circle.
render(512, 512, icon("icon-maskable-512.png"));

// iOS launch images: the canvas with the mark centred at a constant 90 logical points. Each entry is a
// device's portrait size in points and its pixel ratio; they mirror the <link rel="apple-touch-startup-image">
// media queries in index.html one for one.
const SPLASH = [
  [320, 568, 2], [375, 667, 2], [414, 896, 2], [375, 812, 3], [414, 896, 3], [390, 844, 3],
  [428, 926, 3], [393, 852, 3], [430, 932, 3], [402, 874, 3], [420, 912, 3], [440, 956, 3],
  [744, 1133, 2], [768, 1024, 2], [810, 1080, 2], [820, 1180, 2], [834, 1194, 2], [834, 1210, 2],
  [1024, 1366, 2], [1032, 1376, 2],
];
const TMP = resolve(OUT, ".splash.svg");
const markPng = readFileSync(icon("icon-512.png")).toString("base64");
for (const [pw, ph, dpr] of SPLASH) {
  const [w, h, s] = [pw * dpr, ph * dpr, 90 * dpr];
  writeFileSync(TMP,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`
    + ` width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
    + `<rect width="${w}" height="${h}" fill="${CANVAS}"/>`
    + `<image x="${(w - s) / 2}" y="${(h - s) / 2}" width="${s}" height="${s}"`
    + ` xlink:href="data:image/png;base64,${markPng}"/></svg>`);
  const out = resolve(OUT, "splash", `splash-${w}x${h}.png`);
  mkdirSync(dirname(out), { recursive: true });
  execFileSync("rsvg-convert", ["-w", String(w), "-h", String(h), TMP, "-o", out]);
}
rmSync(TMP, { force: true });

console.log(`wrote the icons and ${SPLASH.length} launch images to public/`);
