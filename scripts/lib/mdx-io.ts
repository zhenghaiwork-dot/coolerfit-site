import fs from "node:fs";
import path from "node:path";
import { dump as yamlDump, load as yamlLoad } from "js-yaml";

export function walkMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMdx(full));
    else if (entry.name.endsWith(".mdx")) out.push(full);
  }
  return out;
}

export function parseMdx(file: string) {
  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`Invalid MDX frontmatter: ${file}`);
  return {
    data: yamlLoad(match[1]) as Record<string, unknown>,
    body: (match[2] ?? "").trim(),
  };
}

export function writeMdx(file: string, data: Record<string, unknown>, body: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const fm = yamlDump(data, { lineWidth: -1, noRefs: true }).trimEnd();
  fs.writeFileSync(file, `---\n${fm}\n---\n${body ? `\n${body}\n` : ""}`, "utf8");
}
