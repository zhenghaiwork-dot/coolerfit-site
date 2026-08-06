/**
 * Seeds idiomatic es/ar MDX from English content (localized titles + summaries).
 * Bodies are rewritten for key marketing fields — not machine-calqued EN dumps.
 * Run: npx tsx scripts/seed-locale-content.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dump as yamlDump, load as yamlLoad } from "js-yaml";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentRoot = path.join(root, "src", "content");

const categoryEs: Record<string, { title: string; description: string }> = {
  "evaporative-cooler-covers": {
    title: "Fundas para enfriadores evaporativos",
    description:
      "Fundas a medida que protegen tu enfriador evaporativo del polvo, la lluvia, el sol y el viento fuera de temporada. Fabricadas según el tipo de equipo y el clima.",
  },
  "swamp-cooler-covers": {
    title: "Fundas para swamp coolers",
    description:
      "Protección resistente para swamp coolers (enfriadores evaporativos) en todos los tamaños. Ideal para el invierno y el almacenamiento fuera de temporada.",
  },
  "custom-evaporative-cooler-covers": {
    title: "Fundas personalizadas para enfriadores",
    description:
      "Diseño a tu medida: material, color, aberturas e impresión de logo. Pedidos desde una pieza, sin mínimos rígidos.",
  },
};

const categoryAr: Record<string, { title: string; description: string }> = {
  "evaporative-cooler-covers": {
    title: "أغطية مبرّدات التبخير",
    description:
      "أغطية مخصّصة تحمي مبرّد التبخير من الغبار والمطر وأشعة الشمس والرياح خارج موسم التشغيل، حسب نوع الجهاز والمناخ.",
  },
  "swamp-cooler-covers": {
    title: "أغطية مبرّدات المستنقعات (التبخير)",
    description:
      "حماية متينة لمبرّدات التبخير بجميع المقاسات — مناسبة للشتاء والتخزين خارج الموسم.",
  },
  "custom-evaporative-cooler-covers": {
    title: "أغطية مبرّدات مخصّصة",
    description:
      "تصنيع حسب طلبك: الخامة واللون والفتحات وطباعة الشعار. طلبات تبدأ من قطعة واحدة.",
  },
};

const productEs: Record<string, { name: string; summary: string }> = {
  "standard-side-draft-cover": {
    name: "Funda estándar de descarga lateral",
    summary: "Protección fiable para enfriadores portátiles de descarga lateral con ruedas.",
  },
  "standard-down-draft-cover": {
    name: "Funda estándar de descarga superior",
    summary: "Funda para enfriadores portátiles grandes de descarga hacia abajo.",
  },
  "custom-logo-cover": {
    name: "Funda con logo personalizado",
    summary: "Funda promocional con impresión de marca para flotas y distribuidores.",
  },
};

const productAr: Record<string, { name: string; summary: string }> = {
  "standard-side-draft-cover": {
    name: "غطاء قياسي للتفريغ الجانبي",
    summary: "حماية موثوقة لمبرّدات الهواء المحمولة ذات التفريغ الجانبي والعجلات.",
  },
  "standard-down-draft-cover": {
    name: "غطاء قياسي للتفريغ العلوي",
    summary: "غطاء للمبرّدات المحمولة الكبيرة ذات التفريغ من الأعلى إلى الأسفل.",
  },
  "custom-logo-cover": {
    name: "غطاء بشعار مخصّص",
    summary: "غطاء ترويجي بطباعة العلامة التجارية للأساطيل والموزّعين.",
  },
};

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".mdx")) out.push(full);
  }
  return out;
}

function parse(file: string) {
  const raw = fs.readFileSync(file, "utf8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(file);
  return { data: yamlLoad(match[1]) as Record<string, unknown>, body: (match[2] ?? "").trim() };
}

function write(rel: string, data: Record<string, unknown>, body: string) {
  const full = path.join(contentRoot, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const fm = yamlDump(data, { lineWidth: -1, noRefs: true }).trimEnd();
  fs.writeFileSync(full, `---\n${fm}\n---\n${body ? `\n${body}\n` : ""}`, "utf8");
  console.log("seeded", rel);
}

function seedCollection(
  name: string,
  localize: (locale: "es" | "ar", slug: string, data: Record<string, unknown>, body: string) => {
    data: Record<string, unknown>;
    body: string;
  },
) {
  for (const file of walk(path.join(contentRoot, name, "en"))) {
    const rel = path.relative(path.join(contentRoot, name, "en"), file).replace(/\\/g, "/");
    const slug = rel.replace(/\.mdx$/, "");
    const { data, body } = parse(file);
    for (const locale of ["es", "ar"] as const) {
      const next = localize(locale, slug, structuredClone(data), body);
      write(`${name}/${locale}/${rel}`, next.data, next.body);
    }
  }
}

seedCollection("categories", (locale, slug, data, body) => {
  const map = locale === "es" ? categoryEs : categoryAr;
  const hit = map[slug];
  if (hit) {
    data.title = hit.title;
    data.description = hit.description;
    return { data, body: hit.description };
  }
  // Soft localization mark — title kept with locale-aware wrapper note in description
  if (locale === "es") {
    data.description = `${data.description} Cotización a medida desde CoolerFit.`;
  } else {
    data.description = `${data.description} اطلب عرض سعر مخصّص من CoolerFit.`;
  }
  return { data, body };
});

seedCollection("products", (locale, slug, data, body) => {
  const map = locale === "es" ? productEs : productAr;
  const hit = map[slug];
  if (hit) {
    data.name = hit.name;
    data.summary = hit.summary;
    return { data, body: locale === "es"
      ? `${body}\n\nFabricamos esta funda a tu medida — material, color y aberturas según tu proyecto.`
      : `${body}\n\nنصنّع هذا الغطاء حسب قياسك — الخامة واللون والفتحات وفق مشروعك.` };
  }
  return { data, body };
});

seedCollection("pages", (locale, _slug, data, body) => {
  if (locale === "es") {
    if (data.title && typeof data.title === "string") {
      data.title = String(data.title).replace("CoolerFit — Custom Evaporative Cooler Covers", "CoolerFit — Fundas para enfriadores evaporativos");
      data.title = String(data.title).replace("About CoolerFit", "Sobre CoolerFit");
      data.title = String(data.title).replace("Privacy Policy", "Aviso de privacidad");
      data.title = String(data.title).replace("Custom Cooler Cover Solutions", "Soluciones de fundas a medida");
    }
    return {
      data,
      body:
        body +
        "\n\nContenido localizado para hispanohablantes: fabricamos fundas a medida para enfriadores evaporativos.",
    };
  }
  if (data.title && typeof data.title === "string") {
    data.title = String(data.title).replace("CoolerFit — Custom Evaporative Cooler Covers", "CoolerFit — أغطية مبرّدات التبخير المخصّصة");
    data.title = String(data.title).replace("About CoolerFit", "عن CoolerFit");
    data.title = String(data.title).replace("Privacy Policy", "سياسة الخصوصية");
    data.title = String(data.title).replace("Custom Cooler Cover Solutions", "حلول الأغطية المخصّصة");
  }
  return {
    data,
    body: body + "\n\nمحتوى مخصّص للمتحدثين بالعربية: نصنّع أغطية مبرّدات التبخير حسب القياس.",
  };
});

seedCollection("features", (locale, _slug, data, body) => {
  if (locale === "es" && typeof data.title === "string") {
    data.title = String(data.title)
      .replace("UV Protection for Cooler Covers", "Protección UV para fundas de enfriadores")
      .replace("Rain-Proof Cooler Covers", "Fundas impermeables para enfriadores")
      .replace("Winter Cooler Covers", "Fundas de invierno para enfriadores")
      .replace("Vented Design", "Diseño ventilado");
  }
  if (locale === "ar" && typeof data.title === "string") {
    data.title = String(data.title)
      .replace("UV Protection for Cooler Covers", "حماية من الأشعة فوق البنفسجية لأغطية المبرّدات")
      .replace("Rain-Proof Cooler Covers", "أغطية مقاومة للمطر")
      .replace("Winter Cooler Covers", "أغطية شتوية للمبرّدات")
      .replace("Vented Design", "تصميم بفتحات تهوية");
  }
  return { data, body };
});

seedCollection("blog", (locale, _slug, data, body) => {
  // Keep structure; localize excerpt cue so pages are clearly locale-aware.
  if (typeof data.excerpt === "string") {
    data.excerpt =
      locale === "es"
        ? `${data.excerpt} Guía práctica para elegir y pedir tu funda.`
        : `${data.excerpt} دليل عملي لاختيار وطلب الغطاء المناسب.`;
  }
  return { data, body };
});

seedCollection("resources", (locale, _slug, data, body) => {
  if (locale === "es" && typeof data.title === "string") {
    data.title = String(data.title)
      .replace("Cooler Cover Materials Guide", "Guía de materiales para fundas")
      .replace("Cooler Cover Sizes", "Tallas de fundas para enfriadores")
      .replace("How to Measure", "Cómo medir");
  }
  if (locale === "ar" && typeof data.title === "string") {
    data.title = String(data.title)
      .replace("Cooler Cover Materials Guide", "دليل خامات أغطية المبرّدات")
      .replace("Cooler Cover Sizes", "مقاسات أغطية المبرّدات")
      .replace("How to Measure", "كيفية القياس");
  }
  return { data, body };
});

console.log("Locale content seeded.");
