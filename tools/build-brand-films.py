"""Integrate the on-demand supplied films without changing product specifications."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
COPY = {
    'ko': ('형태와 빛으로 만나는 에스티브.', '영상 보기', 'Aestyve 브랜드 필름'),
    'en': ('Aestyve, in form and light.', 'Watch films', 'Aestyve brand film'),
    'zh': ('以形态与光影，感受艾薇。', '观看影像', 'Aestyve 品牌影像'),
}

def integrate():
    for lang, (title, action, alt) in COPY.items():
        prefix = '' if lang == 'ko' else '../'
        for name in ['index.html', 'product-ha.html']:
            path = ROOT / (name if lang == 'ko' else f'{lang}/{name}')
            page = path.read_text()
            page = re.sub(r'\n?<!-- BRAND FILMS START -->.*?<!-- BRAND FILMS END -->\n?', '\n', page, flags=re.S)
            block = f'''\n<!-- BRAND FILMS START -->
<section class="ae-films-entry" aria-label="Aestyve Motion Gallery"><img src="{prefix}assets/brand-films/brand.webp" alt="{alt}" width="100" height="72" loading="lazy" decoding="async"><div><small>AESTYVE / MOTION GALLERY</small><p>{title}</p></div><a href="{prefix}assets/brand-films/brand.mp4" data-ae-films aria-haspopup="dialog"><span aria-hidden="true">▷</span>{action}</a></section>
<!-- BRAND FILMS END -->\n'''
            start = page.index('<section class="ae-showroom"' if name == 'index.html' else '<section class="ha-intro"')
            end = page.index('</section>', start) + len('</section>')
            page = page[:end] + block + page[end:]
            if 'assets/brand-films.css' not in page:
                page = page.replace('</head>', f'<link rel="stylesheet" href="{prefix}assets/brand-films.css?v=20260918b">\n</head>', 1)
            if 'assets/brand-films.js' not in page:
                page = page.replace('</body>', f'<script type="module" src="{prefix}assets/brand-films.js?v=20260918a"></script>\n</body>', 1)
            page = page.replace('href="https://aestyve-face-lab.vercel.app/"', 'href="/facelab/"')
            path.write_text(page)
            print('Integrated', path.relative_to(ROOT))

if __name__ == '__main__':
    integrate()
