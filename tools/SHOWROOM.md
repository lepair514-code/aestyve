# Aestyve collection showroom

The homepage in Korean, English and Chinese shares `aestyve-showroom.css` and `aestyve-showroom.js`. The rest of the site keeps its existing content, navigation and CMS identifiers. `future-glass.css` restores Aestyve navy (#27293d), apricot (#d8956f) and cream, and allows photographic frames to follow intrinsic image proportions.

## Source material

- The supplied Verve screen recording guides the immersive first viewport and continuous product movement.
- Uploaded Aestyve Alpha, Beta and Gamma 360-degree MOVs and product motion references guide the carton shape, turn and studio lighting. They are references, not embedded videos.
- The three original AESTYVE EP. carton PDFs supply all six label faces. The preview art on page 1 is rendered without redrawing or replacing brand typography; fold guides are excluded. The physical proportions are 72 × 190 × 28 mm.
- The supplied Chinese banner and existing HA product specification supply cross-linked HA 24 mg/mL, lidocaine HCl 3 mg/mL (0.3%), phosphate-buffered saline q.s. and syringe volume 1.1 mL. The scene adds no efficacy claims.
- The supplied translucent/glass design references guide the layered ingredient panels. Product art retains its original colors.

## Interaction and rendering

Horizontal pointer drag rotates the six-sided cartons, changes their orbital arrangement, and reveals the three ingredient panels. Release eases into the nearest selection. Previous/next buttons, product buttons and arrow keys provide equivalent access; vertical touch scrolling is preserved. The formula can be independently opened and closed. Scene animation stops offscreen and in a background tab, and respects reduced motion.

Three.js provides the lit WebGL scene. A six-face CSS 3D scene is present from the first paint and remains fully interactive when WebGL is unavailable, texture loading fails or the graphics context is lost. All artwork and runtime files are served locally; no CDN is required.

To rebuild the WebGL module, install `three@0.186.0` and `esbuild@0.25.12` in an isolated tooling directory and invoke `tools/build-showroom.mjs` with `AESTYVE_TOOLING` pointing to it. The compiled module is committed because this is a static site. See `assets/vendor/THREE-LICENSE.txt` for the Three.js license.
