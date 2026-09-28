# Aestyve 3D Face Lab — development preview

Static, browser-local 3D surface exploration. **Not a diagnostic product or a clinically validated treatment simulator. Do not launch to patients yet.** Only the simulator module is changed; the brand website is not modified.

## Implemented

- Genuine x/y/z vertex geometry: WebGL renderer plus Canvas software-3D fallback. Both rotate/project a nonplanar mesh and deform vertices, rather than CSS-rotating a photograph.
- Clearly labelled procedural demo face: 2,537 vertices / 4,872 triangles.
- Consent-gated local photo decoding; pinned MediaPipe Face Landmarker integration (`@mediapipe/tasks-vision@0.10.21`, model bundle version 1). Exactly one face is required. The first 468 landmarks become a textured, triangulated **estimated front surface**. This is not a complete physical 3D scan.
- Rotation/zoom, keyboard access, wireframe/clay view, actual supplied gel-reference photographs, mouse/touch drag-and-drop, and up to eight visual shape-control points.
- Arbitrary 0–100 visualization intensity, original/simulation comparison, actual A/B/C snapshots and state recall, and watermarked comparison PNG export.
- Basic capture-quality heuristics and relative red-channel/luminance maps from selected patches of the **original photo**. Bad basic capture checks disable maps. These are image-color observations, not skin-health tests.
- Self-reported concerns, a limited safety question, source-linked general non-surgical treatment information, a no-procedure/basic-care alternative, and photo-free JSON discussion notes. Topic cards depend on selected concerns, never a photo score. Yes/unknown safety responses withhold procedure cards; a no response does not establish suitability or safety.
- Korean, English and Simplified Chinese. S-Core Dream CSS references with system fallbacks; no font binaries are distributed.

## Deliberate limits

No diagnosis, treatment-need ranking, prescription, injection-location/depth guidance, mL recommendation, aging prediction, skin age, moisture/oil/elasticity/collagen measurement, pore grade, melasma diagnosis, or predicted laser/booster/filler outcome. **There is no validated mL-to-face-shape model.**

Alpha/Beta/Gamma are labels only. They use identical generic deformation mathematics; no product-specific effect is invented. GEL 01/02/03 are the supplied images in attachment order (filenames end in 233046, 233140, 233213). Their mapping to product names remains unconfirmed. Gel appearance does not establish molecular weight or clinical performance.

Single-photo depth is estimated; the model does not reconstruct hidden anatomy or the back of the head. The software renderer can be slower/lower fidelity than GPU rendering. Lighting, filters, makeup, compression and skin tone affect color observations. Passing capture heuristics is not clinical confidence. Do not compare color maps across people or capture dates.

## Run

From the repository root:

```sh
python3 -m http.server 8080
# Open http://localhost:8080/simulator/
node --test simulator/tests/core.test.mjs
```

For a separate static host/subdomain, publish `simulator/` as the site root. No domain purchase, DNS change, production merge or public patient launch was performed. Use authenticated staging; `noindex` is not access control. Automatic photo landmark estimation requires the external SDK/WASM/model to download successfully.

## Privacy and dependencies

No analytics, cookies, localStorage, IndexedDB, photo upload, face-identity matching or server-side analysis are implemented. Photos, decoded canvases, answers and snapshots remain in page memory; replacement/erase/pagehide clears references and image canvases and replaces the GPU texture. This is not forensic memory erasure. Explicitly downloaded files remain on the user's device. SDK/model/font downloads disclose ordinary network metadata to their CDN providers. Audit and self-host dependencies before production use with patient photos.

The model is loaded only after explicit adult/own-photo consent and photo selection. No user image is included in SDK/model requests. This implementation is not a substitute for a jurisdiction-specific privacy notice and lawful consent process.

## Verification and remaining blockers

Development checks completed:

- 13 Node unit tests passed: nonplanar geometry, topology, bounded/no-op deformation, no fabricated product differences, triangulation, invalid input rejection, masks, safety gates, topic logic, localization and absence of persistent face storage/POST logic.
- 28 Chromium browser checks passed against a standalone bundle: CSP boot, software 3D rotation/deformation, exact original restoration, A/B/C recall, keyboard/wireframe, consent/file validation, safety gating, languages, export contents, erase, mobile overflow and touch rotation. OS download navigation was not verified; generated export contents were inspected.
- 7 integration checks passed using **synthetic landmark fixtures**, not an actual detector: zero/multiple-face rejection, 468-vertex photo-surface construction, capture check, red/luminance maps and clearing.

**Not verified here:** real MediaPipe inference on real people, GPU WebGL/shader execution, device performance, Safari/iOS, clinical accuracy or performance across skin tones. The environment blocks external model loading and cannot create a WebGL context; the explicit error path and software fallback were tested. Synthetic fixtures do not validate detection or clinical performance.

Before patient launch: test real consented photos and target devices; verify GPU and fallback paths, model availability, lifecycle deletion and export watermarks; obtain clinician review of all language versions; evaluate capture/skin-tone performance; establish intended use and regulatory/privacy/advertising review; confirm product mapping and manufacturer evidence; deploy HTTPS/authenticated staging with audited dependencies and HTTP security headers. A disclaimer alone does not settle product classification. Actual skin measurements or individualized treatment recommendations require an appropriately validated model and clinical/regulatory support, not relabelled color heuristics.

## General-information references

- Google web guide: https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js
- Google normalized landmarks: https://developers.google.com/edge/api/mediapipe/js/tasks-vision.normalizedlandmark
- AAD dry skin: https://www.aad.org/public/everyday-care/skin-care-basics/dry/dermatologists-tips-relieve-dry-skin
- AAD redness/light treatment: https://www.aad.org/public/diseases/rosacea/treatment/lasers-lights
- AAD melasma: https://www.aad.org/public/diseases/a-z/melasma-treatment
- FDA microneedling: https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/microneedling-devices
- FDA product-specific example: https://www.fda.gov/medical-devices/recently-approved-devices/skinvive-juvederm-p110033s059

These sources are general information, not Aestyve efficacy evidence or Korean authorization of any product or this software.
