/**
 * Finalize es/ar string maps from chunks + existing partial maps.
 * Run: node scripts/locale-data/finalize-maps.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const chunkDir = path.join(dir, "chunks");
const enStrings = JSON.parse(fs.readFileSync(path.join(dir, "en-strings.json"), "utf8"));

function isPassthrough(s) {
  if (!s) return true;
  if (s.startsWith("/") || s.startsWith("http") || s.includes(".webp")) return true;
  if (/^[a-z0-9-]+$/.test(s) && s.includes("-")) return true;
  return false;
}

function isPureSpec(s) {
  if (/^[0-9.]+[–-][0-9.]+\s*kg$/.test(s)) return true;
  if (/^1mm$/i.test(s)) return true;
  if (/^5000mm/i.test(s)) return true;
  if (/^\d+[–-]\d+\s*Days$/.test(s)) return true;
  if (/^UPF\s*50\+$/i.test(s)) return true;
  if (/^MOQ$/i.test(s)) return true;
  if (/^h2$/i.test(s)) return true;
  if (/^[0-9.]+\s*kg$/.test(s)) return true;
  return false;
}

const translatable = enStrings.filter((s) => !isPassthrough(s));
const esMap = {};
const arMap = {};

for (const s of translatable.filter(isPureSpec)) {
  esMap[s] = s;
  arMap[s] = s;
}

// Priority: manual chunks override everything
for (const locale of ["es", "ar"]) {
  const map = locale === "es" ? esMap : arMap;
  if (!fs.existsSync(chunkDir)) continue;
  for (const file of fs.readdirSync(chunkDir).filter((f) => f.startsWith(`${locale}-`) && f.endsWith(".json"))) {
    Object.assign(map, JSON.parse(fs.readFileSync(path.join(chunkDir, file), "utf8")));
  }
}

// Fill gaps from partial API maps (only if better than missing)
for (const locale of ["es", "ar"]) {
  const partialPath = path.join(dir, `${locale}-strings-map.json`);
  if (!fs.existsSync(partialPath)) continue;
  const partial = JSON.parse(fs.readFileSync(partialPath, "utf8"));
  const map = locale === "es" ? esMap : arMap;
  for (const [k, v] of Object.entries(partial)) {
    if (map[k]) continue;
    if (isPureSpec(k)) { map[k] = k; continue; }
    if (locale === "ar" && /[\u0600-\u06FF]/.test(v)) map[k] = v;
    else if (locale === "es" && v !== k) map[k] = v;
  }
}

const sortObj = (obj) => {
  const out = {};
  for (const k of Object.keys(obj).sort()) out[k] = obj[k];
  return out;
};

fs.writeFileSync(path.join(dir, "es-strings-map.json"), JSON.stringify(sortObj(esMap), null, 2) + "\n");
fs.writeFileSync(path.join(dir, "ar-strings-map.json"), JSON.stringify(sortObj(arMap), null, 2) + "\n");

const missEs = translatable.filter((s) => !esMap[s]);
const missAr = translatable.filter((s) => !arMap[s]);
console.log(`ES: ${Object.keys(esMap).length}/${translatable.length}, missing ${missEs.length}`);
console.log(`AR: ${Object.keys(arMap).length}/${translatable.length}, missing ${missAr.length}`);
