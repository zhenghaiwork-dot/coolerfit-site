/**
 * Fill missing ES/AR string-map entries for money-page MDX only.
 * Run: node scripts/fill-money-translations.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as yamlLoad } from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "scripts/locale-data");
const collections = ["categories", "products", "features", "pages"];

function isPassthrough(s) {
  if (!s) return true;
  if (s.startsWith("/") || s.startsWith("http") || s.includes(".webp")) return true;
  if (/^[a-z0-9-]+$/.test(s) && s.includes("-")) return true;
  return false;
}

function isPureSpec(s) {
  if (/^[0-9.]+[–-][0-9.]+\s*kg$/.test(s)) return true;
  if (/^[0-9]+(\.[0-9]+)?\s*mm(\s|$)/i.test(s) && s.length < 30) return true;
  if (/^\d+[–-]\d+\s*Days$/.test(s)) return true;
  if (/^UPF\s*50\+$/i.test(s)) return true;
  if (/^[0-9.]+\s*kg$/.test(s)) return true;
  if (/^5000mm/i.test(s)) return true;
  return false;
}

function collectStrings(value, out) {
  if (typeof value === "string") out.add(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectStrings(v, out));
}

function moneyPageStrings() {
  const strings = new Set();
  for (const collection of collections) {
    const enDir = path.join(root, "src/content", collection, "en");
    for (const file of fs.readdirSync(enDir).filter((f) => f.endsWith(".mdx"))) {
      const raw = fs.readFileSync(path.join(enDir, file), "utf8");
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      if (!match) continue;
      collectStrings(yamlLoad(match[1]), strings);
      const body = match[2]?.trim();
      if (body) strings.add(body);
    }
  }
  return [...strings].filter((s) => !isPassthrough(s));
}

function preProcessEn(s) {
  return s
    .replace(/\bswamp cooler\b/gi, "evaporative cooler")
    .replace(/\bcooler cover\b/gi, "evaporative cooler protective cover")
    .replace(/\bcooler covers\b/gi, "evaporative cooler protective covers");
}

function postProcessEs(text) {
  return text
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
    .replace(/\bbulk\b/g, "mayoreo")
    .replace(/\bGet a quote\b/gi, "Solicitar cotización")
    .replace(/\bRequest a quote\b/gi, "Solicitar cotización")
    .replace(/\bquote\b/gi, "cotización");
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
    .replace(/\bGet a quote\b/gi, "اطلب عرض سعر")
    .replace(/\bRequest a quote\b/gi, "اطلب عرض سعر")
    .replace(/\bquote\b/gi, "عرض سعر");
}

function needsTranslation(key, value, locale) {
  if (isPureSpec(key)) return false;
  if (locale === "ar") return !value || value === key || !/[\u0600-\u06FF]/.test(value);
  return !value || value === key;
}

async function translateOne(text, to) {
  const src = preProcessEn(text);
  const q = encodeURIComponent(src.slice(0, 450));
  const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=en|${to}`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.responseStatus === 200) return data.responseData.translatedText;
    if (data.responseStatus === 429) {
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
      continue;
    }
    throw new Error(data.responseDetails || "translate failed");
  }
  throw new Error("rate limited");
}

async function fillMap(map, strings, locale, postProcess) {
  const pending = strings.filter((s) => needsTranslation(s, map[s], locale));
  console.log(`${locale}: ${pending.length} money-page strings to translate`);
  for (let i = 0; i < pending.length; i++) {
    const s = pending[i];
    try {
      let t = await translateOne(s, locale);
      t = postProcess(t);
      if (!needsTranslation(s, t, locale)) map[s] = t;
      else console.warn(`  still untranslated: ${s.slice(0, 60)}`);
    } catch (e) {
      console.error(`  fail: ${s.slice(0, 50)} — ${e.message}`);
    }
    if ((i + 1) % 20 === 0) console.log(`  ${locale}: ${i + 1}/${pending.length}`);
    await new Promise((r) => setTimeout(r, 400));
  }
}

const sortObj = (obj) => {
  const out = {};
  for (const k of Object.keys(obj).sort()) out[k] = obj[k];
  return out;
};

const strings = moneyPageStrings();
const esMap = JSON.parse(fs.readFileSync(path.join(dir, "es-strings-map.json"), "utf8"));
const arMap = JSON.parse(fs.readFileSync(path.join(dir, "ar-strings-map.json"), "utf8"));

for (const s of strings.filter(isPureSpec)) {
  esMap[s] = esMap[s] ?? s;
  arMap[s] = arMap[s] ?? s;
}

await fillMap(esMap, strings, "es", postProcessEs);
fs.writeFileSync(path.join(dir, "es-strings-map.json"), JSON.stringify(sortObj(esMap), null, 2) + "\n");

await fillMap(arMap, strings, "ar", postProcessAr);
fs.writeFileSync(path.join(dir, "ar-strings-map.json"), JSON.stringify(sortObj(arMap), null, 2) + "\n");

const missEs = strings.filter((s) => needsTranslation(s, esMap[s], "es"));
const missAr = strings.filter((s) => needsTranslation(s, arMap[s], "ar"));
console.log(`Done. ES missing: ${missEs.length}, AR missing: ${missAr.length}`);
