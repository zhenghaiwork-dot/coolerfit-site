# CoolerFit 站点构建规格（v2 · 结构与询盘转化导向）

> 本文档目标：让 Claude Code / Codex 等工具能够**从零生成一个纯静态 HTML/CSS/JS 站点**，部署到 Hostinger 的 `public_html/`。
> **设计风格（颜色、字体、组件样式、动效）由实现方自由发挥**，本文档**不规定视觉**。
> 必须严格遵循的是：**信息架构、页面关系、内部链接、SEO 结构、询盘表单系统、构建逻辑**。

---

## 1. 项目概述

- **品牌**：CoolerFit
- **域名**：https://aircoolercover.com/
- **业务**：定制蒸发式/沼泽式空调罩制造商（B2B）
- **核心转化目标**：**用户提交询盘表单**（不做在线交易，无购物车，无支付）
- **目标用户**：经销商、批发商、HVAC 安装商、酒店/工厂采购、终端 DIY 用户
- **语言**：英文（en-US）
- **联系邮箱**：custom@aircoolercover.com

**关键判断**：整站是一个**询盘漏斗**。每个页面都必须把用户引向「提交询盘」这一个动作。

---

## 2. 信息架构总览

```text
/                                  首页（含简版询盘表单）
├── /about                         关于工厂
├── /contact                       完整询盘表单（兜底入口）
├── /products                      产品总览（20 个分类入口）
│   └── /products/{slug}           分类页 × 20（含简版询盘表单）
├── /product                       产品列表
│   └── /product/{slug}            产品详情 × 12（含定制询盘表单 ProductCustomizer）
├── /features                      功能/卖点入口
│   └── /features/{slug}           功能页 × 4
├── /resources                     资源中心
│   └── /resources/{slug}          资源页 × 10（尺寸指南、安装、保养等）
├── /blog                          博客列表
│   └── /blog/{slug}               博客详情 × N（pillar + cluster）
├── /materials                     材质总览
├── /sizes                         尺寸总览
├── /custom                        定制服务说明（强 CTA 跳询盘表单）
└── /404
```

### 5 种页面类型

| 类型 | 角色 | 是否嵌入询盘表单 |
|---|---|---|
| **转化页** | /contact, /custom | ✅ 完整定制表单 |
| **产品页** | /products, /products/{slug}, /product, /product/{slug} | ✅（分类=简版；详情=定制版） |
| **内容页** | /blog, /blog/{slug}, /resources, /resources/{slug} | 文末 CTA → /contact |
| **功能/资源页** | /features/{slug}, /materials, /sizes | 文末 CTA + 简版表单 |
| **品牌页** | /, /about | 首页含简版；about 文末 CTA |

---

## 3. SEO 内容模型（Topical Authority）

### 内容漏斗

```text
TOFU (Pillar 博客)  →  MOFU (Cluster 博客 / Feature / Resource)  →  BOFU (产品分类页 / 产品详情页)  →  CONVERSION (询盘表单)
```

### 5 大内容支柱（Pillar）

1. **Evaporative Cooler Covers**（核心产品词）
2. **Custom Cover Manufacturing**（定制能力）
3. **Material & Durability Guide**（材质权威）
4. **Sizing & Installation**（尺寸与安装）
5. **Maintenance & Seasonal Care**（保养）

每个 pillar 配 3–8 篇 cluster 博客，cluster 博客必须反向链接到 pillar 和至少 1 个产品分类页。

### URL / Slug 规则

- 小写、连字符、不含停用词冗余
- 产品分类：`/products/{kebab-slug}`
- 产品详情：`/product/{kebab-slug}`
- 博客：`/blog/{kebab-slug}`
- canonical = 绝对 URL，自指

---

## 4. 页面关系与互链规则

### 4.1 强制互链矩阵

| 起点页 | 必须出链到 | 数量下限 |
|---|---|---|
| 首页 | 4 个 feature、6 个热门分类、4 篇博客、/about、/contact | 见列 |
| 产品分类页 `/products/{slug}` | 该分类下所有产品详情、3 个相关分类、2 篇相关博客、/contact | 全部产品 + 3 + 2 |
| 产品详情页 `/product/{slug}` | 所属分类页（面包屑）、3 个相关产品、1 篇相关博客、/custom、/contact | 1+3+1+2 |
| 博客详情 `/blog/{slug}` | 所属 pillar 博客、2 篇同 pillar cluster、1 个相关产品分类、1 个相关产品 | 1+2+1+1 |
| Feature 页 | 2 个相关产品分类、2 篇相关博客、/contact | 2+2+1 |
| Resource 页 | 2 个相关产品分类、1 个相关 feature、/contact | 2+1+1 |
| Footer（全站） | 主分类、主资源、主 feature、/about、/contact、/blog | 固定 |

### 4.2 产品 ↔ 分类（多对多）

一个产品可属于多个分类（用于多落地页 SEO）。数据由 `productItems[].categories` 数组定义。
分类页渲染时：`productItems.filter(p => p.categories.includes(currentCategorySlug))`。

### 4.3 面包屑（所有非首页）

`Home > {Parent} > {Current}`，并输出 BreadcrumbList JSON-LD。

---

## 5. 完整路由表

> 字段说明：**Form** = 该页嵌入哪种询盘表单（none / simple / custom）

