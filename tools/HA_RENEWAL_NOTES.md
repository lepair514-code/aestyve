# Aestyve HA detail renewal

Paths: `/product-ha.html`, `/en/product-ha.html`, `/zh/product-ha.html`.
Shared CSS and behavior: `assets/ha-renewal.css`, `assets/ha-renewal.js`.
Generate all three pages and their CMS entries with `python tools/build-ha-pages.py`.
The generator preserves all other pages' CMS entries. Subsequent CMS edits are
not copied back into the generator; review CMS changes before regenerating.

## Source mapping

The company supplied `Replengen HA Filler_Brochure_EN.pdf` and explicitly
confirmed the display mapping Replengen → Aestyve; Light → Alpha;
Mid → Beta; Pro → Gamma. The source remains Reanzen R&D.

- G′: Alpha 60–120 Pa; Beta 150–210 Pa; Gamma 260–300 Pa.
- Mean extrusion force: Beta, 27G, 13.62 N.
- Cohesiveness test length: Alpha 2.4 cm; Beta 2.1 cm; Gamma 2.0 cm.
- NSP: 1 L block-shaped tray, 25°C, approximately 20 hours.
- Purification: two stages over two weeks. MGT: uniform gel processing.
- HA: 24 mg/mL. Lidocaine: 3 mg/mL (0.3%).
- Volume and accessories follow the supplied Aestyve package photos:
  1.1 mL; Alpha 30G × 2; Beta 27G × 1 + 25G cannula × 1;
  Gamma 25G × 1 + 23G cannula × 1.

G′ test frequency and temperature are not specified in the supplied brochure.
No simulated extrusion curve or human duration claim has been authored.
Endotoxin data with inconsistent units and conflicting shelf-life/storage
values have not been published as established Aestyve specifications.
Original user-provided photos and logos are copied without generative changes.

## Deployment

The repository README describes GitHub Pages, but the latest existing commit
has failing Vercel statuses for projects `aestyve` and `aestyve-admin`, linking
to Vercel's account-deployment-blocked guidance. Do not reconfigure the domain
or bypass provider account restrictions. Recheck statuses after publishing.
