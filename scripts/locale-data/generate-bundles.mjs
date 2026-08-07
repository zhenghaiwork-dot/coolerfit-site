/**
 * Generate es/ar JSON bundles from EN source + embedded translators.
 * Run: node scripts/locale-data/generate-bundles.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const enSource = JSON.parse(fs.readFileSync(path.join(root, "scripts/locale-data/en-source.json"), "utf8"));
const outDir = path.dirname(fileURLToPath(import.meta.url));

const SKIP = new Set(["path", "categorySlugs", "relatedBlogSlugs", "clusterSlugs", "pillarSlug", "canonicalSlug", "image", "images", "isPillar", "noIndex", "level", "popular"]);

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function translateLinks(links, labels) {
  return (links ?? []).map((l, i) => ({ ...l, label: labels?.[i] ?? l.label }));
}

function translateFaqs(faqs, items) {
  return (faqs ?? []).map((f, i) => ({ q: items?.[i]?.q ?? f.q, a: items?.[i]?.a ?? f.a }));
}

/** @type {Record<string, Record<string, { es: object; ar: object }>>} */
const T = {};

// --- CATEGORIES (29) ---
T.categories = {
  "air-cooler-covers.mdx": {
    es: {
      title: "Fundas para enfriadores de aire",
      features: ["Opciones de ajuste universal", "Ligeras pero resistentes", "Resistentes al clima", "Diseño fácil de colocar y quitar"],
      links: ["Fundas para enfriadores evaporativos", "Comparación de materiales para fundas"],
      description: "Fundas protectoras para enfriadores de aire de todo tipo y tamaño. Protegen tu equipo del polvo, la lluvia, el sol y el viento cuando no está en uso.",
      seoIntro: "Las fundas para enfriadores de aire protegen unidades evaporativas portátiles y fijas del polvo, el sol y la lluvia cuando no operan. El término abarca swamp coolers residenciales, enfriadores comerciales y gabinetes OEM — el tamaño siempre sigue ancho, fondo y alto exteriores.",
      highlights: ["Opciones ligeras 300D–600D para colocar y quitar con facilidad", "Patrones universales y a medida para gabinetes no estándar", "Mejoras UV e impermeables para almacenamiento exterior", "Precios al mayoreo para administradores con varias unidades"],
      faqs: [
        { q: "¿En qué tallas vienen las fundas para enfriadores de aire?", a: "Las tablas estándar cubren muchas medidas residenciales; el tamaño a medida atiende cualquier gabinete. Mide la caja exterior, no la abertura del pad." },
        { q: "¿Las fundas de enfriador de aire y evaporativo son intercambiables?", a: "Sí. Usa el mismo método de medición y elección de material. Consulta nuestra categoría de fundas para enfriadores evaporativos para el rango completo." },
        { q: "¿Cómo aseguro la funda con viento?", a: "Usa el cordón o las correas en todos los puntos de anclaje. Instalaciones en azotea deben usar amarre en cuatro esquinas con tela 600D o más pesada." },
        { q: "¿Envían internacionalmente?", a: "Sí. Fabricamos bajo pedido y enviamos a todo el mundo. Solicita cotización con tus medidas y destino para opciones de flete." },
      ],
      body: "Las fundas para enfriadores de aire protegen unidades evaporativas portátiles y fijas del polvo, el sol y la lluvia cuando no operan. El término abarca swamp coolers residenciales, enfriadores comerciales y gabinetes OEM — el tamaño siempre sigue ancho, fondo y alto exteriores.",
    },
    ar: {
      title: "أغطية مبرّدات الهواء",
      features: ["خيارات ملاءمة شاملة", "خفيفة ومتينة", "مقاومة للطقس", "سهلة التركيب والإزالة"],
      links: ["أغطية مكيف صحراوي", "مقارنة خامات الأغطية"],
      description: "أغطية واقية لمبرّدات الهواء بجميع الأنواع والمقاسات. تحمي وحدتك من الغبار والمطر والشمس والرياح خارج التشغيل.",
      seoIntro: "أغطية مبرّدات الهواء تحمي وحدات التبخير المحمولة والثابتة من الغبار والشمس والمطر عند التوقف. المصطلح يشمل المكيفات الصحراوية السكنية والتجارية وهياكل OEM — القياس دائماً حسب العرض والعمق والارتفاع الخارجي.",
      highlights: ["خيارات 300D–600D خفيفة للتركيب السريع", "أنماط شاملة ومخصّصة للهياكل غير القياسية", "ترقيات UV ومقاومة للماء للتخزين الخارجي", "أسعار الجملة لمديري العقارات بعدة وحدات"],
      faqs: [
        { q: "ما مقاسات أغطية مبرّد الهواء المتاحة؟", a: "الجداول القياسية تغطي many المقاسات السكنية؛ القياس المخصّص يلائم أي هيكل. قِس الصندوق الخارجي لا فتحة الوسادة." },
        { q: "هل أغطية مبرّد الهواء والمكيف الصحراوي متبادلة؟", a: "نعم. استخدم نفس طريقة القياس واختيار الخامة. راجع فئة أغطية المكيف الصحراوي للنطاق الكامل." },
        { q: "كيف أثبّت الغطاء في الرياح؟", a: "استخدم الحبل أو الأربطة عند كل نقطة تثبيت. تركيبات السطح تحتاج ربطاً بأربع زواia بقماش 600D أو أثقل." },
        { q: "هل تشحنون دولياً؟", a: "نعم. نصنع حسب الطلب ونشحن عالمياً. اطلب عرض سعر بمقاساتك والوجهة لخيارات الشحن." },
      ],
      body: "أغطية مبرّدات الهواء تحمي وحدات التبخير المحمولة والثابتة من الغبار والشمس والمطر عند التوقف. المصطلح يشمل المكيفات الصحراوية السكنية والتجارية وهياكل OEM — القياس دائماً حسب العرض والعمق والارتفاع الخارجي.",
    },
  },
  "winter-cooler-covers.mdx": {
    es: {
      title: "Fundas de invierno para enfriadores evaporativos",
      features: ["Forro aislante", "Protección contra heladas", "Diseño que repelle nieve", "Cierres herméticos"],
      links: ["Preparación invernal del enfriador", "Característica de funda invernal"],
      description: "Fundas aislantes de invierno para proteger tu enfriador evaporativo en meses fríos. Previenen congelamiento, daño por hielo y acumulación de escombros durante todo el invierno.",
      seoIntro: "Las fundas de invierno añaden aislamiento y un sellado perimetral ajustado para proteger enfriadores evaporativos de daños por heladas, acumulación de hielo y nieve arrastrada por el viento cuando la unidad está fuera de servicio.",
      highlights: ["Opciones de forro de espuma o acolchado como barrera térmica", "Forma superior que repelle nieve para reducir carga de acumulación", "Cierre ajustado con cordón o cremallera en el dobladillo", "Combínalas con vaciado completo antes de instalar"],
      faqs: [
        { q: "¿Una funda aislante evitará que se congelen las tuberías?", a: "Reduce la pérdida de calor y bloquea el viento frío sobre el gabinete. Siempre vacía las líneas de agua según tu lista de preparación invernal — la funda es una capa de protección." },
        { q: "¿Puedo usar una funda de invierno en verano?", a: "Las fundas aislantes sólidas son para fuera de temporada. Para protección contra polvo en verano, usa fundas de malla o ventiladas." },
        { q: "¿Qué tan grueso es el aislamiento?", a: "Los núcleos de espuma típicos van de 3 a 5 mm según el paquete de tela. Indica tu zona climática para recomendación de material." },
        { q: "¿Cuándo debo quitar la funda de invierno?", a: "Quítala antes del arranque en primavera, revisa pads y bandeja, y opera la unidad antes del pico de la temporada de enfriamiento." },
      ],
      body: "Las fundas de invierno añaden aislamiento y un sellado perimetral ajustado para proteger enfriadores evaporativos de daños por heladas, acumulación de hielo y nieve arrastrada por el viento cuando la unidad está fuera de servicio.",
    },
    ar: {
      title: "أغطية شتوية للمكيف الصحراوي",
      features: ["بطانة عازلة", "حماية من الصقيع", "تصميم يتخلص من الثلج", "إغلاق محكم"],
      links: ["تجهيز المكيف للشتاء", "ميزة الغطاء الشتوي"],
      description: "أغطية شتوية معزولة لحماية مكيفك الصحراوي في الأشهر الباردة. تمنع التجمّد وتلف الجليد وتراكم الأوساخ طوال الشتاء.",
      seoIntro: "الأغطية الشتوية تضيف عزلاً وإغلاقاً محكماً حول المحيط لحماية مبرّدات التبخير من صقيع الجليد والثلج المنفاخ بالرياح عندما تكون الوحدة خارج الخدمة.",
      highlights: ["خيارات بطانة foam أو مبطّنة كحاجز حراري", "شكل علوي يتخلص من الثلج لتقليل الحمل", "إغلاق محكم بحبل أو سحّاب عند الحاشية", "مع تفريغ كامل قبل التركيب"],
      faqs: [
        { q: "هل الغطاء المعزول يمنع تجمّد الأنابيب؟", a: "يقلل فقدان الحرارة ويحجب رياح الصقيع عن الهيكل. دائماً أفرغ خطوط المياه حسب قائمة تجهيز الشتاء — الغطاء طبقة حماية واحدة." },
        { q: "هل أستخدم غطاء شتوي في الصيف؟", a: "الأغطية المعزولة الصلبة للموسم غير النشط. للحماية من الغبار صيفاً، استخدم mesh أو أغطية بفتحات تهوية." },
        { q: "ما سماكة العزل؟", a: "نواة foam عادة 3–5 مم حسب حزمة القماش. حدّد منطقتك المناخية لتوصية الخامة." },
        { q: "متى أزيل الغطاء الشتوي؟", a: "أزله قبل التشغيل في الربيع، افحص الوسادات والحوض، ثم شغّل الوحدة قبل ذروة موسم التبريد." },
      ],
      body: "الأغطية الشتوية تضيف عزلاً وإغلاقاً محكماً حول المحيط لحماية مبرّدات التبخير من صقيع الجليد والثلج المنفاخ بالرياح عندما تكون الوحدة خارج الخدمة.",
    },
  },
};

