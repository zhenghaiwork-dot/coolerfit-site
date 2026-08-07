/**
 * Retry failed translations with backoff; saves progress incrementally.
 * Run: node scripts/locale-data/retry-failed-translations.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const enStrings = JSON.parse(fs.readFileSync(path.join(dir, "en-strings.json"), "utf8"));

function isPassthrough(s) {
  if (!s) return true;
  if (s.startsWith("/") || s.startsWith("http") || s.includes(".webp")) return true;
  if (/^[a-z0-9-]+$/.test(s) && s.includes("-")) return true;
  return false;
}

function isPureSpec(s) {
  if (/^[0-9.]+[–-][0-9.]+\s*kg$/.test(s)) return true;
  if (/^[0-9]+mm$/i.test(s)) return true;
  if (/^[0-9]+mm\s/.test(s)) return true;
  if (/^\d+[–-]\d+\s*Days$/.test(s)) return true;
  if (/^UPF\s*50\+$/i.test(s)) return true;
  if (/^MOQ$/i.test(s)) return true;
  if (/^h2$/i.test(s)) return true;
  if (/^[0-9.]+\s*kg$/.test(s)) return true;
  if (/^5000mm H₂O$/.test(s)) return true;
  if (/^1\s*Unit$/i.test(s)) return true;
  return false;
}

function needsTranslation(key, value, locale) {
  if (isPureSpec(key)) return false;
  if (value !== key) {
    if (locale === "ar" && /[\u0600-\u06FF]/.test(value)) return false;
    if (locale === "es" && value !== key) return false;
  }
  return value === key || (locale === "ar" && !/[\u0600-\u06FF]/.test(value));
}

function preProcessEn(s) {
  return s
    .replace(/\bswamp cooler\b/gi, "evaporative cooler")
    .replace(/\bcooler covers?\b/gi, (m) => m.replace(/cooler cover(s)?/gi, "evaporative cooler protective $1"))
    .replace(/\bGet a quote\b/g, "Request a price quote")
    .replace(/\bquote form\b/gi, "price quote form");
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
    .replace(/\bWinteriz/g, "Preparación invernal")
    .replace(/\bwinteriz/gi, "preparación invernal");
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
    .replace(/\bRequest a quote\b/gi, "اطلب عرض سعر")
    .replace(/\bWinteriz/g, "تجهيز شتوي")
    .replace(/\bwinteriz/gi, "تجهيز شتوي");
}

async function translateMyMemory(text, to) {
  const src = preProcessEn(text);
  const q = encodeURIComponent(src.slice(0, 450));
  const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=en|${to}`;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url);
    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 5000 * (attempt + 1)));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.responseStatus !== 200) throw new Error(data.responseDetails);
    return data.responseData.translatedText;
  }
  throw new Error("429 exhausted");
}

const sortObj = (obj) => {
  const out = {};
  for (const k of Object.keys(obj).sort()) out[k] = obj[k];
  return out;
};

const translatable = enStrings.filter((s) => !isPassthrough(s));

for (const locale of ["es", "ar"]) {
  const file = path.join(dir, `${locale}-strings-map.json`);
  const map = JSON.parse(fs.readFileSync(file, "utf8"));
  const post = locale === "es" ? postProcessEs : postProcessAr;
  const pending = translatable.filter((s) => needsTranslation(s, map[s], locale));
  console.log(`${locale}: ${pending.length} pending`);

  for (let i = 0; i < pending.length; i++) {
    const s = pending[i];
    try {
      let t = await translateMyMemory(s, locale);
      t = post(t);
      if (needsTranslation(s, t, locale)) {
        console.warn(`  Still untranslated: ${s.slice(0, 50)}`);
      } else {
        map[s] = t;
      }
    } catch (e) {
      console.error(`  Fail: ${s.slice(0, 40)}... ${e.message}`);
    }
    if ((i + 1) % 20 === 0) {
      fs.writeFileSync(file, JSON.stringify(sortObj(map), null, 2) + "\n");
      console.log(`  ${locale}: saved ${i + 1}/${pending.length}`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  fs.writeFileSync(file, JSON.stringify(sortObj(map), null, 2) + "\n");
  const still = translatable.filter((s) => needsTranslation(s, map[s], locale));
  console.log(`${locale} done. Still pending: ${still.length}`);
}
