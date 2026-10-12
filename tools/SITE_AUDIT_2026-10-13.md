# Website contact update and audit — 2026-10-13 KST

Base: `38770320e489ec603d75248912d50e26b6f099cd` on `main`.
Review branch: `review/contact-email-audit-20261013`.

## Changes

- Standardize the representative email to **info@aestyve.com** in all 45 public HTML pages containing contact details, the three language CMS JSON files, and all three inquiry scripts.
- Update both the displayed email and mailto annotation in `assets/Aestyve_Buyer_Overview_EN.pdf`. Preserve all other extracted text, product links and page layout. The HA Collection PDF already contains the correct email.
- Version the changed script and buyer PDF URLs so visitors do not reuse old recipients from cached assets.
- Add missing Revibe meta descriptions in Korean, English and Chinese.
- Add canonical URLs to INNOFILL and its older PLLA aliases in all three languages; point the sitemap at the current INNOFILL pages. Keep old URLs accessible.

## Verification

- Inspect 48 public HTML documents, including all 39 sitemap pages. Check referenced local files and in-page targets, duplicate IDs and image alt attribute presence. The six Face Lab links use the existing Vercel proxy route rather than local files.
- All sitemap pages have descriptions and canonical URLs matching their sitemap entries after this change.
- Parse all three CMS JSON files; check syntax of the three changed JavaScript files with Node.
- No previous representative address remains in the current HTML, JavaScript, JSON or source generators. Historical git commits are intentionally unchanged.
- Extract and render the updated buyer PDF. Other text is unchanged; pixel differences are confined to the contact line. Verify the new mailto annotation and preserve product link annotations.
- Inspect the live Korean homepage and buyer enquiry flow before release. It currently opens a mail draft; it does not submit a server-side enquiry. Do not send a real enquiry during verification.
- Check the GitHub-linked deployment and public website after release. Direct Vercel API inspection is unavailable with the current connector scope (403); do not change access protection to work around that restriction.

## Recommended follow-up, in priority order

1. **Mobile image delivery.** Revibe process photos are approximately 9.19 MB, 2.64 MB and 2.59 MB each. INNOFILL illustrations are about 1.76–2.36 MB each, and several load eagerly. Generate web-sized AVIF/WebP variants, add responsive sources and dimensions, and defer below-fold images. Measure real mobile loading before and after; these file sizes alone are not a measured Core Web Vitals score.
2. **Reliable enquiry receipt.** The current form only opens the visitor's email application. Add an authenticated server-side mail delivery integration with validation, abuse prevention and an explicit successful-delivery state if direct website submission is desired. A destination change does not verify that the mailbox is provisioned or that mail is delivered.
3. **Legacy download cleanup.** `assets/ha-renewal/Aestyve_HA_Filler_Scientific_Catalog_EN.pdf` fails local PDF parsing (missing trailer/xref). No current public HTML or generator references it. Replace it from the original source before exposing it again; the active buyer PDF is valid.
4. **Maintenance documentation.** The older README still describes GitHub Pages and an earlier asset structure. Consolidate current Vercel hosting, content editing and release instructions to prevent outdated operational guidance.

## Scope limits

This is a contact and website integrity audit, not a clinical or accuracy validation of Face Lab. No simulator behavior, clinical claims, source citations, DNS, credentials or access-protection settings were changed. Responsive CSS was reviewed; a new physical-device/mobile browser performance test was not performed in this audit.
