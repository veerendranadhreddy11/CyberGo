import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const directory = "out";
const allFiles = (await readdir(directory, { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile())
  .map(entry => join(entry.parentPath, entry.name).slice(directory.length));
const assets = ["/", ...allFiles.filter(path => path.startsWith("/_next/static/") || path === "/icon.png"), "/orbit.webp"].sort();
const hash = createHash("sha256");
for (const asset of assets) hash.update(await readFile(directory + (asset === "/" ? "/index.html" : asset)));
const key = "cybergo-" + hash.digest("hex").slice(0, 12);
await writeFile(join(directory, "offline.js"), [
  'const key = ' + JSON.stringify(key) + ';',
  'const assets = ' + JSON.stringify(assets) + ';',
  await readFile("scripts/service-worker.js", "utf8")
].join("\n"));
console.log("Prepared offline cache for " + assets.length + " files.");
