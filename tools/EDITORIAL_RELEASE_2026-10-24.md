# Multilingual editorial release - 2026-10-24 KST

## Scope
Customer-facing copy throughout Korean, English and Chinese pages, active CMS data, HA collection downloads and the buyer product overview.

- Remove conversation titles, worksheet references, production explanations and marketing-planning terminology. Rewrite shared product, quality and enquiry sections for clinicians and distribution partners.
- Preserve product quantities, existing test values, source attributions and study limitations. This release is an editorial correction, not new clinical validation or authorization.
- Preserve the HA catalog's original images, graphs and design. Correct the Korean processing and purification notes. Add English and Chinese editions using the same source figures and specifications.
- Replace the malformed legacy English HA PDF with the valid current English edition. Add Korean and Chinese buyer overviews and update the English overview, with direct product links.
- Language pages now download their corresponding language PDF. Version changed download URLs.
- Redirect the old Revibe pages to the current detail page in each language, including the legacy aestyve-revibe-pn-EN and -ZH addresses. Keep HTML fallback redirects.
- Update the active HA source generator to retain corrected copy and language-specific download paths. Do not run the superseded build-ha-pages.py.

## Validation
- Parse all public HTML and CMS JSON; check local asset and download targets, editorial remnants and PDF readability.
- Confirm core HA quantities and supplied accessories across all three catalogs. Render and visually inspect catalog pages and buyer overviews.
- Browser inspection of 24 key language/page combinations at 390px: no horizontal overflow; language-specific PDF URLs present; flagged editorial phrases absent. HA product selection changes Alpha to Beta.
- The enquiry flow continues to open an email draft. No enquiry was submitted.
- Check GitHub-linked deployment status and live page/PDF contents after release. Direct Vercel API access currently returns 403 for the existing connection's team scope; no access settings changed.
