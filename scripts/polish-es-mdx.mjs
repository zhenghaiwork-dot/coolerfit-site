/**
 * Light MX-Spanish terminology pass on es MDX.
 * Prefer funda / enfriador evaporativo / cotización wording where awkward EN leftovers or cubierta appear for the product.
 * Run: node scripts/polish-es-mdx.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/content");

/** Apply only outside YAML keys / URL paths — simple whole-file cautious replacements */
const pairs = [
  // Prefer funda for product in common phrases (not architecture "cubierta")
  [/cubiertas personalizadas para enfriadores/gi, "fundas personalizadas para enfriadores"],
  [/cubierta personalizada para enfriador/gi, "funda personalizada para enfriador"],
  [/cubiertas para enfriador evaporativo/gi, "fundas para enfriador evaporativo"],
  [/cubierta para enfriador evaporativo/gi, "funda para enfriador evaporativo"],
  [/cubiertas para cooler/gi, "fundas para cooler"],
  [/Get a Quote/g, "Pide cotización"],
  [/Request a Quote/g, "Solicitar cotización"],
  [/Click here/gi, "Consulta aquí"],
  [/Learn more/g, "Más información"],
  // Soften overused English "premium" in product naming mid-sentence when paired with Spanish
  [/funda premium impermeable/gi, "funda impermeable de alta gama"],
  [/líneas premium impermeables/gi, "líneas impermeables de alta gama"],
  [/línea premium/gi, "línea de alta gama"],
  [/nivel premium/gi, "nivel de alta gama"],
  [/branding premium/gi, "imagen de marca de alta calidad"],
  [/textura premium/gi, "textura de alta calidad"],
];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith(".mdx") && p.includes(`${path.sep}es${path.sep}`)) out.push(p);
  }
  return out;
}

let filesChanged = 0;
let totalRepl = 0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  let n = 0;
  for (const [re, to] of pairs) {
    text = text.replace(re, () => {
      n++;
      return to;
    });
  }
  if (text !== before) {
    fs.writeFileSync(file, text, "utf8");
    filesChanged++;
    totalRepl += n;
    console.log(`updated ${path.relative(process.cwd(), file)} (${n})`);
  }
}
console.log(`Done. files=${filesChanged} replacements≈${totalRepl}`);
