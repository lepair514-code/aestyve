"""Add the shared Face Studio entry to the three home and HA detail pages.

The supplied artwork and product textures are unchanged. Face Studio deliberately
opens as a standalone workspace: its existing CSP prohibits iframe embedding.
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://aestyve-face-lab.vercel.app/'
COPY = {
 'ko': dict(title='정밀한 과학을,<br><em>나만의 밸런스로.</em>',intro='얼굴을 돌려 보고, 가상의 변화를 비교해 보세요.<br>에스티브의 미학을 직접 탐색하는 새로운 공간.',cta='나만의 밸런스 살펴보기',caption='가상 형태를 탐색하는 체험입니다. 실제 시술 결과를 예측하지 않습니다.',steps=['사진 준비','형태 탐색','나란히 비교'],balance='나만의 관점',balance_p='입체적으로 바라보다',compare='변화를 나란히',compare_p='편집 전과 후를 비교하다',hint='드래그하거나 제품을 선택해 보세요',scene='드래그하거나 방향키로 Alpha, Beta, Gamma 컬렉션 탐색',detail_title='컬렉션에서,<br><em>나만의 관점으로.</em>',detail_intro='제품을 살펴봤다면, 이제 Face Studio에서 가상의 형태와 밸런스를 탐색해 보세요.',detail_cta='Face Studio에서 체험하기',new='새 창에서 열기',image='업로드된 반투명 얼굴 디자인'),
 'en': dict(title='Precision in science.<br><em>Your perspective.</em>',intro='Turn your face. Explore virtual changes. Compare views.<br>A new space to experience the aesthetics of Aestyve.',cta='Explore your balance',caption='A virtual form exploration, not a prediction of treatment results.',steps=['Prepare a photo','Explore form','Compare views'],balance='Your perspective',balance_p='See form in dimension',compare='Side by side',compare_p='Compare before and after editing',hint='Drag or select a product to explore',scene='Drag or use arrow keys to explore Alpha, Beta and Gamma',detail_title='From the collection<br><em>to your perspective.</em>',detail_intro='Explore virtual form and balance in Face Studio after discovering the collection.',detail_cta='Explore Face Studio',new='Opens in a new tab',image='Supplied translucent face artwork'),
 'zh': dict(title='精准科学，<br><em>探索自己的平衡。</em>',intro='转动面部，探索虚拟变化，并排比较。<br>以全新视角，体验艾薇美学。',cta='探索我的平衡',caption='虚拟形态探索体验，不用于预测实际治疗结果。',steps=['准备照片','探索形态','并排比较'],balance='自己的视角',balance_p='立体感受面部形态',compare='并排看变化',compare_p='比较编辑前与编辑后',hint='拖动或选择产品，探索系列',scene='拖动或使用方向键探索 Alpha、Beta、Gamma 系列',detail_title='从产品系列，<br><em>到自己的视角。</em>',detail_intro='了解产品系列后，在 Face Studio 中探索虚拟形态与平衡。',detail_cta='进入 Face Studio 体验',new='在新标签页中打开',image='提供的半透明面部设计图')
}

def launch(c,detail=False):
 return f'<a class="fs-launch" href="{URL}" target="_blank" rel="noopener" aria-label="{c["detail_cta" if detail else "cta"]} · {c["new"]}">{c["detail_cta" if detail else "cta"]}<span aria-hidden="true">↗</span></a>'

def section(lang,rel,detail=False):
 c=COPY[lang]
 copy=f'<div class="fs-copy"><span class="fs-kicker">AESTYVE FACE STUDIO</span><h2 id="fs-title">{c["detail_title" if detail else "title"]}</h2><p>{c["detail_intro" if detail else "intro"]}</p>{launch(c,detail)}<p class="fs-caption">{c["caption"]}</p>'
 image=f'<img src="{rel}assets/face-studio/translucent-face.jpg" alt="{c["image"]}" width="1600" height="1600" loading="lazy" decoding="async" draggable="false">'
 if detail:
  return f'<section class="ae-face-studio fs-detail" id="face-studio" aria-labelledby="fs-title"><div class="fs-wrap"><div class="fs-detail-art">{image}</div>{copy}</div></div></section>'
 steps=''.join(f'<li><b>0{i+1}</b>{s}</li>' for i,s in enumerate(c['steps']))
 packs=''.join(f'<img src="{rel}assets/ha-3d/{n}-front.webp" alt="Aestyve Ep. {n.title()}" data-fs-pack="{i}" width="446" height="1183" loading="lazy" draggable="false"'+(' hidden' if i else '')+'>' for i,n in enumerate(['alpha','beta','gamma']))
 buttons=''.join(f'<button type="button" data-fs-line="{i}" aria-pressed="{str(i==0).lower()}" style="--line-color:{color}"><span aria-hidden="true">{symbol}</span>{name}</button>' for i,(symbol,name,color) in enumerate([('α','Alpha','#ce7c90'),('β','Beta','#7760a7'),('γ','Gamma','#a24350')]))
 return f'''<section class="ae-face-studio" id="face-studio" data-face-studio data-line="alpha" aria-labelledby="fs-title">
 <div class="fs-wrap">{copy}<ol class="fs-steps">{steps}</ol></div>
 <div class="fs-workspace"><div class="fs-canvas" tabindex="0" role="group" aria-label="{c['scene']}" aria-describedby="fs-hint"><div class="fs-depth">
  {image.replace('<img ', '<img class="fs-face" ', 1)}<div class="fs-orbit" aria-hidden="true"></div><div class="fs-orbit second" aria-hidden="true"></div>
  <svg class="fs-hud-lines" viewBox="0 0 620 535" preserveAspectRatio="none" aria-hidden="true"><path d="M150 106h65l88 63M477 207h-45l-34 52M172 414h57l82-73"/><circle cx="303" cy="169" r="3"/><circle cx="398" cy="259" r="3"/><circle cx="311" cy="341" r="3"/></svg>
  <div class="fs-panel fs-balance"><small>01 / FACE BALANCE</small><strong>{c['balance']}</strong><p>{c['balance_p']}</p></div>
  <div class="fs-panel fs-product"><small>02 / HA COLLECTION</small><div class="fs-pack">{packs}</div><strong data-fs-name aria-live="polite" aria-atomic="true">Ep. Alpha</strong></div>
  <div class="fs-panel fs-compare"><small>03 / BEFORE &amp; AFTER</small><strong>{c['compare']}</strong><p>{c['compare_p']}</p><div class="fs-compare-mark" aria-hidden="true"><i></i><i></i></div></div>
 </div></div><div class="fs-selector" role="group" aria-label="Aestyve HA">{buttons}</div><p class="fs-hint" id="fs-hint"><span aria-hidden="true">↔</span>{c['hint']}</p></div></div></section>'''

def integrate():
 for lang in COPY:
  rel='' if lang=='ko' else '../'
  for filename in ['index.html','product-ha.html']:
   path=ROOT/(('' if lang=='ko' else lang+'/')+filename)
   page=path.read_text()
   page=re.sub(r'\n?<!-- FACE STUDIO START -->.*?<!-- FACE STUDIO END -->\n?', '\n',page,flags=re.S)
   block='\n<!-- FACE STUDIO START -->\n'+section(lang,rel,filename!='index.html')+'\n<!-- FACE STUDIO END -->\n'
   if filename=='index.html':
    start=page.index('<section class="ae-showroom"')
    end=page.index('</section>',start)+len('</section>')
    page=page[:end]+block+page[end:]
    if 'class="fs-hero-link"' not in page:
     needle='<div class="ae-room-bottom">'
     # Keep the hero link within its existing product-info panel.
     pos=page.index(needle)
     before=page[:pos]
     endinfo=before.rfind('</div>')
     before=before[:endinfo]+f'<a class="fs-hero-link" href="#face-studio">FACE STUDIO <span aria-hidden="true">↗</span></a>'+before[endinfo:]
     page=before+page[pos:]
   else:
    start=page.index('<section class="ha-material')
    page=page[:start]+block+page[start:]
   if 'assets/face-studio.css' not in page:
    page=page.replace('</head>',f'<link rel="stylesheet" href="{rel}assets/face-studio.css?v=20260918a">\n</head>',1)
   if filename=='index.html' and 'assets/face-studio.js' not in page:
    page=page.replace('</body>',f'<script src="{rel}assets/face-studio.js?v=20260918a" defer></script></body>',1)
   path.write_text(page)
   print('Integrated',path.relative_to(ROOT))

if __name__=='__main__': integrate()
