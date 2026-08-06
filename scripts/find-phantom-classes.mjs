/**
 * Finds utility classes the old Tailwind v3 build silently dropped.
 *
 * v3 only honoured slash-opacity values on its fixed scale (0,5,10,…,100) and
 * colour names registered in tailwind.config. v4 accepts any opacity number,
 * so those classes start producing CSS after the upgrade — a visual change we
 * need to catch rather than inherit by accident.
 */
import fs from "node:fs";
import path from "node:path";

const srcDir = process.argv[2];
const cssFile = process.argv[3];
const css = fs.readFileSync(cssFile, "utf8");

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|ts|css)$/.test(entry.name)) files.push(full);
  }
})(srcDir);

const hits = new Map();
// Class strings also hide inside cn(...) arguments and cva() variant maps, so
// every quoted string is scanned rather than just className attributes.
const STRING_LITERAL = /"([^"\n]*)"|`([^`]*)`|'([^'\n]*)'/g;

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  let m;
  while ((m = STRING_LITERAL.exec(text))) {
    const value = m[1] ?? m[2] ?? m[3] ?? "";
    for (const token of value.split(/\s+/)) {
      const cls = token.replace(/^[a-z-]+:/g, "").trim();
      if (!cls) continue;
      const slash = cls.match(/\/(\d+)$/);
      const suspicious =
        (slash && Number(slash[1]) % 5 !== 0) || /-primary-accent$/.test(cls);
      if (!suspicious) continue;
      if (!hits.has(cls)) hits.set(cls, new Set());
      hits.get(cls).add(path.relative(srcDir, file));
    }
  }
}

const escapeForCss = (cls) =>
  "." + cls.replace(/[/.[\]()]/g, (c) => "\\\\" + c).replace(/[+*?^$|]/g, "\\$&");

console.log(`Scanned ${files.length} files\n`);
for (const [cls, where] of [...hits].sort()) {
  const emitted = new RegExp(escapeForCss(cls) + "[,{ ]").test(css);
  console.log(
    `${emitted ? "EMITTED " : "DROPPED "} ${cls.padEnd(28)} ${[...where].join(", ")}`,
  );
}
