// Makes this checkout a project of its own: its name, its title, and the values its deploy writes
// into config.json. Run once in a fresh copy of the template; it deletes itself when done.
//
//   npm run init
//   node scripts/init.mjs --name my-site --title "My Site" --host my.example.com \
//     --issuer https://auth.example.com --client-id my-site [--api https://api.example.com]
//
// Anything not given as a flag is asked for. `--host`, `--issuer`, `--client-id` and `--api` go into
// deploy/deploy.local.env, which is untracked; the rest is written into the sources.

import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = "tks-starter";
const TITLE = "Starter";

// Where the template names itself: its slug in each, its title in the second list.
const SLUG_FILES = ["package.json", "deploy/deploy-common.sh", "src/config.js", "src/Shell.jsx", "public/sw.js", "docs/component-page.md"];
const TITLE_FILES = ["index.html", "public/manifest.webmanifest", "src/site.js"];

const flags = {};
for (let i = 2; i < process.argv.length; i++) {
  const m = /^--([\w-]+)$/.exec(process.argv[i]);
  if (m) flags[m[1]] = process.argv[++i] ?? "";
}

if (!existsSync(join(ROOT, "scripts/init.mjs"))) process.exit(0);
const rl = process.stdin.isTTY ? createInterface({ input: process.stdin, output: process.stdout }) : null;
async function ask(key, question, fallback = "") {
  if (key in flags) return flags[key].trim();
  if (!rl) return fallback;
  const answer = (await rl.question(`${question}${fallback ? ` [${fallback}]` : ""}: `)).trim();
  return answer || fallback;
}

const name = await ask("name", "Project name (lower case, dashes)");
if (!/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error("The name is lower-case letters, digits and dashes, starting with a letter.");
  process.exit(1);
}
const title = await ask("title", "Title people see", name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" "));
const host = await ask("host", "Public host name (blank for none yet)");
const issuer = await ask("issuer", "Sign-in issuer (blank for no sign-in)");
const clientId = issuer ? await ask("client-id", "This site's client id at the issuer", name) : "";
const api = await ask("api", "API address (blank for none yet)");
rl?.close();

const edit = (file, fn) => {
  const path = join(ROOT, file);
  writeFileSync(path, fn(readFileSync(path, "utf8")));
};
for (const file of SLUG_FILES) edit(file, (s) => s.replaceAll(SLUG, name));
for (const file of TITLE_FILES) edit(file, (s) => s.replaceAll(`"${TITLE}"`, JSON.stringify(title)).replaceAll(`>${TITLE}<`, `>${title}<`));

// init is the only script the template carries, so a project without scripts of its own lints none.
const scriptsLeft = readdirSync(join(ROOT, "scripts")).some((f) => f !== "init.mjs");
edit("package.json", (s) => {
  const pkg = JSON.parse(s);
  pkg.version = "0.1.0";
  delete pkg.scripts.init;
  if (!scriptsLeft) pkg.scripts.lint = pkg.scripts.lint.replace(" scripts ", " ");
  return JSON.stringify(pkg, null, 2) + "\n";
});
writeFileSync(join(ROOT, "CHANGELOG.md"), `# Changelog\n\n## [0.1.0]\n\n- ${title}, from tks-starter.\n`);
// The template's own steps for starting a project are done once init has run.
edit("README.md", (s) => s.replace(/^# .*$/m, `# ${name}`).replace(/\n## Starting a project\n[\s\S]*?(?=\n## )/, "\n"));
edit("CLAUDE.md", (s) => s.replaceAll(SLUG, name));

const env = { SITE_HOST: host, SITE_API: api, SITE_ISSUER: issuer, SITE_CLIENT_ID: clientId };
writeFileSync(join(ROOT, "deploy/deploy.local.env"),
  Object.entries(env).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join("\n") + "\n");

rmSync(join(ROOT, scriptsLeft ? "scripts/init.mjs" : "scripts"), { recursive: true });

console.log(`\n${title} (${name}) is ready.`);
if (issuer) {
  const origin = host ? `https://${host}` : "<origin>";
  console.log(`\nRegister the client at the issuer: a public client "${clientId}" with`);
  console.log(`  redirect      ${origin}/signed-in`);
  console.log(`  post-logout   ${origin}/`);
}
console.log("\nThen: ./deploy/setup.sh once, ./deploy/deploy.sh after.");