function buildCategory(slug, enEntry, tr) {
  const d = clone(enEntry.data);
  const t = tr;
  if (t.title) d.title = t.title;
  if (t.features) d.features = t.features;
  if (t.description) d.description = t.description;
  if (t.seoIntro) d.seoIntro = t.seoIntro;
  if (t.highlights) d.seoHighlights = t.highlights;
  if (t.faqs) d.seoFaqs = translateFaqs(d.seoFaqs, t.faqs);
  if (t.links) d.internalLinks = translateLinks(d.internalLinks, t.links);
  return { data: d, body: t.body ?? t.seoIntro ?? enEntry.body };
}

function buildProduct(slug, enEntry, tr) {
  const d = clone(enEntry.data);
  if (tr.name) d.name = tr.name;
  if (tr.summary) d.summary = tr.summary;
  if (tr.imageAlt) d.imageAlt = tr.imageAlt;
  if (tr.imageAlts) d.imageAlts = tr.imageAlts;
  if (tr.specs) d.specs = tr.specs;
  if (tr.features) d.features = tr.features;
  return { data: d, body: tr.body ?? enEntry.body };
}

function buildGeneric(enEntry, tr) {
  const d = clone(enEntry.data);
  if (tr.title) d.title = tr.title;
  if (tr.description) d.description = tr.description;
  if (tr.excerpt) d.excerpt = tr.excerpt;
  if (tr.name) d.name = tr.name;
  if (tr.summary) d.summary = tr.summary;
  if (tr.benefits) d.benefits = tr.benefits;
  if (tr.sections) d.sections = tr.sections;
  if (tr.faqs) d.faqs = tr.faqs;
  if (tr.relatedProducts) d.relatedProducts = tr.relatedProducts;
  if (tr.relatedLinks) d.relatedLinks = tr.relatedLinks;
  if (tr.deepDiveLinks) d.deepDiveLinks = tr.deepDiveLinks;
  if (tr.internalLinks) d.internalLinks = tr.internalLinks;
  if (tr.companionResource) d.companionResource = tr.companionResource;
  if (tr.canonicalNote) d.canonicalNote = tr.canonicalNote;
  return { data: d, body: tr.body ?? enEntry.body ?? "" };
}

