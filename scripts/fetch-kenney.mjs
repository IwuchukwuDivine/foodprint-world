/**
 * Downloads the Kenney packs listed in models-allowlist.mjs to a scratch dir,
 * unzips them, and copies only the allowlisted GLBs into public/models/<pack>/.
 * Writes CREDITS.md. Re-runnable: existing zips are not re-downloaded.
 *
 *   node scripts/fetch-kenney.mjs [--scratch <dir>] [--only roads,cars]
 */
import { execFileSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, copyFileSync, writeFileSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { PACKS, SIZE_BUDGET } from "./models-allowlist.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const scratch = resolve(args.includes("--scratch") ? args[args.indexOf("--scratch") + 1] : join(root, ".kenney"));
const only = args.includes("--only") ? args[args.indexOf("--only") + 1].split(",") : Object.keys(PACKS);
const outDir = join(root, "public", "models");

mkdirSync(scratch, { recursive: true });
mkdirSync(outDir, { recursive: true });

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

async function download(url, dest) {
  if (existsSync(dest) && statSync(dest).size > 0) return;
  console.log(`  downloading ${url}`);
  const res = await fetch(url, { headers: { "user-agent": "foodprint-world/1.0" } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

function glbFolder(files) {
  // Kenney packs keep GLBs under "Models/GLB format/" (or similar). Pick the
  // directory that holds the most .glb files.
  const counts = new Map();
  for (const f of files) {
    if (!f.toLowerCase().endsWith(".glb")) continue;
    const dir = dirname(f);
    counts.set(dir, (counts.get(dir) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

let total = 0;
const credits = [];
const missing = [];

for (const key of only) {
  const pack = PACKS[key];
  if (!pack) throw new Error(`unknown pack ${key}`);
  console.log(`\n${pack.name}`);
  const zip = join(scratch, `${key}.zip`);
  const dir = join(scratch, key);
  await download(pack.url, zip);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    execFileSync("unzip", ["-q", "-o", zip, "-d", dir]);
  }
  const files = walk(dir);
  const folder = glbFolder(files);
  if (!folder) throw new Error(`${key}: no GLB folder found`);
  const available = new Map(
    files.filter((f) => dirname(f) === folder).map((f) => [basename(f, ".glb"), f]),
  );
  const target = join(outDir, key);
  mkdirSync(target, { recursive: true });
  let packBytes = 0;
  for (const name of pack.files) {
    const src = available.get(name);
    if (!src) {
      missing.push(`${key}/${name}`);
      continue;
    }
    const dest = join(target, `${name}.glb`);
    copyFileSync(src, dest);
    packBytes += statSync(dest).size;
  }
  // Kenney GLBs reference their pack's atlas as "Textures/colormap.png"
  // relative to the model, so the folder has to travel with them.
  const texDir = join(folder, "Textures");
  if (existsSync(texDir)) {
    mkdirSync(join(target, "Textures"), { recursive: true });
    for (const tex of readdirSync(texDir)) {
      const dest = join(target, "Textures", tex);
      copyFileSync(join(texDir, tex), dest);
      packBytes += statSync(dest).size;
    }
  }
  total += packBytes;
  console.log(`  ${pack.files.length - missing.filter((m) => m.startsWith(key + "/")).length} files, ${(packBytes / 1024).toFixed(0)} KB`);
  console.log(`  available in pack: ${[...available.keys()].sort().join(", ")}`);
  credits.push(`- **${pack.name}** by Kenney (${pack.page}), Creative Commons CC0.`);
}

writeFileSync(
  join(root, "CREDITS.md"),
  `# Credits\n\nThe 3D models in \`public/models/\` come from these free packs, all released into the public domain under Creative Commons CC0 by Kenney (https://kenney.nl). Thank you, Kenney.\n\n${credits.join("\n")}\n\nFoodprint World retints some of these models and adds its own signboards and decals; the originals are unchanged.\n`,
);

console.log(`\nTotal in public/models: ${(total / 1024 / 1024).toFixed(2)} MB (budget ${(SIZE_BUDGET / 1024 / 1024).toFixed(1)} MB)`);
if (missing.length) console.log(`Missing from packs (check names): ${missing.join(", ")}`);
if (total > SIZE_BUDGET) {
  console.error("Over the size budget. Trim models-allowlist.mjs.");
  process.exit(1);
}
