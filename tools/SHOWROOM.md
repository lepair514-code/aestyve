# Aestyve collection showroom

The homepage in Korean, English and Chinese shares `aestyve-showroom.css` and `aestyve-showroom.js`. The rest of the site keeps its existing content, navigation and CMS identifiers. `future-glass.css` restores Aestyve navy (#27293d), apricot (#d8956f) and cream, and allows photographic frames to follow intrinsic image proportions.

## Source material

- The supplied Verve screen recording guides the immersive first viewport and continuous product movement.
- Uploaded Aestyve Alpha, Beta and Gamma 360-degree MOVs and product motion references guide the carton shape, turn and studio lighting. Four selected supplied films are now available on demand in Motion Gallery; see BRAND_FILMS.md.
- The three original AESTYVE EP. carton PDFs supply all six label faces. The preview art on page 1 is rendered without redrawing or replacing brand typography; fold guides are excluded. The physical proportions are 72 × 190 × 28 mm.
- The supplied Chinese banner and existing HA product specification supply cross-linked HA 24 mg/mL, lidocaine HCl 3 mg/mL (0.3%), phosphate-buffered saline q.s. and syringe volume 1.1 mL. The scene adds no efficacy claims.
- The supplied translucent/glass design references guide the layered ingredient panels. Product art retains its original colors.

## Interaction and rendering

Horizontal pointer drag rotates the six-sided cartons, changes their orbital arrangement, and reveals the three ingredient panels. Release eases into the nearest selection. Previous/next buttons, product buttons and arrow keys provide equivalent access; vertical touch scrolling is preserved. The formula can be independently opened and closed. Scene animation stops offscreen and in a background tab, and respects reduced motion.

Three.js provides the lit WebGL scene. A six-face CSS 3D scene is present from the first paint and remains fully interactive when WebGL is unavailable, texture loading fails or the graphics context is lost. All artwork and runtime files are served locally; no CDN is required.

The carton print uses sRGB textures and tone-mapping-independent basic materials,
with neutral shading on the side faces. This preserves the uploaded pink/coral,
violet and red label colors instead of bleaching them with studio reflections.
The supplied texture files are unchanged. Physical environment reflections remain
on the decorative glass, and the CSS fallback no longer overlays a white glare
gradient across the printed faces.

The five homepage solution cards share a single horizontal carousel with equal
dimensions. `product-carousel.css` and `product-carousel.js` provide mouse drag,
native touch swiping, arrow buttons, keyboard access and a visible item count.
The Korean, English and Chinese brand pages reuse those same assets, product
photos, ordering, card dimensions and localized carousel controls. Existing
brand-page CMS identifiers and localized product-detail links are retained.
Each glass card tilts by up to 2.5° toward the mouse, with a subtle moving
edge highlight. Dragging and reduced-motion preferences disable the tilt.
The Innofill card uses the existing correctly encoded `innofill-family.png`.
The RVSC photo window excludes the original transparent top margin and extra
backdrop while preserving the box and both vials. Original image bytes and
proportions are unchanged.

To rebuild the WebGL module, install `three@0.186.0` and `esbuild@0.25.12` in an isolated tooling directory and invoke `tools/build-showroom.mjs` with `AESTYVE_TOOLING` pointing to it. The compiled module is committed because this is a static site. See `assets/vendor/THREE-LICENSE.txt` for the Three.js license.

## Verification

The product carousel was checked in the protected preview at desktop width and
390/320 px iframe widths. All five cards have identical dimensions and aligned
top edges; all images load. Desktop next/previous controls, mouse drag, click
suppression after dragging, keyboard Home/End and the visible item count work.
Cursor movement updates the card tilt within the 2.5° limit. Korean, English and
Chinese mobile layouts have no horizontal document overflow. The temporary
responsive-review page was removed after verification.

The protected Vercel preview was checked at desktop width and 390/320 px iframe widths in Korean, English and Chinese. Drag changes the active product and reveals all three formula panels. Direct product buttons, previous/next buttons, the formula toggle and arrow-key navigation are verified. Mobile content has no horizontal overflow. Page asset references and the two source JavaScript modules pass static checks.

The verification browser disables WebGL, so visual and interaction checks ran against the fully volumetric CSS 3D fallback. The WebGL module is bundled successfully; GPU-specific lighting must also be reviewed on a WebGL-enabled device before production promotion.
