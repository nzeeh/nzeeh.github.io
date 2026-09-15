from pathlib import Path
import hashlib,json,sys,zipfile,stat
src=Path(sys.argv[1]); dst=Path(sys.argv[2])
expected='ee57a0fd4ec7dcb2448ce31ffe8ebc88dd7a7f13293ac7983b63ddc5400b5c0a'
assert hashlib.sha256(src.read_bytes()).hexdigest()==expected, 'Web build checksum mismatch'
assert not dst.exists(), 'Refusing to overwrite an existing Qitaf preview'
dst.mkdir(parents=True)
with zipfile.ZipFile(src) as z:
    assert z.testzip() is None
    for item in z.infolist():
        target=(dst/item.filename).resolve()
        assert target.is_relative_to(dst.resolve()), 'Unsafe archive path'
        assert not stat.S_ISLNK(item.external_attr >> 16), 'Symlinks are not allowed'
    z.extractall(dst)
for name in ['index.html','main.dart.js','flutter_bootstrap.js','canvaskit/canvaskit.wasm','assets/AssetManifest.bin','assets/assets/icon/qitaf_icon.png']:
    assert (dst/name).is_file(), name
index='''<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <base href="/qitaf/">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#8B2D3C">
  <meta name="robots" content="noindex,nofollow">
  <meta name="description" content="العرض التفاعلي التجريبي لتطبيق قِطاف v0.3: اختر بائعاً أو مشترياً، وتصفح المنتجات وسلة البيت.">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="قِطاف">
  <link rel="icon" type="image/png" href="assets/assets/icon/qitaf_icon.png">
  <link rel="apple-touch-icon" href="assets/assets/icon/qitaf_icon.png">
  <link rel="manifest" href="manifest.json">
  <title>قِطاف — العرض التجريبي v0.3</title>
  <style>
    html,body{margin:0;width:100%;height:100%;background:#fff9ef;font-family:Tahoma,Arial,sans-serif}
    #loading{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#fff9ef;color:#211f20;padding:24px;box-sizing:border-box;text-align:center}
    #loading section{max-width:390px;line-height:1.85}#loading img{width:90px;height:90px;border-radius:22px}
    #loading h1{font-size:34px;margin:12px 0 0;color:#8b2d3c}#loading p{margin:10px 0}
    .small{font-size:14px;color:#615650}.spinner{height:26px;width:26px;border:3px solid #efdfd0;border-top-color:#8b2d3c;border-radius:50%;margin:18px auto;animation:spin 1s linear infinite}
    #retry{display:none;color:#8b2d3c}@keyframes spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spinner{animation:none}}
  </style>
</head>
<body>
  <div id="loading" role="status"><section>
    <img src="assets/assets/icon/qitaf_icon.png" alt="شعار قِطاف">
    <h1>قِطاف</h1><p>شاهدها من أرضها</p>
    <div class="spinner" aria-hidden="true"></div><p>جارٍ فتح العرض التفاعلي…</p>
    <p class="small">نسخة تجريبية v0.3؛ المنتجات والأسعار أمثلة. البث والدفع والتوصيل ليست خدمات فعلية في هذا العرض. لا تدخل بيانات حساسة.</p>
    <p class="small">قد يستغرق الفتح الأول بعض الوقت بحسب اتصال الإنترنت.</p>
    <a id="retry" href="./">إعادة المحاولة</a>
  </section></div>
  <noscript>فعّل JavaScript لفتح العرض التفاعلي.</noscript>
  <script>
    window.qitafReady=false;
    window.addEventListener('flutter-first-frame',function(){window.qitafReady=true;document.getElementById('loading')?.remove();});
    setTimeout(function(){var r=document.getElementById('retry');if(r)r.style.display='inline';},45000);
  </script>
  <script src="flutter_bootstrap.js" async></script>
</body>
</html>
'''
(dst/'index.html').write_text(index,encoding='utf-8')
manifest=json.loads((dst/'manifest.json').read_text())
manifest.update(name='قِطاف — عرض تجريبي',short_name='قِطاف',description='العرض التجريبي لتطبيق قِطاف v0.3',start_url='/qitaf/',scope='/qitaf/',background_color='#FFF9EF',theme_color='#8B2D3C',orientation='any',icons=[{'src':'assets/assets/icon/qitaf_icon.png','sizes':'any','type':'image/png','purpose':'any'}])
(dst/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(dst/'preview-info.json').write_text(json.dumps({'app':'Qitaf','version':'0.3.0+3','demo':True,'source_commit':'db30af4736e023301bfd66a78ca8fac1a6a418c1','build_run':34403463765,'web_archive_sha256':expected,'path':'/qitaf/','live_payments':False,'live_streaming':False},indent=2))
print('Qitaf v0.3 web build verified and prepared at /qitaf/.')
