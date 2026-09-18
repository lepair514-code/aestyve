# Supplied brand and product films

Motion Gallery adds one restrained entry below the existing homepage showroom
and HA detail hero, in Korean, English and Chinese. It contains the supplied
logo film and one supplied rotating-carton film per product. It does not replace
the accurate six-face carton artwork or introduce product/clinical claims.

`brand-film-sources.json` records original filenames, source SHA-256 hashes,
web-video hashes and media properties. Originals are unchanged. Web copies use
H.264, yuv420p, 960px width, CRF 23, fast-start MP4 and no audio. The four videos
total about 1.12 MB; only the selected film is requested, after activation.
Posters are extracted frames, not generated product artwork. Motion films are
identified as brand creative, with a link to package photos and specifications.

## Interaction

- No intro takeover, automatic playback on page load, or background video.
- The native modal dialog traps focus. Escape, the close button and backdrop
  close it, stop media, clear its source and restore the activating link's focus.
- Native video controls offer play/pause, seeking and fullscreen where supported.
- Four real buttons switch films. The active choice has `aria-pressed` state.
- A load failure shows an accessible status and direct video-file link.
- Switching tabs pauses playback. Reduced motion/transparency are respected.
- Without JavaScript or native dialog support, the entry links to the MP4.
- Face Studio entry links use `/facelab/`, the existing branded proxy route.
  The proxy, simulator implementation and access protections are unchanged.

## Rebuild

Run `python3 tools/build-brand-films.py` to integrate the shared strip and assets.
The Face Studio generator also calls this integration, so rebuilding HA pages
keeps the film entry after the hero. Run this integrator after any other legacy
homepage generator. Styles and behavior are `assets/brand-films.css` and `.js`.

## Verification

This change builds on main 137037e. Existing rotating carton selection and all
three floating composition cards were directly verified on the live page.
The review browser uses the CSS 3D fallback; GPU/WebGL rendering is not verified
by that environment.

Verified on the public production URL, 2026-09-18:
- All six changed pages pass local asset, duplicate-ID, film-entry and branded
  Face Studio link checks. Original HTML content/attributes match the previous
  release after excluding the intended new strip/resources and URL replacement.
- Four full MP4s decode without errors; browser playback reaches 5 seconds for
  Brand and 2 seconds each for Alpha/Beta/Gamma, readyState 4, no media errors.
- The closed dialog has no video source before first activation. Escape clears
  the source, pauses playback, removes the scroll lock and restores entry focus.
- English HA and Chinese home display localized dialog controls and source notes;
  selection and close buttons work. Korean desktop and 320px/390px iframe
  layouts were visually inspected. This is viewport testing, not physical
  iPhone/Android device testing.
- A narrow-screen flex layout squeezed the entry copy at 320px. Replaced it with
  two columns and a separate button row; rechecked Korean home 390px, Korean HA
  320px and English home 320px. The film dialog fits 320px and 390px screens.
- The existing /facelab/ route returns HTTP 200. No simulator behavior or clinical
  accuracy is claimed by this brand-site release.
- Vercel reports successful builds for the brand site and its linked admin project.
  Protected preview UI access was unavailable (expired browser login and share
  API 403), so UI checks used the authorized public production deployment.
  Protection settings were not changed. The noindex responsive review fixture
  was removed after verification.

