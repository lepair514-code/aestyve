#!/usr/bin/env python3
"""Build the three HA detail pages; source text is also synchronized to the existing CMS."""
from pathlib import Path
from html import escape as esc
import json
ROOT=Path(__file__).resolve().parents[1]
COPY={
'ko':dict(
 title='Aestyve HA 필러 | Alpha · Beta · Gamma',description='Aestyve Alpha, Beta, Gamma HA 필러의 제품 사양, 탄성계수, 응집성 및 제조 공정을 확인하세요.',
 skip='본문으로 이동',menu='메뉴',nav=['회사소개','브랜드','사이언스','유통','파트너십','문의'],
 hero_k='AESTYVE HA 필러 컬렉션',hero_h='모든 디테일에,\n에스티브.',hero_p='Alpha · Beta · Gamma. 세 가지 HA 필러의 사양과 성능 데이터를 명확하게 살펴보세요.',explore='컬렉션 살펴보기',inquiry='제품 문의',
 ha='HA 농도',volume='시린지 용량',lidocaine='리도카인',types='제품 라인업',
 collection_k='01 / 컬렉션',collection_h='세 가지 제형,\n하나의 컬렉션.',collection_p='제품을 선택해 패키지, 시린지, 구성품과 탄성계수를 비교하세요.',form='제형',form_value='리도카인 함유 가교 히알루론산',kit='동봉 구성품',needle='니들',cannula='캐뉼라',elastic='탄성계수 G′',
 compare_k='02 / 제품 사양',compare_h='한눈에 비교하세요.',spec='제품 사양',spec_note='용량과 구성품은 에스티브 패키지 표기 기준입니다. 실제 사용 시 해당 제품의 최신 사용설명서를 확인하세요.',
 tech_k='03 / 기술과 성능',tech_h='데이터로 보는 정밀함.',tech_p='가교 안정화, 정제, 균일한 젤 가공. 제조사 기술자료를 바탕으로 에스티브의 공정과 물성을 소개합니다.',
 nsp='NSP 가교 안정화',nsp_v='25°C · 약 20시간',nsp_p='가교 후 젤을 1 L 단위의 블록형 트레이에 넣고 인큐베이터에서 안정화합니다.',purify='정제 공정',purify_v='2주',purify_p='삼투압 원리를 활용한 두 단계 정제 과정으로 잔류 물질을 관리합니다.',mgt='MGT 미세 분쇄 기술',mgt_v='균일한 젤 가공',mgt_p='젤을 고르고 일관되게 가공하는 Micro Grinding Technology를 적용합니다.',
 chart_h='탄성계수 G′',chart_p='제품별 범위 · 단위 Pa',chart_note='막대는 제조사 자료에 기재된 범위입니다. 측정 주파수와 온도는 제공 자료에 명시되어 있지 않습니다.',force='평균 압출력',force_note='Aestyve Beta · 27G 니들 기준',force_p='제조사 자료의 평균값입니다. 니들과 시험 조건에 따라 압출력이 달라질 수 있습니다.',cohesion='응집성 시험',cohesion_note='제조사 응집성 시험에 기재된 길이입니다. 임상 효과의 우열을 나타내는 수치는 아닙니다.',sources='시험자료 안내',source_p='출처: 제조사 영문 기술자료 / Reanzen R&D. 제품명은 에스티브 라인업에 맞춰 표기했습니다. 시험값은 임상 결과나 사람에서의 유지기간을 직접 의미하지 않습니다.',
 partner_k='전문가와 비즈니스 파트너를 위한 안내',partner_h='에스티브와 함께할\n파트너를 찾습니다.',partner_p='제품 자료, 시장별 공급 가능 여부와 파트너십을 문의하세요.',brands='전체 브랜드',footer_p='브랜드를 만들고, 기준을 유통합니다.',market='공급 범위와 허용되는 제품 표시는 국가별로 다를 수 있습니다.',pack_alt='패키지',syringe_alt='시린지',hero_alt='Aestyve Alpha, Beta, Gamma 필러 패키지',languages='언어 선택',product_select='제품 선택',
),
'en':dict(
 title='Aestyve HA Filler | Alpha · Beta · Gamma',description='Explore Aestyve Alpha, Beta and Gamma HA fillers: product specifications, elastic modulus, cohesiveness and manufacturing processes.',
 skip='Skip to content',menu='Menu',nav=['Company','Brands','Science','Distribution','Partnership','Contact'],hero_k='AESTYVE HA FILLER COLLECTION',hero_h='Every detail\ncounts.',hero_p='Alpha · Beta · Gamma. Discover three HA fillers through clear specifications and performance data.',explore='Explore the collection',inquiry='Product inquiry',ha='HA concentration',volume='Syringe volume',lidocaine='Lidocaine',types='Product range',
 collection_k='01 / COLLECTION',collection_h='Three formulations.\nOne collection.',collection_p='Select a product to explore its packaging, syringe, included accessories and elastic modulus.',form='Formulation',form_value='Cross-linked hyaluronic acid with lidocaine',kit='Included accessories',needle='Needle',cannula='Cannula',elastic='Elastic modulus G′',compare_k='02 / SPECIFICATIONS',compare_h='Compare at a glance.',spec='Specification',spec_note='Volume and accessories follow Aestyve packaging. Always consult the current instructions for use supplied with the product.',
 tech_k='03 / TECHNOLOGY & PERFORMANCE',tech_h='Precision, in detail.',tech_p='Cross-linking stabilization, purification and uniform gel processing. Explore the processes and material properties described in the manufacturer’s technical data.',nsp='NSP stabilization',nsp_v='25°C · approx. 20 hours',nsp_p='After cross-linking, the gel is placed in 1 L block-shaped trays and stabilized in an incubator.',purify='Purification process',purify_v='2 weeks',purify_p='Two purification stages use the principle of osmotic pressure to control residual substances.',mgt='Micro Grinding Technology',mgt_v='Uniform gel processing',mgt_p='MGT processes the filler gel evenly and consistently.',chart_h='Elastic modulus G′',chart_p='Ranges by product · Pa',chart_note='Bars show the ranges reported by the manufacturer. Measurement frequency and temperature are not specified in the supplied data.',force='Average extrusion force',force_note='Aestyve Beta · 27G needle',force_p='Manufacturer-reported average. Extrusion force may vary with the needle and test conditions.',cohesion='Cohesiveness test',cohesion_note='Lengths reported in the manufacturer’s cohesiveness test. These values do not establish a ranking of clinical outcomes.',sources='About the test data',source_p='Source: manufacturer’s English technical brochure / Reanzen R&D. Product names follow the Aestyve range. Test values do not directly establish clinical outcomes or duration in humans.',
 partner_k='FOR PROFESSIONALS & BUSINESS PARTNERS',partner_h='Build your next\npartnership with Aestyve.',partner_p='Contact us for product documentation, market availability and partnership inquiries.',brands='All brands',footer_p='Building brands, distributing standards.',market='Product availability and permitted claims may vary by market.',pack_alt='packaging',syringe_alt='syringe',hero_alt='Aestyve Alpha, Beta and Gamma filler packaging',languages='Select language',product_select='Select product',
),
'zh':dict(
 title='Aestyve 透明质酸填充剂 | Alpha · Beta · Gamma',description='了解 Aestyve Alpha、Beta、Gamma 透明质酸填充剂的产品规格、弹性模量、内聚性与制造工艺。',skip='跳转至正文',menu='菜单',nav=['公司介绍','品牌','科学与品质','分销','合作伙伴','联系我们'],hero_k='AESTYVE 透明质酸填充剂系列',hero_h='每一处细节，\n皆有用心。',hero_p='Alpha · Beta · Gamma。通过清晰的规格与性能数据，了解三款透明质酸填充剂。',explore='探索产品系列',inquiry='产品咨询',ha='透明质酸浓度',volume='注射器容量',lidocaine='利多卡因',types='产品系列',
 collection_k='01 / 产品系列',collection_h='三种配方，\n一个系列。',collection_p='选择产品，查看包装、注射器、随附配件与弹性模量。',form='配方',form_value='含利多卡因的交联透明质酸',kit='随附配件',needle='锐针',cannula='钝针',elastic='弹性模量 G′',compare_k='02 / 产品规格',compare_h='产品差异，一目了然。',spec='产品规格',spec_note='容量与配件以 Aestyve 包装标示为依据。使用时请参阅产品随附的最新使用说明书。',
 tech_k='03 / 技术与性能',tech_h='以数据呈现精细。',tech_p='交联稳定化、纯化与均匀凝胶加工。依据制造商技术资料，了解产品工艺与材料特性。',nsp='NSP 交联稳定化',nsp_v='25°C · 约20小时',nsp_p='交联后，将凝胶置于 1 L 单元的块状托盘中，并在恒温箱内进行稳定化处理。',purify='纯化工艺',purify_v='2周',purify_p='利用渗透压原理，通过两个阶段的纯化过程控制残留物质。',mgt='MGT 微研磨技术',mgt_v='均匀凝胶加工',mgt_p='通过 Micro Grinding Technology 对填充剂凝胶进行均匀、一致的加工。',chart_h='弹性模量 G′',chart_p='各产品数值范围 · 单位 Pa',chart_note='横条表示制造商资料中的数值范围。所提供资料未注明测量频率与温度。',force='平均挤出力',force_note='Aestyve Beta · 27G 锐针',force_p='制造商报告的平均值。挤出力可能因针具与试验条件而异。',cohesion='内聚性试验',cohesion_note='数值为制造商内聚性试验中报告的长度，不代表临床效果的优劣。',sources='试验资料说明',source_p='来源：制造商英文技术资料 / Reanzen R&D。产品名称按 Aestyve 系列标示。试验数值不直接代表临床结果或人体内的维持时间。',
 partner_k='面向专业人士与商业合作伙伴',partner_h='与 Aestyve\n开启合作。',partner_p='欢迎咨询产品资料、各市场供应情况及合作事宜。',brands='全部品牌',footer_p='打造品牌，传递标准。',market='产品供应范围与允许使用的宣称可能因市场而异。',pack_alt='包装',syringe_alt='注射器',hero_alt='Aestyve Alpha、Beta、Gamma 填充剂包装',languages='选择语言',product_select='选择产品',
)}
PRODUCTS=[('Alpha','alpha','60–120','30G × 2','—'),('Beta','beta','150–210','27G × 1','25G × 1'),('Gamma','gamma','260–300','25G × 1','23G × 1')]
for lang,c in COPY.items():
    folder='' if lang=='ko' else lang+'/'
    root='' if lang=='ko' else '../'
    asset=root+'assets/'
    path=ROOT/folder/'product-ha.html'
    cmsfile=ROOT/({'ko':'content.json','en':'content-en.json','zh':'content-zh.json'}[lang])
    cms=json.loads(cmsfile.read_text())
    # Preserve other pages, replace only the HA page's old editor entries.
    cms={k:v for k,v in cms.items() if not k.startswith('product-ha.')}
    def t(key,tag='span',attrs=''):
        value=c[key]; rich='\n' in value; rendered=esc(value).replace('\n','<br>')
        cms['product-ha.renewal.'+key]={'type':'rich' if rich else 'plain','value':rendered if rich else value,'label':value.replace('\n',' '),'page':'product-ha.html'}
        return f'<{tag} data-cms="product-ha.renewal.{key}" data-cms-type="{"rich" if rich else "plain"}" {attrs}>{rendered}</{tag}>'
    h=[]
    h.append(f'''<!doctype html>
<html lang="{'zh-Hans' if lang=='zh' else lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(c['title'])}</title><meta name="description" content="{esc(c['description'])}">
<link rel="canonical" href="https://www.aestyve.com/{folder}product-ha.html">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:type" content="website"><meta property="og:site_name" content="Aestyve">
<meta property="og:title" content="{esc(c['title'])}"><meta property="og:description" content="{esc(c['description'])}">
<meta property="og:url" content="https://www.aestyve.com/{folder}product-ha.html">
<meta property="og:image" content="https://www.aestyve.com/assets/ha-renewal/collection.jpg">
<meta name="twitter:card" content="summary_large_image"><link rel="icon" href="{asset}favicon.svg">
<link rel="stylesheet" href="{asset}ha-renewal.css?v=20260917">
<link rel="preload" href="{asset}fonts/S-CoreDream-4Regular.woff" as="font" type="font/woff" crossorigin>
''')
    for code,prefix in [('ko',''),('en','en/'),('zh-Hans','zh/'),('x-default','')]:h.append(f'<link rel="alternate" hreflang="{code}" href="https://www.aestyve.com/{prefix}product-ha.html">')
    h.append('</head><body>'+t('skip','a','class="skip" href="#main"'))
    h.append(f'<header class="header"><div class="wrap nav"><a class="brand" href="index.html"><img src="{asset}ha-renewal/logo-white.png" alt="Aestyve" width="1908" height="494"></a><nav class="menu" id="main-menu">')
    for name,url in zip(c['nav'],['company','brands','science','distribution','partnership','contact']):h.append(f'<a href="{url}.html" {"class=active" if url=="brands" else ""}>{esc(name)}</a>')
    h.append(f'<div class="languages" aria-label="{c["languages"]}">')
    for code,prefix,label in [('ko','','KO'),('en','en/','EN'),('zh','zh/','中文')]:h.append(f'<a href="{root}{prefix}product-ha.html" lang="{code}" hreflang="{code}" {"aria-current=page" if lang==code else ""}>{label}</a>')
    h.append('</div></nav>'+t('menu','button','class="menu-toggle" type="button" aria-controls="main-menu" aria-expanded="false"')+'</div></header><main id="main">')
    h.append('<section class="hero"><div class="hero-copy">'+t('hero_k',attrs='class="eyebrow"')+t('hero_h','h1')+t('hero_p','p')+'<div class="actions">'+t('explore','a','class="button primary" href="#collection"')+t('inquiry','a','class="button" href="contact.html"')+f'</div></div><figure class="hero-visual"><img src="{asset}ha-renewal/collection.jpg" alt="{c["hero_alt"]}" width="1280" height="1920" fetchpriority="high"></figure></section>')
    h.append('<div class="facts"><div class="wrap">')
    for val,unit,key in [('24','mg/mL','ha'),('1.1','mL','volume'),('0.3','%','lidocaine'),('3','','types')]:h.append(f'<div class="fact"><strong>{val} <small>{unit}</small></strong>'+t(key)+'</div>')
    h.append('</div></div><section class="section" id="collection"><div class="wrap">'+t('collection_k',attrs='class="eyebrow"')+t('collection_h','h2')+t('collection_p','p','class="lead"'))
    h.append(f'<div class="tabs" role="tablist" aria-label="{c["product_select"]}">')
    for i,(name,slug,*_) in enumerate(PRODUCTS):h.append(f'<a id="tab-{slug}" href="#panel-{slug}" role="tab" aria-controls="panel-{slug}" aria-selected="{str(i==0).lower()}" style="--accent:var(--{slug})">Ep. {name}</a>')
    h.append('</div>')
    for name,slug,g,needle,cannula in PRODUCTS:
        h.append(f'<article class="product-panel" id="panel-{slug}" role="tabpanel" aria-labelledby="tab-{slug}" style="--accent:var(--{slug})"><div class="product-photos"><img class="pack" src="{asset}ha-renewal/{slug}-pack.jpg" alt="Aestyve {name} {c["pack_alt"]}" loading="lazy"><img class="syringe" src="{asset}ha-renewal/{slug}-syringe.jpg" alt="Aestyve {name} {c["syringe_alt"]}" loading="lazy"></div><div class="product-info"><span class="eyebrow">Aestyve HA Filler</span><h3>Ep. {name}</h3><dl>')
        for key,val in [('form',c['form_value']),('volume','1.1 mL'),('elastic',g+' Pa'),('needle',needle),('cannula',cannula)]:h.append('<div>'+t(key,'dt')+f'<dd>{esc(val)}</dd></div>')
        h.append('</dl>'+t('inquiry','a','class="button" href="contact.html"')+'</div></article>')
    h.append('</div></section><section class="section compare" id="specifications"><div class="wrap">'+t('compare_k',attrs='class="eyebrow"')+t('compare_h','h2')+'<div class="table-wrap"><table><thead><tr>'+t('spec','th','scope="col"'))
    for name,slug,*_ in PRODUCTS:h.append(f'<th scope="col" class="{slug}-head">Ep. {name}</th>')
    h.append('</tr></thead><tbody>')
    for key,vals in [('ha',['24 mg/mL']*3),('volume',['1.1 mL']*3),('lidocaine',['3 mg/mL (0.3%)']*3),('needle',[p[3] for p in PRODUCTS]),('cannula',[p[4] for p in PRODUCTS])]:h.append('<tr>'+t(key,'th','scope="row"')+''.join('<td>'+esc(v)+'</td>' for v in vals)+'</tr>')
    h.append('</tbody></table></div>'+t('spec_note','p','class="note"')+'</div></section>')
    h.append('<section class="section science" id="technology"><div class="wrap">'+t('tech_k',attrs='class="eyebrow"')+t('tech_h','h2')+t('tech_p','p','class="lead"')+'<div class="processes">')
    for key in ['nsp','purify','mgt']:h.append('<article class="process">'+t(key,'h3')+t(key+'_v','strong')+t(key+'_p','p')+'</article>')
    h.append('</div><div class="chart-grid"><div class="chart">'+t('chart_h','h3')+t('chart_p','p','class="note"'))
    for (name,slug,g,*_),start,width in zip(PRODUCTS,[20,50,86.6667],[20,20,13.3333]):h.append(f'<div class="range-row"><span>{name}</span><div class="track" aria-hidden="true"><span class="interval" style="left:{start}%;width:{width}%;--accent:var(--{slug})"></span></div><span>{g} Pa</span></div>')
    h.append('<div class="axis" aria-hidden="true"><span>0</span><span>150</span><span>300</span></div>'+t('chart_note','p','class="note"')+'</div><div class="chart">'+t('force','h3')+'<div class="metric">13.62 <small>N</small></div>'+t('force_note','p')+t('force_p','p','class="note"')+'</div></div>')
    h.append('<div class="cohesion">'+t('cohesion','h3')+'<table><thead><tr>'+''.join(f'<th scope="col">{p[0]}</th>' for p in PRODUCTS)+'</tr></thead><tbody><tr>'+''.join('<td>'+v+' cm</td>' for v in ['2.4','2.1','2.0'])+'</tr></tbody></table>'+t('cohesion_note','p','class="note"')+'</div><details class="sources">'+t('sources','summary')+t('source_p','p')+'</details></div></section>')
    h.append('<section class="section"><div class="wrap partner"><div>'+t('partner_k',attrs='class="eyebrow"')+t('partner_h','h2')+t('partner_p','p')+'</div><div class="actions">'+t('inquiry','a','class="button primary" href="contact.html"')+t('brands','a','class="button" href="brands.html"')+'</div></div></section></main>')
    h.append(f'<footer class="footer"><div class="wrap"><div class="footer-top"><div><img class="footer-logo" src="{asset}ha-renewal/logo-white.png" alt="Aestyve" width="1908" height="494" loading="lazy">'+t('footer_p','p')+'</div><div class="footer-links">'+t('inquiry','a','href="contact.html"')+t('brands','a','href="brands.html"')+'<a href="mailto:info@aestyve.com">info@aestyve.com</a></div></div><div class="footer-bottom"><span>© Aestyve. All rights reserved.</span>'+t('market')+'</div></div></footer>'+f'<div class="company-band"><img src="{asset}ha-renewal/company-logo.png" alt="AT CORP. Aesthetic Division" width="2048" height="375" loading="lazy"></div>')
    h.append(f'<script src="{asset}ha-renewal.js?v=20260917" defer></script><script src="{root}cms-loader.js" defer></script></body></html>')
    path.write_text('\n'.join(h)+'\n')
    cmsfile.write_text(json.dumps(cms,ensure_ascii=False,indent=1 if lang=='ko' else 2)+'\n')
    print(path.relative_to(ROOT))
