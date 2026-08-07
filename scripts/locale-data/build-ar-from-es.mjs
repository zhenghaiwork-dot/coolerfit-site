/**
 * Build remaining AR chunks from ES map + embedded Gulf MSA translations.
 * Run: node scripts/locale-data/build-ar-from-es.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const chunkDir = path.join(dir, "chunks");
const enStrings = JSON.parse(fs.readFileSync(path.join(dir, "en-strings.json"), "utf8"));
const esMap = JSON.parse(fs.readFileSync(path.join(dir, "es-strings-map.json"), "utf8"));

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

/** Gulf MSA terminology replacements applied after translation */
function postProcessAr(text) {
  return text
    .replace(/\bswamp cooler\b/gi, "مكيف صحراوي")
    .replace(/\bevaporative cooler\b/gi, "مكيف صحراوي")
    .replace(/\bair cooler\b/gi, "مبرّد هواء")
    .replace(/\bcooler cover\b/gi, "غطاء مكيف صحراوي")
    .replace(/\bcooler covers\b/gi, "أغطية مكيف صحراوي")
    .replace(/\bdown-draft\b/gi, "تصريف علوي")
    .replace(/\bside-draft\b/gi, "سحب جانبي")
    .replace(/\bsmall batch\b/gi, "دفعة صغيرة")
    .replace(/\bBulk\b/g, "جملة")
    .replace(/\bbulk\b/g, "جملة")
    .replace(/\bquote\b/gi, "عرض سعر")
    .replace(/\bGet a quote\b/gi, "اطلب عرض سعر")
    .replace(/\bRequest a quote\b/gi, "اطلب عرض سعر");
}

/**
 * Manual Gulf MSA translations for remaining strings.
 * Keys are exact English strings from en-strings.json.
 */
const manualAr = JSON.parse(
  fs.readFileSync(path.join(dir, "pairs", "ar-manual.json"), "utf8")
);

const translatable = enStrings.filter((s) => !isPassthrough(s));
const arMap = {};

for (const s of translatable.filter(isPureSpec)) {
  arMap[s] = s;
}

// Load existing chunks
for (const file of fs.readdirSync(chunkDir).filter((f) => f.startsWith("ar-") && f.endsWith(".json"))) {
  Object.assign(arMap, JSON.parse(fs.readFileSync(path.join(chunkDir, file), "utf8")));
}

// Apply manual translations
for (const [k, v] of Object.entries(manualAr)) {
  if (translatable.includes(k)) arMap[k] = postProcessAr(v);
}

const missing = translatable.filter((s) => !arMap[s] || !/[\u0600-\u06FF]/.test(arMap[s]));
console.log(`AR: ${Object.keys(arMap).length}/${translatable.length}, still missing: ${missing.length}`);

if (missing.length) {
  fs.writeFileSync(path.join(dir, "pairs", "_ar-still-missing.json"), JSON.stringify(missing, null, 2));
}

const sortObj = (obj) => {
  const out = {};
  for (const k of Object.keys(obj).sort()) out[k] = obj[k];
  return out;
};

fs.writeFileSync(path.join(dir, "ar-strings-map.json"), JSON.stringify(sortObj(arMap), null, 2) + "\n");
console.log(`Wrote ar-strings-map.json: ${Object.keys(arMap).length} entries`);
