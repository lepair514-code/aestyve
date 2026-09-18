#!/usr/bin/env python3
"""Apply the shared presentation layer without serializing/reformatting page content."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
VERSION = '20260918'

def stage(prefix):
    images = ''.join(f'<img src="{prefix}assets/ha_{name}_pack.webp" alt="Aestyve Ep. {name.title()}" width="622" height="1400">' for name in ('alpha', 'beta', 'gamma'))
    return '<div class="ae-collection-stage"><span class="ae-stage-label">AESTYVE / HA COLLECTION</span><span class="ae-orb" aria-hidden="true"></span><span class="ae-orb small" aria-hidden="true"></span>'+images+'<span class="ae-stage-lineup">ALPHA &nbsp; / &nbsp; BETA &nbsp; / &nbsp; GAMMA</span></div>'

for folder in ('', 'en', 'zh'):
    prefix = '../' if folder else ''
    for path in sorted((ROOT / folder).glob('*.html')):
        # Standalone archived exports retain their original presentation.
        if path.name.startswith('aestyve-revibe-pn-') or path.name in ('404.html', 'revibe-pn.html'):
            continue
        s = path.read_text()
        if folder and path.name == 'product-plla.html':
            s = s.replace('src="assets/', 'src="../assets/').replace('href="assets/', 'href="../assets/')
        if path.name in ('product-plla.html', 'product-innofill.html') and 'future-glass.js' not in s:
            s = s.replace('</body>', f'<script src="{prefix}assets/future-glass.js?v={VERSION}" defer></script>\n</body>')
        path.write_text(s)
        page = path.stem.removeprefix('product-')
        if 'data-ae-page=' in s:
            continue
        s = s.replace('<body>', f'<body class="ae-future" data-ae-page="{page}">', 1)
        s = s.replace('</head>', f'<link rel="stylesheet" href="{prefix}assets/future-glass.css?v={VERSION}">\n</head>', 1)
        if page == 'ha':
            s = re.sub(r'<figure class="hero-visual">.*?</figure>', '<figure class="hero-visual">'+stage(prefix)+'</figure>', s, count=1, flags=re.S)
            for name in ('alpha', 'beta', 'gamma'):
                s = s.replace(f'assets/ha-renewal/{name}-pack.jpg', f'assets/ha_{name}_pack.webp')
                s = s.replace(f'assets/ha-renewal/{name}-syringe.jpg', f'assets/ha_{name}_syringe.webp')
        if page == 'index':
            s = re.sub(r'(<div class="hero-right">)\s*<img[^>]*>', lambda m:m[1]+stage(prefix), s, count=1)
        path.write_text(s)
        print(path.relative_to(ROOT))
