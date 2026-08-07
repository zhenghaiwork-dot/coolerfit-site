/**
 * Merge translation chunk files into es-strings-map.json and ar-strings-map.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const chunkDir = path.join(dir, "chunks");

function isPassthrough(s) {
  if (!s) return true;
  if (s.startsWith("/") || s.startsWith("http") || s.includes(".webp")) return true;
  if (/^[a-z0-9-]+$/.test(s) && s.includes("-")) return true;
  return false;
}

function isPureSpec(s) {
  if (/^[0-9.]+[–-][0-9.]+\s*kg$/.test(s)) return true;
  if (/^[0-9]+(\.[0-9]+)?\s*mm(\s|$)/i.test(s) && s.length < 30) return true;
  if (/^[0-9]+mm\s/.test(s)) return true;
  if (/^\d+[–-]\d+\s*Days$/.test(s)) return true;
  if (/^UPF\s*50\+$/i.test(s)) return true;
  if (/^MOQ$/i.test(s)) return true;
  if (/^h2$/i.test(s)) return true;
  if (/^1\s*Unit$/i.test(s)) return true;
  if (/^[0-9.]+\s*kg$/.test(s)) return true;
  return false;
}

const enStrings = JSON.parse(fs.readFileSync(path.join(dir, "en-strings.json"), "utf8"));
const translatable = enStrings.filter((s) => !isPassthrough(s));

const esMap = {};
const arMap = {};

// Pure specs passthrough
for (const s of translatable.filter(isPureSpec)) {
  esMap[s] = s;
  arMap[s] = s;
}

// Load chunks
for (const locale of ["es", "ar"]) {
  const map = locale === "es" ? esMap : arMap;
  const files = fs.readdirSync(chunkDir).filter((f) => f.startsWith(`${locale}-`) && f.endsWith(".json")).sort();
  for (const file of files) {
    const chunk = JSON.parse(fs.readFileSync(path.join(chunkDir, file), "utf8"));
    Object.assign(map, chunk);
  }
}

const sortObj = (obj) => {
  const out = {};
  for (const k of Object.keys(obj).sort()) out[k] = obj[k];
  return out;
};

fs.writeFileSync(path.join(dir, "es-strings-map.json"), JSON.stringify(sortObj(esMap), null, 2) + "\n");
fs.writeFileSync(path.join(dir, "ar-strings-map.json"), JSON.stringify(sortObj(arMap), null, 2) + "\n");

const missingEs = translatable.filter((s) => !esMap[s]);
const missingAr = translatable.filter((s) => !arMap[s]);
console.log(`ES: ${Object.keys(esMap).length} entries, missing: ${missingEs.length}`);
console.log(`AR: ${Object.keys(arMap).length} entries, missing: ${missingAr.length}`);
if (missingEs.length) console.log("Missing ES sample:", missingEs.slice(0, 5));
