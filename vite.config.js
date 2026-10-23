import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { siteIdentity } from "@thekrystalship/krystal/vite";
import identity from "./identity.js";

/** The line in `public/sw.js` the build replaces with what it wrote. */
const BUILD_LINE = 'const BUILD = { version: "dev", files: [] };';

/**
 * Writes every file the build put in `dist/` into the service worker, so a worker installed from this
 * build holds all of them and the installed app never meets a file it has not seen with no
 * connection. The index is listed as `/`. Source maps, the launch screens under `splash/` (Safari
 * reads them once, when the app is put on the Home Screen), `config.json` (the deploy's own, read
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
      const skipped = new Set(["sw.js", "config.json", "offline.html"]);
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
  plugins: [react(), siteIdentity(identity), precache()],
  server: { port: 5176, strictPort: true },
  preview: { port: 4176, strictPort: true },
  // The design system is one chunk; the size warning would fire on every build.
  build: { outDir: "dist", sourcemap: true, target: "es2022", chunkSizeWarningLimit: 1500 },
  // Node's own localStorage stands in front of jsdom's and warns on every read without a file behind
  // it; with it off, the tests read jsdom's storage, as a page reads the browser's.
  test: { environment: "jsdom", include: ["src/**/*.test.{js,jsx}"], execArgv: ["--no-experimental-webstorage"] },
});
