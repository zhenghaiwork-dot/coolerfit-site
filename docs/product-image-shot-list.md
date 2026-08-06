# Product image shot list

**Format:** 1200×1200 px WebP (1:1), target 80–150 KB per file.  
**Upload path:** `public/images/products/{slug}/`  
**URL in site:** `/images/products/{slug}/{filename}`

Standard set (most SKUs): `01-main` → `04-install`.  
`standard-down-draft-cover` also needs `05-flat.webp`.

---

## Global shooting notes

| Item | Guidance |
|------|----------|
| Background | Neutral gray or outdoor context; avoid busy clutter |
| Lighting | Soft daylight or two-point studio; no harsh shadows on fabric |
| Hero (01) | Portable wheeled evaporative air cooler on ground, casters visible, mid-large box cabinet | **Not** wall-mount or fixed rooftop |
| Detail (02) | Macro: seams, coating, stitching, insulation layer |
| Feature (03) | Straps, vents, grommets, logo area, drainage — product-specific |
| Install (04) | Cover secured on real unit; show fit at hem/straps |
| Flat (05) | Optional flat lay on clean surface with subtle dimension cue |

---

## 1. `standard-side-draft-cover`

| File | Shot | Alt text (in data) |
|------|------|-------------------|
| `01-main.webp` | Wall-mounted side-draft unit, cover on, residential exterior | Front view on wall unit |
| `02-detail.webp` | 600D fabric weave + sealed seam macro | Fabric and seam detail |
| `03-feature.webp` | Elastic hem + air vent openings | Hem and vents |
| `04-install.webp` | Side view, straps/hem secured | Secured on wall unit |

---

## 2. `standard-down-draft-cover` (5 images)

| File | Shot | Notes |
|------|------|-------|
| `01-main.webp` | Rooftop down-draft, 3/4 angle from ground or ladder-safe POV | Hero |
| `02-detail.webp` | Reinforced top panel + drainage channel | Macro |
| `03-feature.webp` | Buckle straps and tie-down points | Wind security |
| `04-install.webp` | Full install on rooftop unit | Show scale |
| `05-flat.webp` | Cover laid flat, shape visible | For size reference |

---

## 3. `heavy-duty-industrial-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Large commercial/industrial cooler, full cover |
| `02-detail.webp` | 900D canvas, double stitch, TPU lamination |
| `03-feature.webp` | Heavy buckle straps + reinforced corners |
| `04-install.webp` | Warehouse or plant rooftop context |

---

## 4. `waterproof-premium-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Cover on unit; wet pavement or light rain context OK |
| `02-detail.webp` | Sealed seam + PVC backing edge |
| `03-feature.webp` | Drainage grommet + drawstring hem |
| `04-install.webp` | Fitted cover, water beading on fabric (if safe to stage) |

---

## 5. `uv-shield-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Silver/white cover on sun-exposed rooftop |
| `02-detail.webp` | Reflective UV coating close-up |
| `03-feature.webp` | Fabric in direct sun, minimal glare blowout |
| `04-install.webp` | Installed on rooftop cooler, open sky |

---

## 6. `winter-insulated-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Insulated cover on unit, winter/snow context (or neutral cold tone) |
| `02-detail.webp` | Foam core / thermal lining cross-section or edge |
| `03-feature.webp` | Tight-seal zipper or closure |
| `04-install.webp` | Off-season install, snow on ground optional |

---

## 7. `mesh-breathable-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Mesh panel visible on cooler, in-season |
| `02-detail.webp` | 1mm mesh aperture macro |
| `03-feature.webp` | Elastic hem, lightweight edge binding |
| `04-install.webp` | Mesh cover on operating or idle unit |

---

## 8. `window-unit-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Window-frame install, exterior or interior POV |
| `02-detail.webp` | Insulating layer / 420D fabric |
| `03-feature.webp` | Adjustable straps on frame |
| `04-install.webp` | Cover on without removing unit |

---

## 9. `round-cylinder-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Circular cover on round/cylindrical unit |
| `02-detail.webp` | Circular cut + elastic hem |
| `03-feature.webp` | Top drainage design |
| `04-install.webp` | Snug fit on cylinder, top-down or 3/4 |

---

## 10. `xl-commercial-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Oversized unit (hotel/warehouse scale) |
| `02-detail.webp` | Reinforced stress points, wide panel seams |
| `03-feature.webp` | Heavy fasteners, multi-strap system |
| `04-install.webp` | Wide rooftop, show coverage span |

---

## 11. `custom-logo-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Finished cover with sample HVAC contractor logo |
| `02-detail.webp` | Embroidery or heat-transfer logo macro |
| `03-feature.webp` | Custom color fabric + logo placement |
| `04-install.webp` | 2–3 branded covers (fleet / bulk visual) |

Use placeholder logo “ACME HVAC” or client-provided art; replace before launch if needed.

---

## 12. `small-batch-prototype-cover`

| File | Shot |
|------|------|
| `01-main.webp` | Prototype on table with dimension tag |
| `02-detail.webp` | Pattern layout / first stitch on sample |
| `03-feature.webp` | Custom pipe cutout or unique feature |
| `04-install.webp` | Test-fit on non-standard cooler |

---

## After upload

1. Drop files into `public/images/products/{slug}/` matching filenames above.
2. Run `npm run dev` and open `/product/{slug}` — placeholders disappear when files load.
3. Re-run `npm run build:static` before deploy so prerender includes real images.

Optional: export card thumbnails at 800×800 with same filenames (browser scales down); separate `-card.webp` files are not required.
