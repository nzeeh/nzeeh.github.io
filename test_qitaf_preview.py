from playwright.sync_api import sync_playwright
from pathlib import Path
import json,shutil
report={'url':'http://127.0.0.1:8765/qitaf/','version':'0.3.0+3','page_errors':[],'failed_local_requests':[]}
with sync_playwright() as p:
    executable=shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chromium-browser')
    assert executable, 'No browser executable available'
    browser=p.chromium.launch(headless=True,executable_path=executable,args=['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader'])
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    page.on('pageerror',lambda e:report['page_errors'].append(str(e)))
    page.on('response',lambda r:report['failed_local_requests'].append({'status':r.status,'url':r.url}) if r.status>=400 and '127.0.0.1' in r.url else None)
    response=page.goto(report['url'],wait_until='domcontentloaded',timeout=45000)
    report['http_status']=response.status
    try:
        page.wait_for_function('window.qitafReady === true',timeout=90000)
        page.wait_for_timeout(2500)
        report['first_frame']=True
        report['canvas_count']=page.locator('canvas').count()
        report['title']=page.title()
        page.screenshot(path='qitaf-browser-preview.png',full_page=True)
        assert report['http_status']==200 and report['first_frame']
        assert not report['page_errors'], report['page_errors']
        assert not report['failed_local_requests'], report['failed_local_requests']
    finally:
        Path('QITAF_PREVIEW_CHECK.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
        print(json.dumps(report,ensure_ascii=False))
        browser.close()
