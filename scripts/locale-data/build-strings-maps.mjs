/**
 * Build es-strings-map.json and ar-strings-map.json from en-strings.json
 * Uses MyMemory API + terminology post-processing + existing chunks
 * Run: node scripts/locale-data/build-strings-maps.mjs
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
  if (/^[0-9]+(\.[0-9]+)?\s*mm(\s|$)/i.test(s) && s.length < 30) return true;
  if (/^[0-9]+mm\s/.test(s)) return true;
  if (/^\d+[–-]\d+\s*Days$/.test(s)) return true;
  if (/^UPF\s*50\+$/i.test(s)) return true;
  if (/^MOQ$/i.test(s)) return true;
  if (/^h2$/i.test(s)) return true;
  if (/^[0-9.]+\s*kg$/.test(s)) return true;
  return false;
}

function preProcessEn(s) {
  return s
    .replace(/\bswamp cooler\b/gi, "evaporative cooler")
    .replace(/\bcooler cover\b/gi, "evaporative cooler protective cover")
    .replace(/\bcooler covers\b/gi, "evaporative cooler protective covers")
    .replace(/\bGet a quote\b/g, "Request a price quote")
    .replace(/\bquote form\b/gi, "price quote form");
}

function postProcessEs(text) {
  return text
    .replace(/cubierta(s)? del enfriador/gi, (_, s) => (s ? "fundas para enfriador" : "funda para enfriador"))
    .replace(/cubierta(s)? evaporativ/gi, (_, s) => (s ? "fundas evaporativas" : "funda evaporativa"))
    .replace(/\bcubierta(s)?\b/gi, (_, s) => (s ? "fundas" : "funda"))
    .replace(/\bpresupuesto\b/gi, "cotización")
    .replace(/\bswamp cooler\b/gi, "enfriador evaporativo")
    .replace(/\bevaporative cooler\b/gi, "enfriador evaporativo")
    .replace(/\bair cooler\b/gi, "enfriador de aire")
    .replace(/\bcooler cover\b/gi, "funda para enfriador")
    .replace(/\bcooler covers\b/gi, "fundas para enfriador")
    .replace(/\bdown-draft\b/gi, "descarga superior")
    .replace(/\bside-draft\b/gi, "tiro lateral")
    .replace(/\bsmall batch\b/gi, "lote pequeño")
    .replace(/\bSmall Batch\b/g, "Lote pequeño")
    .replace(/\bBulk\b/g, "Mayoreo")
    .replace(/\bbulk\b/g, "mayoreo");
}

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

async function translateOne(text, to) {
  const src = preProcessEn(text);
  const q = encodeURIComponent(src.slice(0, 500));
  const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=en|${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails || "translate failed");
  return data.responseData.translatedText;
}

async function translateBatch(strings, to, postProcess) {
  const results = {};
  for (let i = 0; i < strings.length; i++) {
    const s = strings[i];
    try {
      let t = await translateOne(s, to);
      t = postProcess(t);
      results[s] = t;
      if ((i + 1) % 25 === 0) console.log(`  ${to}: ${i + 1}/${strings.length}`);
      await new Promise((r) => setTimeout(r, 350));
    } catch (e) {
      console.error(`Failed [${to}]: ${s.slice(0, 50)}...`, e.message);
      results[s] = s;
    }
  }
  return results;
}

const translatable = enStrings.filter((s) => !isPassthrough(s));
const esMap = {};
const arMap = {};

// Pure specs passthrough
for (const s of translatable.filter(isPureSpec)) {
  esMap[s] = s;
  arMap[s] = s;
}

// Load existing manual chunks first
if (fs.existsSync(chunkDir)) {
  for (const locale of ["es", "ar"]) {
    const map = locale === "es" ? esMap : arMap;
    for (const file of fs.readdirSync(chunkDir).filter((f) => f.startsWith(`${locale}-`) && f.endsWith(".json"))) {
      Object.assign(map, JSON.parse(fs.readFileSync(path.join(chunkDir, file), "utf8")));
    }
  }
}

const missingEs = translatable.filter((s) => !esMap[s]);
const missingAr = translatable.filter((s) => !arMap[s]);

console.log(`Already translated ES: ${Object.keys(esMap).length}, missing: ${missingEs.length}`);
console.log(`Already translated AR: ${Object.keys(arMap).length}, missing: ${missingAr.length}`);

if (missingEs.length) {
  console.log("Translating remaining to Spanish...");
  Object.assign(esMap, await translateBatch(missingEs, "es", postProcessEs));
}

if (missingAr.length) {
  console.log("Translating remaining to Arabic...");
  Object.assign(arMap, await translateBatch(missingAr, "ar", postProcessAr));
}

const sortObj = (obj) => {
  const out = {};
  for (const k of Object.keys(obj).sort()) out[k] = obj[k];
  return out;
};

fs.writeFileSync(path.join(dir, "es-strings-map.json"), JSON.stringify(sortObj(esMap), null, 2) + "\n");
fs.writeFileSync(path.join(dir, "ar-strings-map.json"), JSON.stringify(sortObj(arMap), null, 2) + "\n");

console.log(`Wrote es-strings-map.json: ${Object.keys(esMap).length} entries`);
console.log(`Wrote ar-strings-map.json: ${Object.keys(arMap).length} entries`);

// Validate no English-only passthrough for long strings
const enLeftEs = translatable.filter((s) => esMap[s] === s && !isPureSpec(s) && s.length > 30);
const enLeftAr = translatable.filter((s) => arMap[s] === s && !isPureSpec(s) && s.length > 30);
console.log(`Untranslated long ES: ${enLeftEs.length}, AR: ${enLeftAr.length}`);
