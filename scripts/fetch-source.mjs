import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = "https://github.com/Code2With-Pratik/SPYLT-GSAP-Animated-Website/archive/refs/heads/main.zip";

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

const zipPath = path.join(root, ".spylt-source.zip");
const zipBuffer = await download(source);
fs.writeFileSync(zipPath, zipBuffer);

const zip = new AdmZip(zipPath);
const entry = zip.getEntries().find(e => e.entryName.endsWith("/package.json"));
if (!entry) throw new Error("SPYLT source archive was not found.");

const prefix = entry.entryName.slice(0, -("package.json".length));

for (const name of ["src/", "public/", "index.html", "vite.config.js", "eslint.config.js"]) {
  const full = prefix + name;
  const matches = zip.getEntries().filter(e => e.entryName === full || e.entryName.startsWith(full));
  for (const item of matches) {
    const relative = item.entryName.slice(prefix.length);
    if (!relative || item.isDirectory) continue;
    const destination = path.join(root, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, item.getData());
  }
}

fs.rmSync(zipPath, { force: true });
console.log("SPYLT source synchronized.");
