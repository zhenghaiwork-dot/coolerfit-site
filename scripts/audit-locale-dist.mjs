import fs from "node:fs";
import path from "node:path";

const checks = [
  [
    "dist/ar/products/evaporative-cooler-covers/index.html",
    [
      ["H1 ar title", ["أغطية المكيف الصحراوي"]],
      ["quote to ar contact", ['href="/ar/contact']],
      ["no Custom hybrid", [(html) => !html.includes("Custom أغطية") && !html.includes("Custom Fundas")]],
      ["nav ar", ["المنتجات"]],
    ],
  ],
  [
    "dist/es/product/standard-side-draft-cover/index.html",
    [
      ["es product name", ["Funda estándar"]],
      ["customizer es", ["Personaliza esta funda"]],
      ["quote es contact", ['href="/es/contact']],
      ["submit es", ["Pedir cotización personalizada"]],
    ],
  ],
  [
    "dist/ar/blog/evaporative-cooler-covers-guide/index.html",
    [
      ["blog title ar", ["الدليل الشامل"]],
      ["blog links ar", ["/ar/blog/"]],
      ["nav resources/blog", ["المدونة", "الموارد"]],
    ],
  ],
  [
    "dist/es/materials/index.html",
    [["materials es", ["Guía de materiales", "materiales"]]],
  ],
  [
    "dist/ar/about/index.html",
    [["about localized", ["عن CoolerFit", "من نحن", "CoolerFit"]]],
  ],
];

let fail = 0;
for (const [file, rules] of checks) {
  if (!fs.existsSync(file)) {
    console.log("MISSING", file);
    fail++;
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  console.log("==", file);
  for (const [name, needles] of rules) {
    const ok = needles.some((n) => (typeof n === "function" ? n(html) : html.includes(n)));
    console.log(ok ? "  OK" : "  FAIL", name);
    if (!ok) fail++;
  }
}

function listTitles(dir) {
  return fs
    .readdirSync(dir)
    .filter((x) => x.endsWith(".mdx"))
    .map((f) => {
      const t = fs.readFileSync(path.join(dir, f), "utf8").match(/^title:\s*(.+)$/m);
      return [f, t?.[1] ?? ""];
    });
}

const enLeftoverEs = listTitles("src/content/categories/es").filter(([, t]) =>
  /^(Custom |Evaporative|Winter|Waterproof|UV-|Mesh |Industrial|Commercial|Residential)/.test(t),
);
const enLeftoverAr = listTitles("src/content/categories/ar").filter(
  ([, t]) => /[A-Za-z]{5,}/.test(t) && !/[\u0600-\u06FF]/.test(t),
);
console.log("ES category EN leftovers:", enLeftoverEs.length, enLeftoverEs.slice(0, 5));
console.log("AR category EN leftovers:", enLeftoverAr.length, enLeftoverAr.slice(0, 5));

const blogAr = listTitles("src/content/blog/ar").filter(
  ([, t]) => /[A-Za-z]{5,}/.test(t) && !/[\u0600-\u06FF]/.test(t),
);
console.log("AR blog EN leftovers:", blogAr.length, blogAr.slice(0, 5));

console.log("TOTAL_FAILS", fail);
process.exit(fail ? 1 : 0);