function applyTranslator(collection, slugKey, enEntry) {
  const tr = T[collection]?.[slugKey];
  if (!tr) return null;
  return {
    es: collection === "categories" ? buildCategory(slugKey, enEntry, tr.es) : collection === "products" ? buildProduct(slugKey, enEntry, tr.es) : buildGeneric(enEntry, tr.es),
    ar: collection === "categories" ? buildCategory(slugKey, enEntry, tr.ar) : collection === "products" ? buildProduct(slugKey, enEntry, tr.ar) : buildGeneric(enEntry, tr.ar),
  };
}

for (const collection of Object.keys(enSource)) {
  const esBundle = {};
  const arBundle = {};
  for (const [slugKey, enEntry] of Object.entries(enSource[collection])) {
    const slug = slugKey.replace(/\.mdx$/, "");
    const out = applyTranslator(collection, slugKey, enEntry);
    if (out) {
      esBundle[slug] = out.es;
      arBundle[slug] = out.ar;
    }
  }
  fs.writeFileSync(path.join(outDir, `es-${collection}.json`), JSON.stringify(esBundle, null, 2));
  fs.writeFileSync(path.join(outDir, `ar-${collection}.json`), JSON.stringify(arBundle, null, 2));
  console.log(collection, Object.keys(esBundle).length, "entries");
}
