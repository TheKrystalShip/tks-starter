import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { THEME_KEY, THEME_OPTS } from "@thekrystalship/krystal/lib/theme";

/**
 * Writes `/theme-boot.js` from the theme list and storage key the design system exports, so the
 * script that paints the stored theme before the first frame and the theme picker never disagree.
 * It is a file, not inline script, so the page runs under a policy with no inline script, and it is
 * the first element of the page's head. The development server answers the same address.
 */
function themeBoot() {
  const ids = (mode) => THEME_OPTS.filter((o) => o.mode === mode).map((o) => o.id);
  const source = `(function () {
  var DARK = ${JSON.stringify(ids("dark"))};
  var LIGHT = ${JSON.stringify(ids("light"))};
  var theme = "dark";
  try {
    var pref = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    if (DARK.indexOf(pref) >= 0 || LIGHT.indexOf(pref) >= 0) theme = pref;
    else if (pref === "auto" && window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches) theme = "light";
  } catch (e) {}
  document.documentElement.setAttribute("data-theme", theme);
})();
`;
  return {
    name: "theme-boot",
    configureServer(server) {
      server.middlewares.use("/theme-boot.js", (_req, res) => {
        res.setHeader("Content-Type", "text/javascript");
        res.end(source);
      });
    },
    transformIndexHtml: () => [{ tag: "script", attrs: { src: "/theme-boot.js" }, injectTo: "head-prepend" }],
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "theme-boot.js", source });
    },
  };
}

/** The line in `public/sw.js` the build replaces with what it wrote. */
const BUILD_LINE = 'const BUILD = { version: "dev", files: [] };';

/**
 * Writes every file the build put in `dist/` into the service worker, so a worker installed from this
 * build holds all of them and the installed app never meets a file it has not seen with no
 * connection. The index is listed as `/`. Source maps, the launch screens under `splash/` (Safari
 * reads them once, when the app is put on the Home Screen), the icon source, `config.json` (the deploy's own, read
 * fresh) and `offline.html` (kept apart by the worker) are left out. The version is a hash of every
 * listed file, so the worker changes exactly when something it would serve does.
 */
function precache() {
  let outDir;
  return {
    name: "precache",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      const skipped = new Set(["sw.js", "config.json", "offline.html", "icon-source.svg"]);
      const walk = (dir) => readdirSync(dir, { withFileTypes: true })
        .flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
      const listed = walk(outDir)
        .map((file) => relative(outDir, file).split(sep).join("/"))
        .filter((file) => !skipped.has(file) && !file.endsWith(".map") && !file.startsWith("splash/"))
        .sort();
      const hash = createHash("sha256");
      for (const file of listed) hash.update(file).update("\0").update(readFileSync(join(outDir, file)));
      const files = listed.map((file) => (file === "index.html" ? "/" : "/" + file));
      const worker = join(outDir, "sw.js");
      const source = readFileSync(worker, "utf8");
      if (!source.includes(BUILD_LINE)) throw new Error("public/sw.js has no build line for the precache list.");
      const build = { version: hash.digest("hex").slice(0, 16), files };
      writeFileSync(worker, source.replace(BUILD_LINE, `const BUILD = ${JSON.stringify(build)};`));
    },
  };
}

export default defineConfig({
  plugins: [react(), themeBoot(), precache()],
  server: { port: 5176, strictPort: true },
  preview: { port: 4176, strictPort: true },
  // The design system is one chunk; the size warning would fire on every build.
  build: { outDir: "dist", sourcemap: true, target: "es2022", chunkSizeWarningLimit: 1500 },
  test: { environment: "jsdom", include: ["src/**/*.test.{js,jsx}"] },
});