| URL | 类型 | 数据源 | 父级 | Form |
|---|---|---|---|---|
| `/` | home | 多源聚合 | — | simple |
| `/about` | brand | 静态 | / | none（文末 CTA） |
| `/contact` | conversion | 静态 | / | custom |
| `/custom` | conversion | 静态 | / | custom |
| `/products` | hub | productCategories | / | none |
| `/products/evaporative-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/custom-evaporative-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/swamp-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/air-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/side-draft-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/down-draft-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/rooftop-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/window-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/winter-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/waterproof-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/insulated-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/mesh-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/uv-resistant-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/round-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/large-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/extra-large-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/commercial-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/industrial-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/bulk-order-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/products/small-batch-cooler-covers` | category | productCategories + productItems | /products | simple |
| `/product` | hub | productItems | / | none |
| `/product/standard-side-draft-cover` | product | productItems | /product | **custom** |
| `/product/standard-down-draft-cover` | product | productItems | /product | **custom** |
| `/product/heavy-duty-industrial-cover` | product | productItems | /product | **custom** |
| `/product/waterproof-premium-cover` | product | productItems | /product | **custom** |
| `/product/uv-shield-cover` | product | productItems | /product | **custom** |
| `/product/winter-insulated-cover` | product | productItems | /product | **custom** |
| `/product/mesh-breathable-cover` | product | productItems | /product | **custom** |
| `/product/window-unit-cover` | product | productItems | /product | **custom** |
| `/product/round-cylinder-cover` | product | productItems | /product | **custom** |
| `/product/xl-commercial-cover` | product | productItems | /product | **custom** |
| `/product/custom-logo-cover` | product | productItems | /product | **custom** |
| `/product/small-batch-prototype-cover` | product | productItems | /product | **custom** |
| `/features` | hub | featurePages | / | none |
| `/features/uv-protection` | feature | featurePages | /features | simple |
| `/features/rain-proof` | feature | featurePages | /features | simple |
| `/features/winter-cover` | feature | featurePages | /features | simple |
| `/features/vented-design` | feature | featurePages | /features | simple |
| `/resources` | hub | resourcePages | / | none |
| `/resources/materials` | resource | resourcePages | /resources | simple |
| `/resources/sizes` | resource | resourcePages | /resources | simple |
| `/resources/sizes/how-to-measure` | resource | resourcePages | /resources | simple |
| `/resources/custom/materials` | resource | resourcePages | /resources | simple |
| `/resources/custom/sizes` | resource | resourcePages | /resources | simple |
| `/resources/custom/opening-design` | resource | resourcePages | /resources | simple |
| `/resources/custom/logo-printing` | resource | resourcePages | /resources | simple |
| `/resources/resources/installation` | resource | resourcePages | /resources | simple |
| `/resources/resources/maintenance` | resource | resourcePages | /resources | simple |
| `/blog` | hub | blogPosts | / | none |
| `/blog/evaporative-cooler-covers-guide` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/what-is-evaporative-cooler-cover` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/benefits-of-cooler-covers` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/how-to-measure-cooler-cover` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/winterizing-evaporative-cooler` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/cover-material-comparison` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/custom-cooler-covers` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/custom-cover-materials` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/custom-cover-sizes` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/custom-opening-designs` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/logo-printing-on-cooler-covers` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/bulk-vs-small-batch-orders` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/swamp-cooler-covers-guide` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/swamp-cooler-cover-sizes` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/swamp-cooler-cover-side-draft` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/swamp-cooler-cover-down-draft` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/insulated-swamp-cooler-covers` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/mesh-swamp-cooler-covers` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/cooler-cover-installation` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/how-to-install-cooler-cover` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/how-to-clean-cooler-covers` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/how-to-store-cooler-cover` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/common-cover-sizing-mistakes` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/cooler-cover-materials-performance` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/waterproof-vs-water-resistant` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/uv-protection-for-cooler-covers` | blog | blogPosts | /blog | none（文末 CTA） |
| `/blog/vented-vs-closed-cover` | blog | blogPosts | /blog | none（文末 CTA） |
| `/materials` | feature | 静态 | / | simple |
| `/sizes` | feature | 静态 | / | simple |
| `/404` | error | 静态 | — | none |

---

## 6. 完整数据（JSON，构建时读取）

### 6.1 productCategories.json
```json
[
  {
    "slug": "evaporative-cooler-covers",
    "title": "Evaporative Cooler Covers",
    "description": "Premium custom-fit covers designed specifically for evaporative coolers. Our covers protect your unit from dust, debris, UV damage, and harsh weather conditions year-round. Available in multiple materials, sizes, and configurations to match any cooler type.",
    "features": [
      "Custom sizing available",
      "Multiple material options",
      "UV-resistant coatings",
      "Reinforced stitching",
      "Easy installation"
    ],
    "internalLinks": [
      {
        "label": "Custom Evaporative Cooler Covers",
        "path": "/products/custom-evaporative-cooler-covers"
      },
      {
        "label": "UV-Resistant Covers",
        "path": "/products/uv-resistant-cooler-covers"
      },
      {
        "label": "What Is an Evaporative Cooler Cover?",
        "path": "/blog/what-is-evaporative-cooler-cover"
      }
    ],
    "relatedBlogSlugs": [
      "evaporative-cooler-covers-guide",
      "what-is-evaporative-cooler-cover",
      "benefits-of-cooler-covers"
    ]
  },
  {
    "slug": "custom-evaporative-cooler-covers",
    "title": "Custom Evaporative Cooler Covers",
    "description": "Fully customized evaporative cooler covers built to your exact specifications. Choose your material, size, opening configuration, color, and add your brand logo. Perfect for non-standard cooler dimensions or specific functional requirements.",
    "features": [
      "Made-to-measure sizing",
      "Choice of 10+ materials",
      "Custom opening designs",
      "Logo printing available",
      "Bulk order discounts"
    ],
    "internalLinks": [
      {
        "label": "Custom Materials Guide",
        "path": "/blog/custom-cover-materials"
      },
      {
        "label": "Custom Sizes Guide",
        "path": "/blog/custom-cover-sizes"
      },
      {
        "label": "Opening Designs",
        "path": "/custom/opening-design"
      }
    ],
    "relatedBlogSlugs": [
      "custom-cooler-covers",
      "custom-cover-materials",
      "custom-cover-sizes"
    ]
  },
  {
    "slug": "swamp-cooler-covers",
    "title": "Swamp Cooler Covers",
    "description": "High-quality covers for swamp coolers (evaporative coolers) in all sizes and configurations. Protect your swamp cooler from off-season damage with our durable, weather-resistant covers.",
    "features": [
      "All-season protection",
      "Water-resistant materials",
      "Secure fastening system",
      "Available for all unit sizes"
    ],
    "internalLinks": [
      {
        "label": "Swamp Cooler Cover Sizes",
        "path": "/blog/swamp-cooler-cover-sizes"
      },
      {
        "label": "Side Draft Covers",
        "path": "/products/side-draft-cooler-covers"
      },
      {
        "label": "Down Draft Covers",
        "path": "/products/down-draft-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "swamp-cooler-covers-guide",
      "swamp-cooler-cover-sizes"
    ],
    "canonicalSlug": "evaporative-cooler-covers"
  },
  {
    "slug": "air-cooler-covers",
    "title": "Air Cooler Covers",
    "description": "Protective covers for air coolers of all types and sizes. Our air cooler covers shield your unit from dust, rain, sun, and wind damage when not in use.",
    "features": [
      "Universal fit options",
      "Lightweight yet durable",
      "Weather-resistant",
      "Easy on/off design"
    ],
    "internalLinks": [
      {
        "label": "Evaporative Cooler Covers",
        "path": "/products/evaporative-cooler-covers"
      },
      {
        "label": "Cover Material Comparison",
        "path": "/blog/cover-material-comparison"
      }
    ],
    "relatedBlogSlugs": [
      "evaporative-cooler-covers-guide",
      "cover-material-comparison"
    ],
    "canonicalSlug": "evaporative-cooler-covers"
  },
  {
    "slug": "side-draft-cooler-covers",
    "title": "Side Draft Cooler Covers",
    "description": "Purpose-built covers for side-draft evaporative coolers. Designed with proper ventilation openings and secure fit for wall-mounted and ground-level side-draft units.",
    "features": [
      "Side ventilation accommodations",
      "Secure wall-mount fit",
      "Weather-sealed edges",
      "Multiple size options"
    ],
    "internalLinks": [
      {
        "label": "Custom Opening Designs",
        "path": "/blog/custom-opening-designs"
      },
      {
        "label": "Side Draft Applications",
        "path": "/blog/swamp-cooler-cover-side-draft"
      }
    ],
    "relatedBlogSlugs": [
      "custom-opening-designs",
      "swamp-cooler-cover-side-draft"
    ]
  },
  {
    "slug": "down-draft-cooler-covers",
    "title": "Down Draft Cooler Covers",
    "description": "Specialized covers for down-draft evaporative coolers. Engineered to protect rooftop and through-the-roof cooler installations from the elements.",
    "features": [
      "Rooftop-ready design",
      "Drainage channels",
      "UV-resistant top panel",
      "Wind-secure strapping"
    ],
    "internalLinks": [
      {
        "label": "Down Draft Guide",
        "path": "/blog/swamp-cooler-cover-down-draft"
      },
      {
        "label": "Rooftop Covers",
        "path": "/products/rooftop-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "custom-opening-designs",
      "swamp-cooler-cover-down-draft"
    ]
  },
  {
    "slug": "rooftop-cooler-covers",
    "title": "Rooftop Cooler Covers",
    "description": "Heavy-duty covers designed for rooftop-mounted evaporative coolers. Built to withstand direct sun exposure, high winds, and precipitation at elevated installations.",
    "features": [
      "Extra UV protection",
      "Wind-rated fastening",
      "Reinforced seams",
      "Heat-reflective coating"
    ],
    "internalLinks": [
      {
        "label": "Down Draft Covers",
        "path": "/products/down-draft-cooler-covers"
      },
      {
        "label": "UV Protection Feature",
        "path": "/features/uv-protection"
      }
    ],
    "relatedBlogSlugs": [
      "uv-protection-for-cooler-covers",
      "how-to-install-cooler-cover"
    ]
  },
  {
    "slug": "window-cooler-covers",
    "title": "Window Cooler Covers",
    "description": "Custom-fit covers for window-mounted evaporative coolers. Protect your window unit from dust and weather damage during the off-season without removing it.",
    "features": [
      "Window-frame compatible",
      "Insulating properties",
      "Easy seasonal install",
      "Compact storage"
    ],
    "internalLinks": [
      {
        "label": "Custom Opening Designs",
        "path": "/blog/custom-opening-designs"
      },
      {
        "label": "How to Measure",
        "path": "/blog/how-to-measure-cooler-cover"
      }
    ],
    "relatedBlogSlugs": [
      "custom-opening-designs",
      "how-to-measure-cooler-cover"
    ]
  },
  {
    "slug": "winter-cooler-covers",
    "title": "Winter Cooler Covers",
    "description": "Insulated winter covers to protect your evaporative cooler during cold months. Prevent freezing, ice damage, and debris accumulation throughout winter.",
    "features": [
      "Insulated lining",
      "Freeze protection",
      "Snow-shedding design",
      "Tight-seal closures"
    ],
    "internalLinks": [
      {
        "label": "Winterizing Your Cooler",
        "path": "/blog/winterizing-evaporative-cooler"
      },
      {
        "label": "Winter Cover Feature",
        "path": "/features/winter-cover"
      }
    ],
    "relatedBlogSlugs": [
      "winterizing-evaporative-cooler"
    ]
  },
  {
    "slug": "waterproof-cooler-covers",
    "title": "Waterproof Cooler Covers",
    "description": "Fully waterproof cooler covers with sealed seams and water-repellent coatings. Ideal for regions with heavy rainfall or humid climates.",
    "features": [
      "100% waterproof fabric",
      "Sealed seams",
      "Anti-mildew treatment",
      "Drainage grommets"
    ],
    "internalLinks": [
      {
        "label": "Waterproof vs Water-Resistant",
        "path": "/blog/waterproof-vs-water-resistant"
      },
      {
        "label": "Rain-Proof Feature",
        "path": "/features/rain-proof"
      }
    ],
    "relatedBlogSlugs": [
      "waterproof-vs-water-resistant",
      "benefits-of-cooler-covers"
    ]
  },
  {
    "slug": "insulated-cooler-covers",
    "title": "Insulated Cooler Covers",
    "description": "Thermally insulated covers that provide an extra layer of temperature protection. Ideal for extreme climates where heat retention or cold protection is needed.",
    "features": [
      "Thermal insulation layer",
      "Energy efficiency boost",
      "Multi-season use",
      "Condensation prevention"
    ],
    "internalLinks": [
      {
        "label": "Material Comparison",
        "path": "/blog/cover-material-comparison"
      },
      {
        "label": "Insulated Swamp Cooler Covers",
        "path": "/blog/insulated-swamp-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "cover-material-comparison",
      "insulated-swamp-cooler-covers",
      "custom-cover-materials"
    ]
  },
  {
    "slug": "mesh-cooler-covers",
    "title": "Mesh Cooler Covers",
    "description": "Breathable mesh covers that protect against debris and pests while allowing airflow. Perfect for in-season use or mild climates.",
    "features": [
      "Breathable mesh fabric",
      "Pest prevention",
      "Debris filtration",
      "Lightweight design"
    ],
    "internalLinks": [
      {
        "label": "Mesh Swamp Cooler Covers",
        "path": "/blog/mesh-swamp-cooler-covers"
      },
      {
        "label": "Vented Design Feature",
        "path": "/features/vented-design"
      }
    ],
    "relatedBlogSlugs": [
      "mesh-swamp-cooler-covers",
      "vented-vs-closed-cover",
      "cover-material-comparison"
    ]
  },
  {
    "slug": "uv-resistant-cooler-covers",
    "title": "UV-Resistant Cooler Covers",
    "description": "Covers with advanced UV-blocking technology to prevent sun damage, fading, and material degradation. Essential for coolers in direct sunlight.",
    "features": [
      "UV-blocking coating",
      "Fade-resistant colors",
      "Extended lifespan",
      "Heat reflection"
    ],
    "internalLinks": [
      {
        "label": "UV Protection Guide",
        "path": "/blog/uv-protection-for-cooler-covers"
      },
      {
        "label": "UV Protection Feature",
        "path": "/features/uv-protection"
      }
    ],
    "relatedBlogSlugs": [
      "uv-protection-for-cooler-covers",
      "benefits-of-cooler-covers"
    ]
  },
  {
    "slug": "round-cooler-covers",
    "title": "Round Cooler Covers",
    "description": "Custom-shaped covers for round and cylindrical evaporative coolers. Precision-cut for a snug fit around circular cooler units.",
    "features": [
      "Circular pattern cutting",
      "Elastic hem for snug fit",
      "Multiple diameter options",
      "Custom sizing available"
    ],
    "internalLinks": [
      {
        "label": "How to Measure",
        "path": "/blog/how-to-measure-cooler-cover"
      },
      {
        "label": "Custom Sizes",
        "path": "/blog/custom-cover-sizes"
      }
    ],
    "relatedBlogSlugs": [
      "how-to-measure-cooler-cover",
      "custom-cover-sizes",
      "swamp-cooler-cover-sizes"
    ]
  },
  {
    "slug": "large-cooler-covers",
    "title": "Large Cooler Covers",
    "description": "Oversized covers for large residential and light commercial evaporative coolers. Reinforced construction to handle the extra material span.",
    "features": [
      "Reinforced stress points",
      "Extra-wide coverage",
      "Heavy-duty fasteners",
      "Wind-resistant design"
    ],
    "internalLinks": [
      {
        "label": "Extra Large Covers",
        "path": "/products/extra-large-cooler-covers"
      },
      {
        "label": "How to Measure",
        "path": "/blog/how-to-measure-cooler-cover"
      }
    ],
    "relatedBlogSlugs": [
      "how-to-measure-cooler-cover",
      "swamp-cooler-cover-sizes"
    ]
  },
  {
    "slug": "extra-large-cooler-covers",
    "title": "Extra Large Cooler Covers",
    "description": "Industrial-grade covers for extra-large evaporative coolers used in commercial and industrial settings. Built with the strongest materials for maximum durability.",
    "features": [
      "Industrial-grade materials",
      "Maximum coverage area",
      "Commercial-spec fastening",
      "Weather-sealed construction"
    ],
    "internalLinks": [
      {
        "label": "Commercial Covers",
        "path": "/products/commercial-cooler-covers"
      },
      {
        "label": "Industrial Covers",
        "path": "/products/industrial-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "how-to-measure-cooler-cover",
      "bulk-vs-small-batch-orders"
    ]
  },
  {
    "slug": "commercial-cooler-covers",
    "title": "Commercial Cooler Covers",
    "description": "Professional-grade covers designed for commercial evaporative cooling systems. Suitable for hotels, restaurants, warehouses, and office buildings.",
    "features": [
      "Commercial-grade durability",
      "Bulk pricing available",
      "Custom branding options",
      "Professional installation support"
    ],
    "internalLinks": [
      {
        "label": "Bulk Orders",
        "path": "/products/bulk-order-cooler-covers"
      },
      {
        "label": "Industrial Covers",
        "path": "/products/industrial-cooler-covers"
      },
      {
        "label": "Bulk vs Small Batch",
        "path": "/blog/bulk-vs-small-batch-orders"
      }
    ],
    "relatedBlogSlugs": [
      "bulk-vs-small-batch-orders"
    ]
  },
  {
    "slug": "industrial-cooler-covers",
    "title": "Industrial Cooler Covers",
    "description": "Heavy-duty covers engineered for industrial evaporative cooling units. Maximum protection for large-scale installations in factories, plants, and industrial facilities.",
    "features": [
      "Heavy-duty construction",
      "Chemical-resistant options",
      "Fire-retardant materials available",
      "Custom engineering support"
    ],
    "internalLinks": [
      {
        "label": "Commercial Covers",
        "path": "/products/commercial-cooler-covers"
      },
      {
        "label": "Bulk Orders",
        "path": "/products/bulk-order-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "bulk-vs-small-batch-orders"
    ]
  },
  {
    "slug": "bulk-order-cooler-covers",
    "title": "Bulk Order Cooler Covers",
    "description": "Volume pricing for large orders of evaporative cooler covers. Ideal for property management companies, HVAC contractors, and distributors. Significant discounts on orders of 50+ units.",
    "features": [
      "Volume discounts",
      "Consistent quality across batches",
      "Custom specs per batch",
      "Dedicated account support"
    ],
    "internalLinks": [
      {
        "label": "Small Batch Orders",
        "path": "/products/small-batch-cooler-covers"
      },
      {
        "label": "Bulk vs Small Batch Guide",
        "path": "/blog/bulk-vs-small-batch-orders"
      }
    ],
    "relatedBlogSlugs": [
      "bulk-vs-small-batch-orders"
    ]
  },
  {
    "slug": "small-batch-cooler-covers",
    "title": "Small Batch Cooler Covers",
    "description": "Flexible small-batch production for unique or specialty cooler cover orders. No minimum order requirements — get as few as one custom cover made to your specifications.",
    "features": [
      "No minimum order",
      "Full customization",
      "Quick turnaround",
      "Prototype available"
    ],
    "internalLinks": [
      {
        "label": "Bulk Orders",
        "path": "/products/bulk-order-cooler-covers"
      },
      {
        "label": "Custom Covers",
        "path": "/products/custom-evaporative-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "bulk-vs-small-batch-orders",
      "custom-cooler-covers"
    ]
  }
]
```

### 6.2 productItems.json
```json
[
  {
    "slug": "standard-side-draft-cover",
    "name": "Standard Side Draft Cover",
    "summary": "Reliable protection for wall-mounted side-draft coolers.",
    "description": "Our standard side-draft cover is designed for residential wall-mounted evaporative coolers. Made from durable 600D polyester with PU coating, it provides year-round protection from dust, rain, and UV damage. Features ventilation openings to prevent condensation buildup.",
    "image": "🏠",
    "categorySlugs": [
      "evaporative-cooler-covers",
      "side-draft-cooler-covers",
      "swamp-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "600D Oxford Polyester"
      },
      {
        "label": "Coating",
        "value": "PU Water-Resistant"
      },
      {
        "label": "Sizes",
        "value": "S / M / L / Custom"
      },
      {
        "label": "Colors",
        "value": "Gray, Beige, Navy"
      },
      {
        "label": "Weight",
        "value": "0.8–1.2 kg"
      }
    ],
    "features": [
      "Dustproof sealed seams",
      "Elastic bottom hem",
      "Air vents",
      "Wall-mount compatible",
      "Custom sizing available"
    ],
    "popular": true
  },
  {
    "slug": "standard-down-draft-cover",
    "name": "Standard Down Draft Cover",
    "summary": "Rooftop-ready cover for down-draft evaporative coolers.",
    "description": "Purpose-built for rooftop down-draft coolers, this cover features reinforced top panels, drainage channels, and UV-resistant coating. Designed to handle direct sun, wind, and rain exposure at elevated installations.",
    "image": "🏗️",
    "categorySlugs": [
      "evaporative-cooler-covers",
      "down-draft-cooler-covers",
      "rooftop-cooler-covers",
      "swamp-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "600D Oxford Polyester"
      },
      {
        "label": "Coating",
        "value": "PU + UV Stabilizer"
      },
      {
        "label": "Sizes",
        "value": "M / L / XL / Custom"
      },
      {
        "label": "Colors",
        "value": "Gray, Charcoal"
      },
      {
        "label": "Weight",
        "value": "1.0–1.5 kg"
      }
    ],
    "features": [
      "Drainage channels",
      "UV-resistant top panel",
      "Wind-secure straps",
      "Rooftop-optimized design",
      "Custom cutouts available"
    ],
    "popular": true
  },
  {
    "slug": "heavy-duty-industrial-cover",
    "name": "Heavy-Duty Industrial Cover",
    "summary": "Maximum durability for commercial & industrial coolers.",
    "description": "Engineered with 900D industrial canvas and TPU lamination, this cover is built for large commercial and industrial evaporative coolers. Double-stitched seams and heavy-duty buckle straps ensure long-lasting performance in the harshest environments.",
    "image": "🏭",
    "categorySlugs": [
      "commercial-cooler-covers",
      "industrial-cooler-covers",
      "extra-large-cooler-covers",
      "bulk-order-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "900D Industrial Canvas"
      },
      {
        "label": "Coating",
        "value": "TPU Laminated"
      },
      {
        "label": "Sizes",
        "value": "L / XL / XXL / Custom"
      },
      {
        "label": "Colors",
        "value": "Black, Gray"
      },
      {
        "label": "Weight",
        "value": "1.5–3.0 kg"
      }
    ],
    "features": [
      "Double-stitched seams",
      "Heavy-duty buckle straps",
      "UV-resistant coating",
      "Custom cutouts for piping",
      "Bulk pricing available"
    ],
    "popular": true
  },
  {
    "slug": "waterproof-premium-cover",
    "name": "Waterproof Premium Cover",
    "summary": "100% waterproof with sealed seams for heavy rain regions.",
    "description": "Our premium waterproof cover uses fully sealed seams and a multi-layer water-repellent coating to provide complete rain protection. Anti-mildew treatment and drainage grommets ensure your cooler stays dry and clean year-round.",
    "image": "💧",
    "categorySlugs": [
      "waterproof-cooler-covers",
      "evaporative-cooler-covers",
      "swamp-cooler-covers",
      "side-draft-cooler-covers",
      "down-draft-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "300D Polyester + PVC Backing"
      },
      {
        "label": "Waterproof Rating",
        "value": "5000mm H₂O"
      },
      {
        "label": "Sizes",
        "value": "S / M / L / XL / Custom"
      },
      {
        "label": "Colors",
        "value": "Black, Dark Gray, Navy"
      },
      {
        "label": "Weight",
        "value": "1.0–1.8 kg"
      }
    ],
    "features": [
      "100% waterproof fabric",
      "Sealed seam technology",
      "Anti-mildew treatment",
      "Drainage grommets",
      "Elastic drawstring hem"
    ]
  },
  {
    "slug": "uv-shield-cover",
    "name": "UV Shield Cover",
    "summary": "Advanced UV-blocking technology for sun-exposed coolers.",
    "description": "Featuring our proprietary UV-blocking coating, this cover prevents sun damage, color fading, and material degradation. Ideal for coolers exposed to direct sunlight year-round. Heat-reflective outer layer keeps your cooler significantly cooler.",
    "image": "☀️",
    "categorySlugs": [
      "uv-resistant-cooler-covers",
      "evaporative-cooler-covers",
      "rooftop-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "600D Polyester + UV Coating"
      },
      {
        "label": "UV Protection",
        "value": "UPF 50+"
      },
      {
        "label": "Sizes",
        "value": "S / M / L / XL / Custom"
      },
      {
        "label": "Colors",
        "value": "Silver, White, Light Gray"
      },
      {
        "label": "Weight",
        "value": "0.9–1.4 kg"
      }
    ],
    "features": [
      "UPF 50+ UV blocking",
      "Fade-resistant colors",
      "Heat-reflective surface",
      "Extended lifespan",
      "All-season protection"
    ]
  },
  {
    "slug": "winter-insulated-cover",
    "name": "Winter Insulated Cover",
    "summary": "Thermally insulated for freeze protection in cold climates.",
    "description": "Multi-layer insulated cover with thermal lining designed to protect evaporative coolers during harsh winters. Prevents freezing, ice damage, and debris accumulation. Snow-shedding exterior and tight-seal closures keep moisture out.",
    "image": "❄️",
    "categorySlugs": [
      "winter-cooler-covers",
      "insulated-cooler-covers",
      "evaporative-cooler-covers",
      "swamp-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "600D Polyester + Thermal Lining"
      },
      {
        "label": "Insulation",
        "value": "5mm Foam Core"
      },
      {
        "label": "Sizes",
        "value": "S / M / L / XL / Custom"
      },
      {
        "label": "Colors",
        "value": "Gray, Black"
      },
      {
        "label": "Weight",
        "value": "1.2–2.0 kg"
      }
    ],
    "features": [
      "Thermal insulation layer",
      "Freeze protection",
      "Snow-shedding design",
      "Tight-seal closures",
      "Condensation prevention"
    ]
  },
  {
    "slug": "mesh-breathable-cover",
    "name": "Mesh Breathable Cover",
    "summary": "Breathable mesh for debris & pest protection with airflow.",
    "description": "Lightweight mesh cover that filters out debris, leaves, and pests while maintaining full airflow. Perfect for in-season use in mild climates, or as a secondary protective layer during operational periods.",
    "image": "🌬️",
    "categorySlugs": [
      "mesh-cooler-covers",
      "evaporative-cooler-covers",
      "air-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "High-Density Polyester Mesh"
      },
      {
        "label": "Mesh Aperture",
        "value": "1mm"
      },
      {
        "label": "Sizes",
        "value": "S / M / L / XL / Custom"
      },
      {
        "label": "Colors",
        "value": "Black, Gray"
      },
      {
        "label": "Weight",
        "value": "0.3–0.6 kg"
      }
    ],
    "features": [
      "Breathable mesh fabric",
      "Pest prevention",
      "Debris filtration",
      "Ultra-lightweight",
      "Easy install/remove"
    ]
  },
  {
    "slug": "window-unit-cover",
    "name": "Window Unit Cover",
    "summary": "Custom-fit for window-mounted coolers without removal.",
    "description": "Designed specifically for window-mounted evaporative coolers. Install the cover without removing your unit. Insulating properties help reduce drafts during the off-season. Compact design folds for easy storage.",
    "image": "🪟",
    "categorySlugs": [
      "window-cooler-covers",
      "evaporative-cooler-covers",
      "air-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "420D Polyester"
      },
      {
        "label": "Coating",
        "value": "PU Water-Resistant"
      },
      {
        "label": "Sizes",
        "value": "Standard Window / Custom"
      },
      {
        "label": "Colors",
        "value": "Beige, Gray, White"
      },
      {
        "label": "Weight",
        "value": "0.4–0.7 kg"
      }
    ],
    "features": [
      "Window-frame compatible",
      "Insulating properties",
      "No-removal install",
      "Compact storage",
      "Adjustable straps"
    ]
  },
  {
    "slug": "round-cylinder-cover",
    "name": "Round Cylinder Cover",
    "summary": "Precision-cut for round & cylindrical cooler units.",
    "description": "Custom-shaped cover for round and cylindrical evaporative coolers. Precision-cut circular pattern with elastic hem ensures a snug fit. Available in multiple standard diameters or fully custom dimensions.",
    "image": "⭕",
    "categorySlugs": [
      "round-cooler-covers",
      "evaporative-cooler-covers",
      "custom-evaporative-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "600D Oxford Polyester"
      },
      {
        "label": "Shape",
        "value": "Circular / Cylindrical"
      },
      {
        "label": "Diameters",
        "value": "60 / 80 / 100cm / Custom"
      },
      {
        "label": "Colors",
        "value": "Gray, Beige, Custom"
      },
      {
        "label": "Weight",
        "value": "0.6–1.0 kg"
      }
    ],
    "features": [
      "Circular pattern cutting",
      "Elastic hem for snug fit",
      "Multiple diameter options",
      "Custom sizing",
      "Top drainage design"
    ]
  },
  {
    "slug": "xl-commercial-cover",
    "name": "XL Commercial Cover",
    "summary": "Oversized cover for large commercial cooling systems.",
    "description": "Extra-large cover designed for commercial evaporative cooling systems used in hotels, restaurants, warehouses, and office buildings. Reinforced stress points and heavy-duty fasteners handle the extra material span.",
    "image": "🏢",
    "categorySlugs": [
      "large-cooler-covers",
      "extra-large-cooler-covers",
      "commercial-cooler-covers",
      "bulk-order-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "900D Polyester Canvas"
      },
      {
        "label": "Coating",
        "value": "PU + UV Stabilizer"
      },
      {
        "label": "Sizes",
        "value": "XL / XXL / XXXL / Custom"
      },
      {
        "label": "Colors",
        "value": "Gray, Black, Custom"
      },
      {
        "label": "Weight",
        "value": "2.0–4.0 kg"
      }
    ],
    "features": [
      "Reinforced stress points",
      "Extra-wide coverage",
      "Heavy-duty fasteners",
      "Wind-resistant design",
      "Custom branding options"
    ]
  },
  {
    "slug": "custom-logo-cover",
    "name": "Custom Logo & Branding Cover",
    "summary": "Add your brand logo, colors, and custom design.",
    "description": "Fully branded cooler covers with your company logo, custom colors, and design elements. Perfect for HVAC contractors, property managers, and businesses wanting professional branded equipment protection. Available on any cover type.",
    "image": "🎨",
    "categorySlugs": [
      "custom-evaporative-cooler-covers",
      "commercial-cooler-covers",
      "bulk-order-cooler-covers",
      "small-batch-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "Any (Your Choice)"
      },
      {
        "label": "Printing",
        "value": "Screen / Heat Transfer / Embroidery"
      },
      {
        "label": "Logo Area",
        "value": "Up to Full Cover"
      },
      {
        "label": "Min. Order",
        "value": "1 Unit"
      },
      {
        "label": "Lead Time",
        "value": "7–14 Days"
      }
    ],
    "features": [
      "Full-color logo printing",
      "Custom color matching",
      "Multiple print methods",
      "Available on all cover types",
      "Design assistance included"
    ]
  },
  {
    "slug": "small-batch-prototype-cover",
    "name": "Small Batch & Prototype Cover",
    "summary": "Low MOQ orders and prototyping for unique requirements.",
    "description": "Flexible small-batch production with no minimum order requirements. Get prototypes before committing to large orders. Ideal for testing new designs, one-off custom projects, or specialty applications.",
    "image": "📐",
    "categorySlugs": [
      "small-batch-cooler-covers",
      "custom-evaporative-cooler-covers"
    ],
    "specs": [
      {
        "label": "Material",
        "value": "Any (Your Choice)"
      },
      {
        "label": "MOQ",
        "value": "1 Unit"
      },
      {
        "label": "Prototype",
        "value": "Available"
      },
      {
        "label": "Lead Time",
        "value": "5–10 Days"
      },
      {
        "label": "Customization",
        "value": "Full"
      }
    ],
    "features": [
      "No minimum order",
      "Full customization",
      "Quick turnaround",
      "Prototype samples",
      "Design consultation"
    ]
  }
]
```

### 6.3 featurePages.json
```json
[
  {
    "slug": "uv-protection",
    "title": "UV Protection for Cooler Covers",
    "description": "Our UV-protection technology blocks harmful ultraviolet rays that cause material degradation, color fading, and structural weakening. Covers with UV protection last 2-3x longer than untreated alternatives, making them essential for any cooler exposed to direct sunlight.",
    "benefits": [
      "Blocks 99% of harmful UV rays",
      "Prevents color fading and material breakdown",
      "Extends cover lifespan by 2-3x",
      "Keeps covered equipment cooler",
      "Available on all cover materials"
    ],
    "relatedProducts": [
      {
        "label": "UV-Resistant Cooler Covers",
        "path": "/products/uv-resistant-cooler-covers"
      },
      {
        "label": "Rooftop Cooler Covers",
        "path": "/products/rooftop-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "uv-protection-for-cooler-covers",
      "benefits-of-cooler-covers"
    ]
  },
  {
    "slug": "rain-proof",
    "title": "Rain-Proof Cooler Covers",
    "description": "Our rain-proof covers feature fully sealed seams, waterproof fabrics, and drainage channels to keep your evaporative cooler completely dry. Prevent rust, mold, and water damage even in the heaviest downpours.",
    "benefits": [
      "Fully sealed seams prevent water intrusion",
      "Waterproof fabric with hydrophobic coating",
      "Built-in drainage channels",
      "Anti-mildew treated interior",
      "Tested to withstand heavy rainfall"
    ],
    "relatedProducts": [
      {
        "label": "Waterproof Cooler Covers",
        "path": "/products/waterproof-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "waterproof-vs-water-resistant",
      "benefits-of-cooler-covers"
    ]
  },
  {
    "slug": "winter-cover",
    "title": "Winter Protection for Cooler Covers",
    "description": "Our winter-rated covers provide insulated protection against freezing temperatures, ice, and snow accumulation. Prevent freeze damage to your evaporative cooler's water lines and internal components during cold months.",
    "benefits": [
      "Insulated thermal barrier",
      "Prevents water line freezing",
      "Snow-shedding design prevents accumulation",
      "Tight-seal closures block cold drafts",
      "Multi-layer construction for maximum warmth"
    ],
    "relatedProducts": [
      {
        "label": "Winter Cooler Covers",
        "path": "/products/winter-cooler-covers"
      },
      {
        "label": "Insulated Cooler Covers",
        "path": "/products/insulated-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "winterizing-evaporative-cooler"
    ]
  },
  {
    "slug": "vented-design",
    "title": "Vented Cover Design",
    "description": "Our vented covers allow controlled airflow while blocking debris and pests. The strategic ventilation prevents moisture buildup and condensation inside the cover, extending both cover and cooler lifespan.",
    "benefits": [
      "Prevents moisture and condensation buildup",
      "Allows natural air circulation",
      "Blocks debris while maintaining airflow",
      "Reduces mold and mildew risk",
      "Ideal for humid climates"
    ],
    "relatedProducts": [
      {
        "label": "Mesh Cooler Covers",
        "path": "/products/mesh-cooler-covers"
      }
    ],
    "relatedBlogSlugs": [
      "vented-vs-closed-cover",
      "mesh-swamp-cooler-covers"
    ]
  }
]
```

### 6.4 resourcePages.json
```json
[
  {
    "slug": "materials",
    "title": "Cooler Cover Materials Guide",
    "description": "Explore the full range of materials available for evaporative cooler covers, from heavy-duty polyester to breathable mesh.",
    "sections": [
      {
        "heading": "Polyester",
        "body": "Detailed information about polyester fabric options. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Canvas",
        "body": "Detailed information about canvas fabric options. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Vinyl",
        "body": "Detailed information about vinyl fabric options. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Mesh",
        "body": "Detailed information about mesh fabric options. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Insulated Materials",
        "body": "Detailed information about insulated material options. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      }
    ],
    "relatedLinks": [
      {
        "label": "Material Comparison Blog",
        "path": "/blog/cover-material-comparison"
      },
      {
        "label": "Insulated Covers",
        "path": "/products/insulated-cooler-covers"
      },
      {
        "label": "Mesh Covers",
        "path": "/products/mesh-cooler-covers"
      }
    ]
  },
  {
    "slug": "sizes",
    "title": "Cooler Cover Sizes",
    "description": "Find the right size cover for your evaporative cooler. Browse standard sizes or learn about custom sizing options.",
    "sections": [
      {
        "heading": "Standard Size Chart",
        "body": "Detailed information about standard cooler cover sizes. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Custom Sizing",
        "body": "Detailed information about custom sizing process. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "How to Choose",
        "body": "Detailed information about choosing the right size. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      }
    ],
    "relatedLinks": [
      {
        "label": "How to Measure",
        "path": "/blog/how-to-measure-cooler-cover"
      },
      {
        "label": "Round Covers",
        "path": "/products/round-cooler-covers"
      },
      {
        "label": "Large Covers",
        "path": "/products/large-cooler-covers"
      }
    ]
  },
  {
    "slug": "sizes/how-to-measure",
    "title": "How to Measure Your Cooler for a Cover",
    "description": "Step-by-step measuring guide to ensure your cooler cover fits perfectly.",
    "sections": [
      {
        "heading": "Tools Needed",
        "body": "Detailed information about measurement tools required. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Step 1: Measure Width",
        "body": "Detailed information about measuring width. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Step 2: Measure Depth",
        "body": "Detailed information about measuring depth. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Step 3: Measure Height",
        "body": "Detailed information about measuring height. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Step 4: Note Protrusions",
        "body": "Detailed information about accounting for pipes and vents. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      }
    ],
    "relatedLinks": [
      {
        "label": "Common Sizing Mistakes",
        "path": "/blog/common-cover-sizing-mistakes"
      },
      {
        "label": "Custom Sizes",
        "path": "/custom/sizes"
      }
    ]
  },
  {
    "slug": "custom/materials",
    "title": "Custom Cover Materials",
    "description": "Choose from our extensive library of materials for your custom cooler cover project.",
    "sections": [
      {
        "heading": "Material Selection",
        "body": "Detailed information about custom material selection process. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Material Samples",
        "body": "Detailed information about requesting material samples. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Performance Ratings",
        "body": "Detailed information about material performance comparison. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      }
    ],
    "relatedLinks": [
      {
        "label": "Custom Cover Materials Blog",
        "path": "/blog/custom-cover-materials"
      },
      {
        "label": "Materials Overview",
        "path": "/materials"
      }
    ]
  },
  {
    "slug": "custom/sizes",
    "title": "Custom Cover Sizes",
    "description": "No standard size fits? We make cooler covers in any dimension you need.",
    "sections": [
      {
        "heading": "Submitting Dimensions",
        "body": "Detailed information about how to submit custom dimensions. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Minimum and Maximum Sizes",
        "body": "Detailed information about size range capabilities. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Irregular Shapes",
        "body": "Detailed information about covers for irregular shapes. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      }
    ],
    "relatedLinks": [
      {
        "label": "Custom Sizes Blog",
        "path": "/blog/custom-cover-sizes"
      },
      {
        "label": "How to Measure",
        "path": "/sizes/how-to-measure"
      }
    ]
  },
  {
    "slug": "custom/opening-design",
    "title": "Custom Opening Design",
    "description": "Design custom openings in your cooler cover for ventilation, access panels, ductwork, and more.",
    "sections": [
      {
        "heading": "Opening Types",
        "body": "Detailed information about available opening configurations. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Side Draft Openings",
        "body": "Detailed information about openings for side draft coolers. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Down Draft Openings",
        "body": "Detailed information about openings for down draft coolers. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Custom Configurations",
        "body": "Detailed information about fully custom opening designs. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      }
    ],
    "relatedLinks": [
      {
        "label": "Opening Designs Blog",
        "path": "/blog/custom-opening-designs"
      },
      {
        "label": "Side Draft Covers",
        "path": "/products/side-draft-cooler-covers"
      },
      {
        "label": "Down Draft Covers",
        "path": "/products/down-draft-cooler-covers"
      }
    ]
  },
  {
    "slug": "custom/logo-printing",
    "title": "Custom Logo Printing",
    "description": "Add your brand logo, company name, or custom graphics to any cooler cover. Multiple printing methods available.",
    "sections": [
      {
        "heading": "Printing Methods",
        "body": "Detailed information about available printing techniques. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "File Requirements",
        "body": "Detailed information about logo file format and resolution requirements. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Color Options",
        "body": "Detailed information about color matching and Pantone support. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Pricing",
        "body": "Detailed information about logo printing pricing tiers. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      }
    ],
    "relatedLinks": [
      {
        "label": "Logo Printing Blog",
        "path": "/blog/logo-printing-on-cooler-covers"
      },
      {
        "label": "Custom Covers",
        "path": "/products/custom-evaporative-cooler-covers"
      }
    ]
  },
  {
    "slug": "resources/installation",
    "title": "Cooler Cover Installation Guide",
    "description": "Complete installation instructions for all types of evaporative cooler covers.",
    "sections": [
      {
        "heading": "Pre-Installation Checklist",
        "body": "Detailed information about what to do before installing. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Basic Installation Steps",
        "body": "Detailed information about universal installation steps. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Rooftop Installation",
        "body": "Detailed information about special considerations for rooftop units. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Securing in High Winds",
        "body": "Detailed information about wind-proofing your installation. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      }
    ],
    "relatedLinks": [
      {
        "label": "Installation Blog",
        "path": "/blog/how-to-install-cooler-cover"
      },
      {
        "label": "Maintenance Guide",
        "path": "/resources/maintenance"
      }
    ]
  },
  {
    "slug": "resources/maintenance",
    "title": "Cooler Cover Maintenance Guide",
    "description": "Keep your cooler cover in top condition with proper cleaning, storage, and maintenance practices.",
    "sections": [
      {
        "heading": "Regular Cleaning",
        "body": "Detailed information about routine cleaning schedule. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Stain Removal",
        "body": "Detailed information about removing common stains. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Seasonal Storage",
        "body": "Detailed information about proper off-season storage. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      },
      {
        "heading": "Repair Tips",
        "body": "Detailed information about minor repair techniques. This placeholder content will be replaced with comprehensive, SEO-optimized content in the WordPress implementation."
      }
    ],
    "relatedLinks": [
      {
        "label": "Cleaning Blog",
        "path": "/blog/how-to-clean-cooler-covers"
      },
      {
        "label": "Storage Blog",
        "path": "/blog/how-to-store-cooler-cover"
      }
    ]
  }
]
```

### 6.5 blogPosts.json
```json
[
  {
    "slug": "evaporative-cooler-covers-guide",
    "title": "The Complete Guide to Evaporative Cooler Covers",
    "excerpt": "Everything you need to know about protecting your evaporative cooler with the right cover — materials, sizing, features, and maintenance tips.",
    "isPillar": true,
    "clusterSlugs": [
      "what-is-evaporative-cooler-cover",
      "benefits-of-cooler-covers",
      "how-to-measure-cooler-cover",
      "winterizing-evaporative-cooler",
      "cover-material-comparison"
    ],
    "internalLinks": [
      {
        "label": "Shop All Covers",
        "path": "/products/evaporative-cooler-covers"
      },
      {
        "label": "Custom Solutions",
        "path": "/custom-solutions"
      }
    ],
    "content": [
      {
        "heading": "Why Every Cooler Needs a Cover",
        "level": "h2",
        "body": "This is placeholder content about why evaporative coolers need protective covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Types of Cooler Covers",
        "level": "h2",
        "body": "This is placeholder content about different types of evaporative cooler covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Choosing the Right Material",
        "level": "h2",
        "body": "This is placeholder content about material selection for cooler covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Sizing and Fit",
        "level": "h2",
        "body": "This is placeholder content about proper sizing for cooler covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "what-is-evaporative-cooler-cover",
    "title": "What Is an Evaporative Cooler Cover? A Beginner's Guide",
    "excerpt": "Learn what evaporative cooler covers are, why they're essential, and how they protect your cooling investment.",
    "isPillar": false,
    "pillarSlug": "evaporative-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "Evaporative Cooler Covers",
        "path": "/products/evaporative-cooler-covers"
      },
      {
        "label": "Custom Cooler Covers",
        "path": "/products/custom-evaporative-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "What Is an Evaporative Cooler Cover?",
        "level": "h2",
        "body": "This is placeholder content about definition and purpose of evaporative cooler covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "How Does It Protect Your Cooler?",
        "level": "h2",
        "body": "This is placeholder content about protection mechanisms of cooler covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "When Should You Use a Cover?",
        "level": "h2",
        "body": "This is placeholder content about seasonal usage recommendations. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "benefits-of-cooler-covers",
    "title": "Top Benefits of Using Cooler Covers for Your Evaporative Unit",
    "excerpt": "Discover the key benefits of cooler covers including UV protection, rain resistance, dust prevention, and extended equipment lifespan.",
    "isPillar": false,
    "pillarSlug": "evaporative-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "UV Protection",
        "path": "/features/uv-protection"
      },
      {
        "label": "Rain-Proof Covers",
        "path": "/features/rain-proof"
      },
      {
        "label": "UV-Resistant Covers",
        "path": "/products/uv-resistant-cooler-covers"
      },
      {
        "label": "Waterproof Covers",
        "path": "/products/waterproof-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "UV Protection Benefits",
        "level": "h2",
        "body": "This is placeholder content about UV protection advantages. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Weather Resistance",
        "level": "h2",
        "body": "This is placeholder content about rain and weather protection. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Dust and Debris Prevention",
        "level": "h2",
        "body": "This is placeholder content about keeping coolers clean. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Extended Equipment Lifespan",
        "level": "h2",
        "body": "This is placeholder content about longevity benefits. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "how-to-measure-cooler-cover",
    "title": "How to Measure Your Cooler for the Perfect Cover Fit",
    "excerpt": "Step-by-step guide to measuring your evaporative cooler for a custom-fit cover. Avoid common sizing mistakes.",
    "isPillar": false,
    "pillarSlug": "evaporative-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "Sizing Guide",
        "path": "/sizes/how-to-measure"
      },
      {
        "label": "Round Covers",
        "path": "/products/round-cooler-covers"
      },
      {
        "label": "Large Covers",
        "path": "/products/large-cooler-covers"
      },
      {
        "label": "Extra Large Covers",
        "path": "/products/extra-large-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Tools You'll Need",
        "level": "h2",
        "body": "This is placeholder content about measurement tools. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Measuring Width and Depth",
        "level": "h2",
        "body": "This is placeholder content about width and depth measurement. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Measuring Height",
        "level": "h2",
        "body": "This is placeholder content about height measurement. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Accounting for Protrusions",
        "level": "h3",
        "body": "This is placeholder content about measuring around pipes and vents. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "winterizing-evaporative-cooler",
    "title": "Winterizing Your Evaporative Cooler: Complete Checklist",
    "excerpt": "Prepare your evaporative cooler for winter with this comprehensive guide. Protect against freezing, moisture, and off-season damage.",
    "isPillar": false,
    "pillarSlug": "evaporative-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "Winter Cover Feature",
        "path": "/features/winter-cover"
      },
      {
        "label": "Winter Covers",
        "path": "/products/winter-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Why Winterize Your Cooler?",
        "level": "h2",
        "body": "This is placeholder content about importance of winterization. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Step-by-Step Winterization",
        "level": "h2",
        "body": "This is placeholder content about winterization process. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Choosing a Winter Cover",
        "level": "h2",
        "body": "This is placeholder content about winter cover selection. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "cover-material-comparison",
    "title": "Cooler Cover Material Comparison: Which Fabric Is Best?",
    "excerpt": "Compare polyester, canvas, vinyl, mesh, and insulated materials for evaporative cooler covers. Find the best material for your climate.",
    "isPillar": false,
    "pillarSlug": "evaporative-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "Materials Guide",
        "path": "/materials"
      },
      {
        "label": "Insulated Covers",
        "path": "/products/insulated-cooler-covers"
      },
      {
        "label": "Mesh Covers",
        "path": "/products/mesh-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Polyester Covers",
        "level": "h2",
        "body": "This is placeholder content about polyester material properties. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Canvas Covers",
        "level": "h2",
        "body": "This is placeholder content about canvas material properties. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Vinyl Covers",
        "level": "h2",
        "body": "This is placeholder content about vinyl material properties. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Mesh Covers",
        "level": "h2",
        "body": "This is placeholder content about mesh material properties. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Insulated Covers",
        "level": "h2",
        "body": "This is placeholder content about insulated material properties. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "custom-cooler-covers",
    "title": "Custom Cooler Covers: Complete Customization Guide",
    "excerpt": "Learn about every customization option for evaporative cooler covers — materials, sizes, openings, logos, and order quantities.",
    "isPillar": true,
    "clusterSlugs": [
      "custom-cover-materials",
      "custom-cover-sizes",
      "custom-opening-designs",
      "logo-printing-on-cooler-covers",
      "bulk-vs-small-batch-orders"
    ],
    "internalLinks": [
      {
        "label": "Custom Covers",
        "path": "/products/custom-evaporative-cooler-covers"
      },
      {
        "label": "Get a Quote",
        "path": "/contact"
      }
    ],
    "content": [
      {
        "heading": "Why Go Custom?",
        "level": "h2",
        "body": "This is placeholder content about benefits of custom cooler covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Customization Options Overview",
        "level": "h2",
        "body": "This is placeholder content about overview of all customization options. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Our Custom Process",
        "level": "h2",
        "body": "This is placeholder content about how the custom order process works. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "custom-cover-materials",
    "title": "Choosing the Right Material for Your Custom Cooler Cover",
    "excerpt": "A deep dive into material options for custom cooler covers. Compare durability, weather resistance, and cost.",
    "isPillar": false,
    "pillarSlug": "custom-cooler-covers",
    "internalLinks": [
      {
        "label": "Custom Materials",
        "path": "/custom/materials"
      },
      {
        "label": "Insulated Covers",
        "path": "/products/insulated-cooler-covers"
      },
      {
        "label": "Mesh Covers",
        "path": "/products/mesh-cooler-covers"
      },
      {
        "label": "Waterproof Covers",
        "path": "/products/waterproof-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Material Options",
        "level": "h2",
        "body": "This is placeholder content about available custom materials. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Climate Considerations",
        "level": "h2",
        "body": "This is placeholder content about choosing materials by climate. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Cost vs. Durability",
        "level": "h2",
        "body": "This is placeholder content about material cost comparison. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "custom-cover-sizes",
    "title": "Custom Cooler Cover Sizes: Getting the Perfect Fit",
    "excerpt": "How to specify exact dimensions for your custom cooler cover order. Standard sizes vs. fully custom measurements.",
    "isPillar": false,
    "pillarSlug": "custom-cooler-covers",
    "internalLinks": [
      {
        "label": "Custom Sizes",
        "path": "/custom/sizes"
      },
      {
        "label": "Round Covers",
        "path": "/products/round-cooler-covers"
      },
      {
        "label": "Large Covers",
        "path": "/products/large-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Standard vs. Custom Sizes",
        "level": "h2",
        "body": "This is placeholder content about standard and custom sizing options. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "How to Submit Your Dimensions",
        "level": "h2",
        "body": "This is placeholder content about submitting custom dimensions. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "custom-opening-designs",
    "title": "Custom Opening Designs for Cooler Covers",
    "excerpt": "Explore different opening configurations for cooler covers — side draft, down draft, window, and rooftop openings.",
    "isPillar": false,
    "pillarSlug": "custom-cooler-covers",
    "internalLinks": [
      {
        "label": "Opening Design Options",
        "path": "/custom/opening-design"
      },
      {
        "label": "Side Draft Covers",
        "path": "/products/side-draft-cooler-covers"
      },
      {
        "label": "Down Draft Covers",
        "path": "/products/down-draft-cooler-covers"
      },
      {
        "label": "Window Covers",
        "path": "/products/window-cooler-covers"
      },
      {
        "label": "Rooftop Covers",
        "path": "/products/rooftop-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Why Opening Design Matters",
        "level": "h2",
        "body": "This is placeholder content about importance of proper openings. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Side Draft Openings",
        "level": "h2",
        "body": "This is placeholder content about side draft opening configurations. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Down Draft Openings",
        "level": "h2",
        "body": "This is placeholder content about down draft opening configurations. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Window and Rooftop Options",
        "level": "h2",
        "body": "This is placeholder content about window and rooftop opening designs. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "logo-printing-on-cooler-covers",
    "title": "Logo Printing on Cooler Covers: Branding Options",
    "excerpt": "Turn your cooler covers into branding assets. Learn about printing methods, color options, and design guidelines.",
    "isPillar": false,
    "pillarSlug": "custom-cooler-covers",
    "internalLinks": [
      {
        "label": "Logo Printing Service",
        "path": "/custom/logo-printing"
      }
    ],
    "content": [
      {
        "heading": "Printing Methods",
        "level": "h2",
        "body": "This is placeholder content about screen printing, heat transfer, digital printing. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Design Guidelines",
        "level": "h2",
        "body": "This is placeholder content about logo design requirements and file formats. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Color Matching",
        "level": "h2",
        "body": "This is placeholder content about Pantone and CMYK color matching. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "bulk-vs-small-batch-orders",
    "title": "Bulk vs. Small Batch Cooler Cover Orders: Which Is Right?",
    "excerpt": "Compare bulk and small batch ordering options. Understand pricing tiers, lead times, and customization flexibility.",
    "isPillar": false,
    "pillarSlug": "custom-cooler-covers",
    "internalLinks": [
      {
        "label": "Bulk Orders",
        "path": "/products/bulk-order-cooler-covers"
      },
      {
        "label": "Small Batch Orders",
        "path": "/products/small-batch-cooler-covers"
      },
      {
        "label": "Commercial Covers",
        "path": "/products/commercial-cooler-covers"
      },
      {
        "label": "Industrial Covers",
        "path": "/products/industrial-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Bulk Order Advantages",
        "level": "h2",
        "body": "This is placeholder content about benefits of bulk ordering. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Small Batch Flexibility",
        "level": "h2",
        "body": "This is placeholder content about advantages of small batch orders. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Pricing Comparison",
        "level": "h2",
        "body": "This is placeholder content about cost comparison between order sizes. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "swamp-cooler-covers-guide",
    "title": "Swamp Cooler Covers: The Ultimate Guide",
    "excerpt": "Complete guide to swamp cooler covers — sizes, types, materials, and installation. Everything you need to protect your swamp cooler.",
    "isPillar": true,
    "clusterSlugs": [
      "swamp-cooler-cover-sizes",
      "swamp-cooler-cover-side-draft",
      "swamp-cooler-cover-down-draft",
      "insulated-swamp-cooler-covers",
      "mesh-swamp-cooler-covers"
    ],
    "internalLinks": [
      {
        "label": "Shop Swamp Cooler Covers",
        "path": "/products/swamp-cooler-covers"
      },
      {
        "label": "Evaporative Cooler Covers",
        "path": "/products/evaporative-cooler-covers"
      }
    ],
    "canonicalNote": "Consider canonical to /blog/evaporative-cooler-covers-guide/ for SEO consolidation",
    "content": [
      {
        "heading": "What Is a Swamp Cooler?",
        "level": "h2",
        "body": "This is placeholder content about swamp cooler definition and how it works. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Why Cover Your Swamp Cooler?",
        "level": "h2",
        "body": "This is placeholder content about reasons to cover a swamp cooler. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Types of Swamp Cooler Covers",
        "level": "h2",
        "body": "This is placeholder content about overview of swamp cooler cover types. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "swamp-cooler-cover-sizes",
    "title": "Swamp Cooler Cover Sizes: Find Your Fit",
    "excerpt": "A guide to standard and custom sizes for swamp cooler covers. From small window units to large industrial systems.",
    "isPillar": false,
    "pillarSlug": "swamp-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "Size Guide",
        "path": "/sizes"
      },
      {
        "label": "Round Covers",
        "path": "/products/round-cooler-covers"
      },
      {
        "label": "Large Covers",
        "path": "/products/large-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Standard Size Chart",
        "level": "h2",
        "body": "This is placeholder content about standard swamp cooler cover sizes. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Custom Sizing",
        "level": "h2",
        "body": "This is placeholder content about custom sizing for non-standard units. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "swamp-cooler-cover-side-draft",
    "title": "Side Draft Swamp Cooler Covers: What You Need to Know",
    "excerpt": "Everything about covers for side-draft swamp coolers — sizing, ventilation, and installation tips.",
    "isPillar": false,
    "pillarSlug": "swamp-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "Side Draft Covers",
        "path": "/products/side-draft-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "What Is a Side Draft Cooler?",
        "level": "h2",
        "body": "This is placeholder content about side draft cooler explanation. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Cover Requirements",
        "level": "h2",
        "body": "This is placeholder content about specific cover needs for side draft. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "swamp-cooler-cover-down-draft",
    "title": "Down Draft Swamp Cooler Covers Explained",
    "excerpt": "Covers designed for down-draft swamp coolers — how they differ and what to look for.",
    "isPillar": false,
    "pillarSlug": "swamp-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "Down Draft Covers",
        "path": "/products/down-draft-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Down Draft vs. Side Draft",
        "level": "h2",
        "body": "This is placeholder content about comparing draft types. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Cover Design Considerations",
        "level": "h2",
        "body": "This is placeholder content about design needs for down draft. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "insulated-swamp-cooler-covers",
    "title": "Insulated Swamp Cooler Covers for Cold Climates",
    "excerpt": "Why insulated covers matter for swamp coolers in cold regions. Material options and R-value comparisons.",
    "isPillar": false,
    "pillarSlug": "swamp-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "Insulated Covers",
        "path": "/products/insulated-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Why Insulation Matters",
        "level": "h2",
        "body": "This is placeholder content about insulation benefits for swamp coolers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Insulation Material Options",
        "level": "h2",
        "body": "This is placeholder content about insulation materials compared. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "mesh-swamp-cooler-covers",
    "title": "Mesh Swamp Cooler Covers: Breathable Protection",
    "excerpt": "Mesh covers for swamp coolers — perfect for in-season pest protection while maintaining airflow.",
    "isPillar": false,
    "pillarSlug": "swamp-cooler-covers-guide",
    "internalLinks": [
      {
        "label": "Mesh Covers",
        "path": "/products/mesh-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "When to Use a Mesh Cover",
        "level": "h2",
        "body": "This is placeholder content about use cases for mesh covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Mesh vs. Solid Covers",
        "level": "h2",
        "body": "This is placeholder content about comparing mesh and solid covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "cooler-cover-installation",
    "title": "Cooler Cover Installation & Maintenance Guide",
    "excerpt": "Learn how to properly install, clean, store, and maintain your cooler cover for maximum lifespan.",
    "isPillar": true,
    "clusterSlugs": [
      "how-to-install-cooler-cover",
      "how-to-clean-cooler-covers",
      "how-to-store-cooler-cover",
      "common-cover-sizing-mistakes"
    ],
    "internalLinks": [
      {
        "label": "Installation Guide",
        "path": "/resources/installation"
      },
      {
        "label": "Maintenance Tips",
        "path": "/resources/maintenance"
      }
    ],
    "content": [
      {
        "heading": "Installation Basics",
        "level": "h2",
        "body": "This is placeholder content about basic installation overview. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Maintenance Schedule",
        "level": "h2",
        "body": "This is placeholder content about recommended maintenance schedule. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "how-to-install-cooler-cover",
    "title": "How to Install a Cooler Cover: Step-by-Step Guide",
    "excerpt": "Detailed installation instructions for all types of evaporative cooler covers.",
    "isPillar": false,
    "pillarSlug": "cooler-cover-installation",
    "internalLinks": [
      {
        "label": "Installation Resources",
        "path": "/resources/installation"
      }
    ],
    "content": [
      {
        "heading": "Before You Start",
        "level": "h2",
        "body": "This is placeholder content about pre-installation checklist. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Installation Steps",
        "level": "h2",
        "body": "This is placeholder content about step-by-step installation. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Securing the Cover",
        "level": "h2",
        "body": "This is placeholder content about fastening and securing tips. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "how-to-clean-cooler-covers",
    "title": "How to Clean Your Cooler Cover",
    "excerpt": "Keep your cooler cover in top shape with proper cleaning techniques for every material type.",
    "isPillar": false,
    "pillarSlug": "cooler-cover-installation",
    "internalLinks": [
      {
        "label": "Maintenance Guide",
        "path": "/resources/maintenance"
      }
    ],
    "content": [
      {
        "heading": "Cleaning by Material Type",
        "level": "h2",
        "body": "This is placeholder content about cleaning methods per material. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Removing Stains",
        "level": "h2",
        "body": "This is placeholder content about stain removal techniques. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "how-to-store-cooler-cover",
    "title": "How to Store Your Cooler Cover in the Off-Season",
    "excerpt": "Proper storage extends cover life. Learn folding techniques and storage tips.",
    "isPillar": false,
    "pillarSlug": "cooler-cover-installation",
    "internalLinks": [
      {
        "label": "Maintenance Guide",
        "path": "/resources/maintenance"
      }
    ],
    "content": [
      {
        "heading": "Folding Your Cover",
        "level": "h2",
        "body": "This is placeholder content about proper folding techniques. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Storage Location Tips",
        "level": "h2",
        "body": "This is placeholder content about where and how to store. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "common-cover-sizing-mistakes",
    "title": "Common Cooler Cover Sizing Mistakes to Avoid",
    "excerpt": "Don't order the wrong size! Here are the most common measurement errors and how to avoid them.",
    "isPillar": false,
    "pillarSlug": "cooler-cover-installation",
    "internalLinks": [
      {
        "label": "How to Measure",
        "path": "/sizes/how-to-measure"
      }
    ],
    "content": [
      {
        "heading": "Mistake #1: Ignoring Protrusions",
        "level": "h2",
        "body": "This is placeholder content about measuring around pipes and fittings. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Mistake #2: Measuring Too Tight",
        "level": "h2",
        "body": "This is placeholder content about allowing for slack and clearance. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Mistake #3: Wrong Shape",
        "level": "h2",
        "body": "This is placeholder content about square vs round measurement errors. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "cooler-cover-materials-performance",
    "title": "Cooler Cover Materials & Performance Guide",
    "excerpt": "An in-depth look at how different materials perform in terms of waterproofing, UV resistance, ventilation, and durability.",
    "isPillar": true,
    "clusterSlugs": [
      "waterproof-vs-water-resistant",
      "uv-protection-for-cooler-covers",
      "vented-vs-closed-cover"
    ],
    "internalLinks": [
      {
        "label": "Materials Overview",
        "path": "/materials"
      },
      {
        "label": "All Products",
        "path": "/products"
      }
    ],
    "content": [
      {
        "heading": "Material Performance Overview",
        "level": "h2",
        "body": "This is placeholder content about high-level material performance comparison. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Choosing by Climate",
        "level": "h2",
        "body": "This is placeholder content about material selection by climate zone. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "waterproof-vs-water-resistant",
    "title": "Waterproof vs. Water-Resistant Cooler Covers: What's the Difference?",
    "excerpt": "Understand the difference between waterproof and water-resistant covers and when each is appropriate.",
    "isPillar": false,
    "pillarSlug": "cooler-cover-materials-performance",
    "internalLinks": [
      {
        "label": "Rain-Proof Feature",
        "path": "/features/rain-proof"
      },
      {
        "label": "Waterproof Covers",
        "path": "/products/waterproof-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Defining Waterproof",
        "level": "h2",
        "body": "This is placeholder content about what waterproof means in cover context. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Defining Water-Resistant",
        "level": "h2",
        "body": "This is placeholder content about what water-resistant means. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Which Do You Need?",
        "level": "h2",
        "body": "This is placeholder content about choosing between the two. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "uv-protection-for-cooler-covers",
    "title": "UV Protection for Cooler Covers: Why It Matters",
    "excerpt": "Sun damage is a leading cause of cover degradation. Learn how UV protection works and why it's essential.",
    "isPillar": false,
    "pillarSlug": "cooler-cover-materials-performance",
    "internalLinks": [
      {
        "label": "UV Protection Feature",
        "path": "/features/uv-protection"
      },
      {
        "label": "UV-Resistant Covers",
        "path": "/products/uv-resistant-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "How UV Damages Covers",
        "level": "h2",
        "body": "This is placeholder content about UV degradation mechanisms. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "UV Protection Technologies",
        "level": "h2",
        "body": "This is placeholder content about UV protection methods. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  },
  {
    "slug": "vented-vs-closed-cover",
    "title": "Vented vs. Closed Cooler Covers: Pros and Cons",
    "excerpt": "Should your cover allow airflow or be fully sealed? Compare vented and closed cover designs.",
    "isPillar": false,
    "pillarSlug": "cooler-cover-materials-performance",
    "internalLinks": [
      {
        "label": "Vented Design",
        "path": "/features/vented-design"
      },
      {
        "label": "Mesh Covers",
        "path": "/products/mesh-cooler-covers"
      }
    ],
    "content": [
      {
        "heading": "Vented Cover Benefits",
        "level": "h2",
        "body": "This is placeholder content about advantages of vented covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Closed Cover Benefits",
        "level": "h2",
        "body": "This is placeholder content about advantages of closed covers. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      },
      {
        "heading": "Making the Right Choice",
        "level": "h2",
        "body": "This is placeholder content about decision factors. In the WordPress implementation, this section will contain detailed, original content optimized for SEO with proper keyword density and natural language flow. The content should be 300-500 words per section for optimal ranking potential."
      }
    ]
  }
]
```

### 6.6 主导航（mega menu）

```json
{
  "primary": [
    { "label": "Home", "href": "/" },
    { "label": "Products", "href": "/products", "mega": "categories" },
    { "label": "Custom", "href": "/custom" },
    { "label": "Features", "href": "/features", "mega": "features" },
    { "label": "Resources", "href": "/resources", "mega": "resources" },
    { "label": "Blog", "href": "/blog" },
    { "label": "About", "href": "/about" },
    { "label": "Contact", "href": "/contact", "cta": true }
  ]
}
```

### 6.7 Footer 5 栏

1. Brand + 简介 + email
2. Products（6 个主分类 + "All products"）
3. Resources（5 条 + "All resources"）
4. Company（About / Custom / Blog / Contact）
5. Newsletter（可选，或简版询盘入口）

---

## 7. 询盘表单系统（本规格的核心转化机制）

整站采用**「就地询盘」**模式：用户在浏览任何产品或分类的当前页就能直接发起询盘，无需跳转。

### 7.1 三种入口

| 入口 | 表单变体 | 位置 |
|---|---|---|
| `/contact` | **custom**（完整定制） | 整页主体 |
| `/custom` | **custom** | 整页主体 |
| `/product/{slug}` × 12 | **custom**（产品名预填、可定制规格） | 详情页底部模块 |
| `/products/{slug}` × 20 | **simple**（分类名预填） | 分类页底部模块 |
| `/` 首页、`/features/{slug}`、`/resources/{slug}`、`/materials`、`/sizes` | **simple** | 页面底部模块 |
| 其他页（about/blog） | 无嵌入，文末 CTA 按钮 → `/contact` | — |

### 7.2 表单变体字段定义

#### A. Simple Inquiry（简版）

```text
- subject*       自动预填（如 "Inquiry about: Evaporative Cooler Covers"），用户可改
- name*          text, max 100
- email*         email, max 255
- company        text, max 150
- country        text, max 80
- quantity       number, min 1 (MOQ 提示)
- message*       textarea, max 1000
- consent*       checkbox（同意被联系）
- [submit]       "Send Inquiry"
```

#### B. Custom Inquiry（定制版，对应 React 组件 `ProductCustomizer`）

simple 全部字段 +

```text
- product_name*       预填当前产品名
- color               8 个预设色块单选 + 自定义色号文本
- material            下拉：Polyester 600D / Oxford 1680D / PVC Coated / Canvas / Mesh Vinyl / Custom
- dimensions          width × height × depth + 单位下拉 (cm / in / mm)
- logo_upload         file, accept image/*, max 5 MB
- logo_position       下拉：Front / Back / Left / Right / Top / None
- opening_design      下拉：Front zipper / Side velcro / Bottom drawstring / Custom cutout / None
- notes               textarea, max 1000
```

### 7.3 校验规则（客户端）

- 所有 `*` 必填项不为空（trim 后）
- email 通过 `type="email"` + 正则
- max length 用 `maxlength` 属性 + JS 二次校验
- 文件大小 ≤ 5 MB，类型以 `accept` 限制
- 字符串提交前 `encodeURIComponent`
- **禁止** 使用 `innerHTML` 写回用户输入；只用 `textContent`

### 7.4 三种提交方案（实现方择一）

| 方案 | 适用 | 说明 |
|---|---|---|
| **A · Formspree / Web3Forms / Getform**（推荐） | 纯静态、有第三方账户 | `<form action="https://formspree.io/f/XXXX" method="POST">`，TODO: 替换 endpoint |
| **B · mailto:** | 完全无后端、临时方案 | JS 拼接 body，`window.location.href = "mailto:custom@aircoolercover.com?subject=...&body=..."` |
| **C · WhatsApp Deep Link** | B2B 海外、要即时沟通 | `https://wa.me/{phone}?text={encoded body}`，TODO: 填写号码 |

> 上线前必须在 `/assets/js/inquiry.js` 顶部把 `SUBMIT_MODE` 和 endpoint/邮箱/电话替换为真实值。

### 7.5 复用片段（避免重复代码）

构建脚本需将表单写成 2 个可复用 HTML 片段，并 include 进每个目标页：

```text
/partials/inquiry-form-simple.html
/partials/inquiry-form-custom.html
```

每个嵌入位点统一 anchor id = `#inquiry`，便于站内锚链接（如 `/product/xxx#inquiry`）。

### 7.6 提交成功反馈

- 表单提交后显示成功面板（`role="status" aria-live="polite"`）
- 文案：`Thanks! Our team will reply within 1 business day.`
- 重置表单字段
- 不要弹 alert

---

## 8. 各页面"必含元素"清单（只规定有什么，不规定外观）

### 8.1 通用 Header（全站）
- Logo（链回 /）
- 主导航（mega menu）
- Contact CTA 按钮
- 移动端汉堡

### 8.2 通用 Footer（全站）
- 5 栏链接
- copyright
- 社媒（可选）

### 8.3 Home `/`
- H1（含主关键词 "Custom Air Cooler Covers"）
- Hero 副标 + 2 个 CTA（→ /products, → /contact）
- "Why us" / Features 区块（4 张 from featurePages）
- 热门分类区块（6 张 from productCategories）
- About 工厂简介（→ /about）
- 精选博客 4 篇
- **simple 询盘表单**（`#inquiry`）

### 8.4 `/products/{slug}` 产品分类页
- 面包屑
- H1 = 分类名
- 分类描述
- 产品卡片网格（该分类下所有 productItems）
- **Category SEO 文案块**（产品网格下方，"Related categories" 上方）
  - 数据源：`productCategories[].seoContent`（可选字段；不填则不渲染）
  - 结构：H2 intro（60–100 字）+ 3–4 条 highlights + 3–4 个 FAQ（accordion）
  - 单页总字数 300–450 字，宁少勿水，避免与顶部 description / 顶部 features 重复
  - 节点：`<section data-pattern="category-seo" data-pattern-category="content">`
  - 若包含 FAQ，注入 FAQPage JSON-LD
  - 字段定义详见 `AGENTS.md §1.3`
- "Related categories" 3 张
- "Related guides" 2 篇博客
- **simple 询盘表单**（subject 预填分类名）
- 该分类的 ItemList JSON-LD

### 8.5 `/product/{slug}` 产品详情页
- 面包屑
- H1 = 产品名
- 图片
- 描述、特性、规格
- "Related products" 3 张
- "Care & Sizing" 1 篇博客
- **custom 询盘表单**（产品名预填）
- Product JSON-LD

### 8.6 博客详情
- 面包屑
- H1
- 发布日期、作者
- 正文（含 H2/H3 结构）
- 反向链：pillar + 2 cluster + 1 分类 + 1 产品
- 文末 CTA 卡片 → `/contact`
- Article + BreadcrumbList JSON-LD

### 8.7 /contact
- H1 "Request a Quote"
- 公司信息（邮箱、地址、营业时间）
- **custom 询盘表单**
- FAQ 4–6 条
- ContactPoint JSON-LD

---

## 9. 交互行为（功能层，外观自定）

- **Sticky header**：滚动 > 40px 加 `.is-scrolled`
- **Mega menu**：hover/focus 打开，Esc 关闭，键盘可达
- **Mobile menu**：汉堡切换 `aria-expanded`
- **询盘表单**：见 §7
- **路由切换回到顶部**：纯静态多页面天然支持，无需处理
- **404 页**：含搜索框 + 主分类入口 + → /contact

---

## 10. SEO 与元数据规则

### 10.1 每页 `<head>` 必含

- `<title>` < 60 字符，含主关键词
- `<meta name="description">` < 160 字符
- `<link rel="canonical" href="绝对URL">`
- Open Graph：og:title / og:description / og:image / og:url / og:type
- Twitter Card：summary_large_image
- `<meta name="viewport" content="width=device-width, initial-scale=1">`
- `<html lang="en">`

### 10.2 JSON-LD 类型映射

| 页面 | Schema |
|---|---|
| 首页 | Organization + WebSite |
| /about | Organization |
| /contact | ContactPage + ContactPoint |
| /products/{slug} | CollectionPage + ItemList + BreadcrumbList |
| /product/{slug} | Product + BreadcrumbList |
| /blog/{slug} | Article + BreadcrumbList |
| /resources/{slug} | TechArticle + BreadcrumbList |
| 全站 | BreadcrumbList（非首页） |

### 10.3 `robots.txt`
```text
User-agent: *
Allow: /
Sitemap: https://aircoolercover.com/sitemap.xml
```

### 10.4 `sitemap.xml`
包含全部 70+ 路由，`lastmod` 取构建日期。

---

## 11. 构建逻辑

### 11.1 推荐技术路线

- 模板引擎：**Eleventy (11ty)** 或 **简易 Node 脚本 + Nunjucks/EJS**
- 不使用任何前端框架（无 React/Vue）
- CSS：原生 + 自定义变量；可用 Tailwind CLI（可选，非强制）
- JS：原生 ES Modules，无打包器或 Vite 单文件即可

### 11.2 推荐目录结构

```text
project/
├── data/
│   ├── productCategories.json
│   ├── productItems.json
│   ├── featurePages.json
│   ├── resourcePages.json
│   └── blogPosts.json
├── partials/
│   ├── header.html
│   ├── footer.html
│   ├── inquiry-form-simple.html
│   └── inquiry-form-custom.html
├── templates/
│   ├── base.njk
│   ├── home.njk
│   ├── category.njk
│   ├── product.njk
│   ├── blog.njk
│   ├── feature.njk
│   └── resource.njk
├── assets/
│   ├── css/main.css
│   ├── js/main.js
│   ├── js/inquiry.js
│   └── images/
├── scripts/
│   └── build.mjs        ← 读 data/ + templates/ → 输出 dist/
└── dist/                ← 上传到 Hostinger public_html/
```

### 11.3 渲染顺序

1. 读取所有 JSON 数据
2. 渲染静态页（home, about, contact, custom, 404, materials, sizes, hubs）
3. 遍历 productCategories → 渲染 /products/{slug}
4. 遍历 productItems → 渲染 /product/{slug}
5. 遍历 featurePages → 渲染 /features/{slug}
6. 遍历 resourcePages → 渲染 /resources/{slug}
7. 遍历 blogPosts → 渲染 /blog/{slug}
8. 生成 sitemap.xml + robots.txt
9. 复制 assets/ 到 dist/

---

## 12. 给 Claude Code / Codex 的执行 Prompt

> 复制下方文本作为给 AI 编码助手的指令：

```text
请按本规格文档生成一个纯静态站点（HTML/CSS/JS），可直接上传到 Hostinger public_html/。

强制要求（不可偏离）：
1. 严格遵循文档第 2–5 章的信息架构和路由表，生成全部 70+ 页面。
2. 严格遵循第 4 章的内部链接矩阵，每页出链数量不得低于规定。
3. 严格遵循第 7 章的询盘表单系统：
   - simple 与 custom 两套表单作为可复用片段
   - 嵌入位置与规格一致
   - 字段、校验、提交反馈一致
   - 提交方案选 A（Formspree），endpoint 留 TODO 注释
4. 严格遵循第 10 章的 SEO 元数据与 JSON-LD 要求。
5. 输出 sitemap.xml 与 robots.txt。

自由发挥（无强制）：
- 配色、字体、间距、圆角、阴影、动效
- 组件样式（按钮/卡片/输入框）
- 图片占位（用 <img loading="lazy"> + 占位 svg/灰底即可）
- 微交互

数据来源：文档第 6 章已给出全部 JSON，直接写入 data/*.json。
博客正文为占位文本，按结构生成 H2/H3 即可，用户后续会填真实内容。

构建脚本：用 Node + Nunjucks（或同等模板）实现 scripts/build.mjs，npm run build 输出 dist/。

追加约束（WordPress 转换准备）：
你的输出最终会被 `wp-block-theme-converter` Claude Skill 转成 FSE Block Theme。
所以必须严格遵循 §13 的所有约定：tokens 命名固定、每个顶层 section 带 `data-pattern` 与 `data-pattern-category`、
Header/Footer/询盘表单带 `data-part`、禁止 inline `style=""`、JS 一律原生 IIFE 不引第三方库、
在 `public_html/` 根目录产出 `theme-meta.json`。视觉风格依然自由。
```

---

_文档版本：v2 · 生成于 2026-05-29_

---

## 13. WordPress 输出对齐（给 Claude Code 的硬约束）

本章是 v2 新增。目的：让 Claude Code 产出的静态站，能被 [`siddik-web/wp-block-theme-converter`](https://github.com/siddik-web/wp-block-theme-converter) Claude Skill **零摩擦**地转换为 WordPress FSE Block Theme，最终部署到 Hostinger WordPress（Ollie Pro 兼容）。

### 13.1 转换链路全景

```text
Claude Code
   ↓ 产出
public_html/                  ← 静态站本身（可直接部署 Hostinger 静态托管做预览）
   ├── assets/                （全局共享层，read-only across pages）
   │   ├── reset.css
   │   ├── tokens.css         （所有设计 token，§13.2 命名固定）
   │   ├── global.css         （header / footer / 通用工具类）
   │   ├── global.js          （全站通用 JS，IIFE）
   │   └── partials/
   │       ├── header.html
   │       ├── footer.html
   │       ├── inquiry-form-simple.html
   │       └── inquiry-form-custom.html
   ├── pages/<slug>/
   │   ├── index.html
   │   ├── style.css          （仅本页样式，class 前缀 .page-<slug>）
   │   ├── script.js          （仅本页 JS，IIFE）
   │   └── images/
   ├── data/*.json
   ├── sitemap.xml
   ├── robots.txt
   └── theme-meta.json        （§13.6，给转换器读）

         ↓  在 Claude Code / Claude Desktop 内执行斜杠命令
            /convert-to-wp-theme  source=public_html/

coolerfit-theme/              ← FSE Block Theme，ZIP 上传 WP 后台
   ├── style.css              （主题头注释，从 theme-meta.json 生成）
   ├── theme.json             （schema v3，从 tokens.css 自动生成）
   ├── templates/             （front-page.html / page.html / single.html / archive.html / 404.html）
   ├── parts/                 （header.html / footer.html / inquiry-form-simple.html / inquiry-form-custom.html）
   ├── patterns/              （每个 data-pattern → 一个 pattern .php）
   ├── assets/                （tokens.css / global.css / global.js 原样保留并 enqueue）
   ├── functions.php
   └── readme.txt
```

### 13.2 设计 token 暴露约定（让 theme.json 生成零猜测）

Claude Code 必须在 `assets/tokens.css` 内用**以下固定命名**暴露全部 token。转换器会按名字映射到 `theme.json` 的 `settings.color.palette / settings.typography / settings.spacing`。

```css
:root {
  /* Colors — 映射到 settings.color.palette */
  --color-primary: #....;
  --color-primary-foreground: #....;
  --color-bg: #....;
  --color-fg: #....;
  --color-muted: #....;
  --color-muted-foreground: #....;
  --color-accent: #....;
  --color-accent-foreground: #....;
  --color-border: #....;

  /* Fonts — 映射到 settings.typography.fontFamilies */
  --font-display: "...", serif;
  --font-body: "...", sans-serif;

  /* Font sizes — 映射到 settings.typography.fontSizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* Spacing — 映射到 settings.spacing.spacingSizes */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
}
```

**禁止**在 tokens.css 之外用具体颜色/字号字面量；其它 CSS 必须 `var(--...)` 引用。

### 13.3 HTML 结构约定（让 section 干净映射成 pattern）

1. 每个 `pages/<slug>/index.html` 的 `<body>` 内，**所有顶层 section 必须**：
   - 用 `<section>` 元素包裹（不要用 `<div>`）
   - 带 `data-pattern="<pattern-slug>"`，slug 全局唯一（如 `hero-home`、`product-grid-by-type`、`feature-uv-cta`）
   - 带 `data-pattern-category="hero|grid|cta|inquiry|content|testimonial|faq"`（对应 WP pattern 分类）
   - 示例：
     ```html
     <section data-pattern="hero-home" data-pattern-category="hero" class="page-home__hero">
       ...
     </section>
     ```
2. Header / Footer 用：
   ```html
   <header data-part="site-header"> ... </header>
   <footer data-part="site-footer"> ... </footer>
   ```
   转换器据此抽成 `parts/header.html` / `parts/footer.html`。
3. 询盘表单包裹：
   ```html
   <form data-part="inquiry-simple" ...> ... </form>
   <form data-part="inquiry-custom" ...> ... </form>
   ```
   抽成 `parts/inquiry-form-simple.html` / `parts/inquiry-form-custom.html`。
4. **禁止 inline `style=""`**——任何视觉一律走 class。
5. 图片必须：
   ```html
   <img src="..." alt="..." loading="lazy" width="..." height="...">
   ```
   转换器据此生成 `core/image` 块（保留 lazy 与尺寸，避免 CLS）。
6. 链接全部相对路径（`/products/xxx/`），不带域名；转换器会重写为 `<?php echo esc_url( home_url('/products/xxx/') ); ?>`。

### 13.4 JavaScript 行为约定

- **不引入第三方 JS 库**（不用 jQuery、Alpine、React、Vue、GSAP、Swiper 等）。
- 全站通用行为（移动菜单、scroll header、平滑滚动）→ `assets/global.js`。
- 页面专属行为（产品定制器的颜色/材质选择、Logo 上传预览、表单校验）→ `pages/<slug>/script.js`。
- 一律 IIFE：
  ```js
  (function () {
    "use strict";
    // ...
  })();
  ```
- 转换器会把 `assets/global.js` 直接 `wp_enqueue_script` 注册；页面级 script 作为对应 pattern 的局部 enqueue（footer，defer）。

### 13.5 询盘表单的 WordPress 落地

静态版的表单提交目的地，需要在转 WP 时被替换为后台可配置的 endpoint，规格统一约定如下：

1. 表单元素必须带占位符属性：
   ```html
   <form data-part="inquiry-simple"
         action="{{INQUIRY_ENDPOINT}}"
         method="POST"
         data-inquiry-endpoint="{{INQUIRY_ENDPOINT}}">
   ```
2. 静态版构建时，把 `{{INQUIRY_ENDPOINT}}` 替换为第三方表单服务（Formspree / Web3Forms / Getform）的 URL。endpoint 写在 `data/site.json` 的 `inquiry.endpoint` 字段。
3. 转 WP 时，`wp-block-theme-converter` 会把 `{{INQUIRY_ENDPOINT}}` 替换为：
   ```php
   <?php echo esc_url( get_option('coolerfit_inquiry_endpoint') ); ?>
   ```
   并在 `functions.php` 注册一个 Customizer / Settings 字段，让运营在 WP 后台填 endpoint（可以是 Formspree、自建 REST、CRM webhook 等）。
4. 字段 `name` 属性**必须**用 snake_case 固定命名，方便任意后端接入：
   - `contact_name`、`contact_email`、`contact_phone`、`company`、`country`
   - `quantity`、`product_category`、`product_name`
   - `cover_color`、`cover_color_custom_hex`、`cover_material`
   - `dim_width`、`dim_height`、`dim_depth`、`dim_unit`
   - `opening_design`、`logo_file`、`logo_position`
   - `notes`、`page_source`（自动填当前 URL，hidden）

### 13.6 主题身份元数据（让转换器一次性产出）

Claude Code 必须在 `public_html/` 根目录产出 `theme-meta.json`：

```json
{
  "name": "CoolerFit",
  "slug": "coolerfit-theme",
  "author": "CoolerFit",
  "author_uri": "https://aircoolercover.com",
  "description": "Block theme for CoolerFit — manufacturer of custom evaporative cooler covers.",
  "version": "1.0.0",
  "requires_wp": "6.5",
  "tested_up_to": "6.7",
  "requires_php": "8.1",
  "license": "GPL-2.0-or-later",
  "license_uri": "https://www.gnu.org/licenses/gpl-2.0.html",
  "text_domain": "coolerfit",
  "tags": ["block-theme", "full-site-editing", "business", "one-column", "wide-blocks", "block-patterns"],
  "pattern_categories": [
    { "slug": "hero",        "label": "Hero" },
    { "slug": "grid",        "label": "Product / Feature Grid" },
    { "slug": "cta",         "label": "Call to Action" },
    { "slug": "inquiry",     "label": "Inquiry Form" },
    { "slug": "content",     "label": "Content Section" },
    { "slug": "testimonial", "label": "Testimonial" },
    { "slug": "faq",         "label": "FAQ" }
  ]
}
```

转换器读这个文件直接生成 `style.css` 头注释、`readme.txt`、`functions.php` 里的 pattern 分类注册——无需任何后续交互。

### 13.7 转换执行清单（用户操作）

静态站完成后，把 `public_html/` 交给 Claude（已安装 wp-block-theme-converter Skill），执行：

```
/convert-to-wp-theme source=public_html/
```

转换器会：
1. 读 `theme-meta.json` → 生成 `style.css` 头 + `readme.txt`
2. 读 `assets/tokens.css` → 生成 `theme.json` schema v3
3. 扫描 `pages/<slug>/index.html` 的 `<header data-part>` / `<footer data-part>` → 抽成 `parts/`
4. 扫描每个 `<section data-pattern>` → 生成对应 `patterns/<slug>.php`
5. 把每个 `pages/<slug>/index.html` 的剩余主体 → 生成 `templates/page-<slug>.html`（或 single/archive 模板）
6. 把 `<form data-part="inquiry-*">` → 抽成 `parts/inquiry-form-*.html` + 在 `functions.php` 注册 endpoint Setting
7. `assets/global.css` + `assets/global.js` → 通过 `wp_enqueue_style/script` 注册
8. 输出 `coolerfit-theme/` 目录，可直接 `zip -r coolerfit-theme.zip coolerfit-theme/` 上传 WP 后台

---

_v2 修订：新增 §13 WordPress 输出对齐 · 2026-05-29_
