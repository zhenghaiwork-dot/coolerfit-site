/**
 * Mechanical cleanup for Arabic MDX MT leftovers.
 * Never mutates URL/image path lines. Safe lexical fixes only.
 * Run: node scripts/polish-ar-mdx.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/content");
const pairs = [
  [/فinyl/g, "فينيل"],
  [/الفinyl/g, "الفينيل"],
  [/بفinyl/g, "بفينيل"],
  [/لوجistics/g, "لوجستيات"],
  [/الم shortlisted/g, "المختارة مسبقاً"],
  [/shortlisted/g, "المختارة مسبقاً"],
  [/الم chemicals/g, "الكيميائية"],
  [/\bchemicals\b/g, "المواد الكيميائية"],
  [/lamination/g, "تصفيح"],
  [/laminating/g, "تصفيح"],
  [/laminated/g, "مصفّح"],
  [/\blaminate\b/g, "التصفيح"],
  [/بوليester/g, "بوليستر"],
  [/polyester/gi, "بوليستر"],
  [/ي standardize على مو spec/g, "يوحّدون مواصفات"],
  [/\bstandardize\b/g, "توحيد المواصفات"],
  [/للأسطح الم exposed/g, "للأسطح المعرّضة"],
  [/\bexposed\b/g, "المعرّضة"],
  [/زواia/g, "زوايا"],
  [/screen print/gi, "الطباعة الحريرية"],
  [/heat transfer/gi, "النقل الحراري"],
  [/embroidery/gi, "التطريز"],
  [/full-color/gi, "كاملة الألوان"],
  [/الالمستوى/g, "المستوى"],
  [/تحت ال التصفيح/g, "تحت طبقة التصفيح"],
  [/سحب علوي/g, "تصريف علوي"],
];

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith(".mdx") && p.includes(`${path.sep}ar${path.sep}`)) out.push(p);
  }
  return out;
}

function polishLine(line) {
  if (/^\s*(image|path|heroImage|ogImage)\s*:/.test(line) || /\/images\//.test(line) || /https?:\/\//.test(line)) {
    return line;
  }
  let out = line;
  for (const [re, to] of pairs) out = out.replace(re, to);
  out = out
    .replace(/\bvinyl\b/gi, "فينيل")
    .replace(/خطوط premium/g, "الخطوط عالية الجودة")
    .replace(/مستوى premium/g, "المستوى الفاخر")
    .replace(/PVC premium/g, "PVC عالي الجودة")
    .replace(/غطاء premium/g, "غطاء فاخر")
    .replace(/غطاؤنا premium/g, "غطاؤنا الفاخر")
    .replace(/premium المقاوم/g, "الفاخر المقاوم")
    .replace(/\bpremium\b/gi, "فاخر");
  return out;
}

let filesChanged = 0;
let totalRepl = 0;
for (const file of walk(root)) {
  const before = fs.readFileSync(file, "utf8");
  const after = before
    .split(/\r?\n/)
    .map((line) => {
      const next = polishLine(line);
      if (next !== line) totalRepl++;
      return next;
    })
    .join("\n");
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    filesChanged++;
    console.log(`updated ${path.relative(process.cwd(), file)}`);
  }
}
console.log(`Done. files=${filesChanged} lineChanges≈${totalRepl}`);
