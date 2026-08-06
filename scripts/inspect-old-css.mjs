import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2];
const needles = process.argv.slice(3);

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".css"))) {
  const css = fs.readFileSync(path.join(dir, file), "utf8");
  console.log("==", file, css.length);

  const opacityClasses = new Set(css.match(/\.[a-z-]*primary\\\/[0-9[\].]+/g) ?? []);
  console.log("primary opacity classes:", [...opacityClasses].join(" ") || "(none)");

  for (const needle of needles) {
    const escaped = needle.replace(/\//g, "\\\\/").replace(/[.[\]]/g, (m) => "\\" + m);
    const re = new RegExp("\\." + escaped + "[,{][^}]*\\}");
    const m = css.match(re);
    console.log(needle, "=>", m ? m[0].slice(0, 160) : "NONE");
  }
}
