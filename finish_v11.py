from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'
out = Path.cwd().parent / 'qitaf-v11-output'
out.mkdir(parents=True, exist_ok=True)
log = []

def replace_once(path: Path, old: str, new: str, label: str):
    s = path.read_text(encoding='utf-8')
    count = s.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: expected exactly one match, found {count}')
    path.write_text(s.replace(old, new, 1), encoding='utf-8')

# 1) Onboarding: truthful demo scope + optional spoken guidance for low-literacy users.
role = root / 'lib/features/onboarding/role_selection_screen.dart'
r = role.read_text(encoding='utf-8')
if "../../core/services/read_aloud.dart" not in r:
    anchor = "import '../../core/state/app_store.dart';\n"
    if r.count(anchor) != 1:
        raise RuntimeError('role import anchor missing')
    r = r.replace(anchor, anchor + "import '../../core/services/read_aloud.dart';\n", 1)
repls = {
    "'توصيل أو هدية',": "'عنوان أو هدية',",
    "'محفظة أو دفع صديق',": "'معاينة دفع فقط',",
    "subtitle: 'أصوّر محصولي وأشرح عنه ثم أبيعه بسهولة.',": "subtitle: 'أصوّر محصولي وأجهّز عرضه التجريبي.',",
    "'بث مباشر',": "'معاينة بث محلية',",
    "'السعر داخل الفيديو',": "'السعر داخل المعاينة',",
    "'إدارة الطلبات',": "'طلبات تجريبية',",
}
for old, new in repls.items():
    if r.count(old) != 1:
        raise RuntimeError(f'role phrase {old!r}: expected one, found {r.count(old)}')
    r = r.replace(old, new, 1)
insert_anchor = "                const SizedBox(height: 18),\n                _RoleCard(\n"
spoken = """                const SizedBox(height: 12),
                const Align(
                  alignment: AlignmentDirectional.centerStart,
                  child: ReadAloudButton(
                    key: ValueKey('role-audio-guide'),
                    label: 'اسمع الخيارات',
                    text:
                        'إذا كنت تريد تجهيز سلة من المنتجات اضغط أنا مشتري. إذا كنت مزارعًا وتريد فتح الكاميرا وتجهيز عرض تجريبي اضغط أنا بائع أو مزارع. البث والدفع والطلبات الحقيقية غير متصلة في هذه النسخة.',
                  ),
                ),
"""
if "ValueKey('role-audio-guide')" not in r:
    if r.count(insert_anchor) != 1:
        raise RuntimeError('role audio insertion anchor not found exactly once')
    r = r.replace(insert_anchor, "                const SizedBox(height: 18),\n" + spoken + "                _RoleCard(\n", 1)
role.write_text(r, encoding='utf-8')
log.append('role_selection_screen.dart: seller/buyer claims now describe demo behavior; optional Arabic spoken guidance added.')

# 2) Seller dashboard: remove fake social proof / sales numbers and reword production claims.
seller = root / 'lib/features/farmer/seller_home_screen.dart'
s = seller.read_text(encoding='utf-8')
replacements = {
    "Icons.verified_rounded,": "Icons.agriculture_rounded,",
    "'صوّر محصولك، اشرح عنه بصوتك، واستقبل الطلبات.',": "'صوّر محصولك وجهّز عرضه التجريبي؛ الطلبات الحقيقية غير متصلة بعد.',",
    "value: '٣',\n                  label: 'طلبات جديدة',": "value: '—',\n                  label: 'طلبات غير متصلة',",
    "value: '١٬٢٤٠',\n                  label: 'مشاهدة اليوم',": "value: '—',\n                  label: 'مشاهدات غير متصلة',",
    "value: '٢٨٫٥ ألف',\n                  label: 'مبيعات اليوم',": "value: '—',\n                  label: 'مبيعات غير متصلة',",
    "title: 'ابدأ بثًا',": "title: 'معاينة البث',",
    "subtitle: 'افتح الكاميرا وبِع الآن',": "subtitle: 'افتح الكاميرا محليًا',",
    "subtitle: 'السعر والكمية المتوفرة',": "subtitle: 'السعر والكمية التجريبية',",
    "title: 'طلباتي',": "title: 'الطلبات',",
    "subtitle: 'حضّر الطلب وسلمه للسائق',": "subtitle: 'غير متصلة بخدمة توصيل',",
    "'ثلاث خطوات للبيع',": "'ثلاث خطوات لتجهيز العرض',",
    "title: 'اضغط الزر الأحمر وابدأ البيع',": "title: 'اضغط الزر الأحمر لمعاينة العرض',",
    "content: Text('$feature ستُربط بالخادم في الإصدار القادم.'),": "content: Text('$feature غير متصلة بالخادم في هذه النسخة.'),",
    "'مباشر من المزرعة',": "'معاينة من المزرعة',",
    "'صوّر محصولك الآن\\nواجعل السعر يظهر على الفيديو',": "'صوّر محصولك الآن\\nواجعل السعر يظهر على المعاينة',",
    "label: const Text('ابدأ البث الآن'),": "label: const Text('افتح معاينة الكاميرا'),",
}
for old, new in replacements.items():
    if s.count(old) != 1:
        raise RuntimeError(f'seller phrase {old!r}: expected one, found {s.count(old)}')
    s = s.replace(old, new, 1)
seller.write_text(s, encoding='utf-8')
log.append('seller_home_screen.dart: removed fake order/view/sales metrics and verification cue; seller actions are labeled as local/demo.')

# 3) Farmer studio: no fake verification, viewers, broadcast or live-stock claims.
studio = root / 'lib/features/farmer/farmer_studio_screen.dart'
f = studio.read_text(encoding='utf-8')
replacements = {
    "child: Icon(Icons.verified_rounded, color: Colors.white),": "child: Icon(Icons.agriculture_rounded, color: Colors.white),",
    "Text('حساب مزارع موثّق',": "Text('وضع بائع تجريبي',",
    "Text('يمكنك التصوير والبيع مباشرة من مزرعتك.',": "Text('الكاميرا تعمل محليًا؛ لا يتم بث أو بيع عبر الخادم.',",
    "title: 'صوّر وبِع',": "title: 'صوّر واعرض',",
    "'لا تحتاج إلى الكتابة. وجّه الكاميرا للمحصول، تحدث عنه، ثم ابدأ.',": "'لا تحتاج إلى الكتابة. وجّه الكاميرا للمحصول وتحدث عنه، ثم افتح المعاينة المحلية.',",
    "title: 'ابدأ بثًا مباشرًا',": "title: 'معاينة بث مباشر',",
    "'تحدث مع المشترين، أجب عن أسئلتهم وثبّت المنتج والسعر على الشاشة.',": "'معاينة محلية لشكل البث وتثبيت المنتج والسعر؛ لا تصل إلى مشاهدين حقيقيين.',",
    "tag: 'LIVE',": "tag: 'تجريبي',",
    "'صوّر المحصول خلال أقل من دقيقة، واربطه بالمنتج ليظل يبيع بعد مغادرتك.',": "'صوّر مقطعًا محليًا قصيرًا واربطه بالمنتج للمعاينة؛ لا يُرفع إلى الخادم.',",
    "subtitle: 'وتظهر بطاقة الشراء للمشاهدين.'": "subtitle: 'وتظهر بطاقة المنتج داخل المعاينة.'",
    "? 'بث مباشر من المزرعة'": "? 'معاينة بث من المزرعة'",
    "const LiveChip(label: 'على الهواء'),": "const LiveChip(label: 'معاينة محلية'),",
    "Text('أم محمد: هل يوجد توصيل إلى شملان؟',": "Text('مثال محلي: هل يوجد توصيل إلى شملان؟',",
    "Text('علي: أرنا الصندوق أمام الكاميرا',": "Text('مثال محلي: أرنا الصندوق أمام الكاميرا',",
    "Text('المنتج المثبّت للمشاهدين',": "Text('المنتج المثبّت في المعاينة',",
    "Text('$price ريال / كجم · متوفر $stock',": "Text('$price ريال / كجم · مخزون تجريبي $stock',",
    "? 'اضغط الدائرة لإيقاف ${widget.mode == StudioMode.live ? 'البث' : 'التسجيل'}'": "? 'اضغط الدائرة لإيقاف ${widget.mode == StudioMode.live ? 'المعاينة' : 'التسجيل المحلي'}'",
    "? 'انتهى البث التجريبي'": "? 'انتهت معاينة البث'",
    "? 'في النسخة المتصلة بالخادم سيُحفظ التسجيل ويظهر عدد المشاهدين والطلبات والمبيعات.'": "? 'انتهت المعاينة المحلية. لم يبدأ بث عام ولم تُنشأ مشاهدات أو طلبات أو مبيعات حقيقية.'",
    "'اختر منتجًا لتثبيته في البث'": "'اختر منتجًا لتثبيته في المعاينة'",
}
for old, new in replacements.items():
    if f.count(old) != 1:
        raise RuntimeError(f'studio phrase {old!r}: expected one, found {f.count(old)}')
    f = f.replace(old, new, 1)
studio.write_text(f, encoding='utf-8')
log.append('farmer_studio_screen.dart: removed fake verification/viewer cues; camera/live UI is explicitly a local demo, with sample chat and demo stock labeled.')

# 4) Profile seller call-to-action also reflects local demo scope.
profile = root / 'lib/features/profile/profile_screen.dart'
p = profile.read_text(encoding='utf-8')
for old, new in {
    "isSeller ? 'افتح استوديو البيع' : 'هل أنت مزارع؟'": "isSeller ? 'افتح استوديو العرض' : 'هل أنت مزارع؟'",
    "? 'صوّر محصولك وابدأ بثًا مباشرًا.'": "? 'صوّر محصولك وافتح معاينة بث محلية.'",
    ": 'حوّل الحساب وابدأ التصوير والبيع بالصوت.',": ": 'حوّل الوضع وابدأ تصوير عرض تجريبي بالصوت.',",
}.items():
    if p.count(old) != 1:
        raise RuntimeError(f'profile phrase {old!r}: expected one, found {p.count(old)}')
    p = p.replace(old, new, 1)
profile.write_text(p, encoding='utf-8')
log.append('profile_screen.dart: seller entry point now says studio/preview rather than real selling or live broadcasting.')

# 5) Version and docs.
pubspec = root / 'pubspec.yaml'
pub = pubspec.read_text(encoding='utf-8')
pub, n = re.subn(r'(?m)^version:\s*[^\n]+$', 'version: 0.11.0+11', pub, count=1)
if n != 1:
    raise RuntimeError('Could not update pubspec version to 0.11.0+11')
pubspec.write_text(pub, encoding='utf-8')

readme = root / 'README.md'
rd = readme.read_text(encoding='utf-8')
rd = rd.replace('# Qitaf 0.10.0+10 — سلة البيت', '# Qitaf 0.11.0+11 — سلة البيت')
if '## New in 0.11' not in rd:
    marker = '\n## New in 0.10\n'
    if marker not in rd:
        raise RuntimeError('README v0.10 insertion marker not found')
    section = """
## New in 0.11
- Removes the seller dashboard's illustrative order, view and sales numbers so demo activity cannot be mistaken for real social proof or revenue.
- Removes the seller-side verification cue and labels the camera/live studio as a local demo; sample chat and stock are explicitly marked as examples/demo data.
- Rewords seller actions across onboarding, dashboard, studio and profile so no screen claims a public livestream, live orders, real delivery or completed sale.
- Adds an optional Arabic “listen to the choices” guide on the buyer/seller role screen for users who prefer spoken guidance.
- Android application id remains com.qitaf.qitaf.demo3. Production payment, delivery, authentication, live inventory, analytics and inter-user livestream services remain disconnected.

"""
    rd = rd.replace(marker, section + '## New in 0.10\n', 1)
rd = rd.replace(
    'All farms, prices, stock, viewer counts, orders, wallets, friend-payment requests and delivery fees are illustrative.',
    'All farms, prices, stock, wallets, friend-payment requests and delivery fees are illustrative; seller dashboard metrics are intentionally not fabricated.',
)
readme.write_text(rd, encoding='utf-8')

status = root / 'BUILD_STATUS.md'
st = status.read_text(encoding='utf-8').replace('Version 0.10.0+10.', 'Version 0.11.0+11.')
status.write_text(st, encoding='utf-8')

# 6) Regression source tests: trust + accessibility.
test = root / 'test/v11_seller_truth_accessibility_source_test.dart'
test.write_text(
    """import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('seller dashboard has no fabricated activity metrics or verification cue', () {
    final source = File('lib/features/farmer/seller_home_screen.dart').readAsStringSync();
    expect(source, contains('طلبات غير متصلة'));
    expect(source, contains('مشاهدات غير متصلة'));
    expect(source, contains('مبيعات غير متصلة'));
    expect(source, contains("value: '—'"));
    expect(source, isNot(contains("value: '١٬٢٤٠'")));
    expect(source, isNot(contains("value: '٢٨٫٥ ألف'")));
    expect(source, isNot(contains('Icons.verified_rounded')));
    expect(source, contains('معاينة البث'));
  });

  test('farmer studio labels broadcast chat stock and verification as demo/local', () {
    final source = File('lib/features/farmer/farmer_studio_screen.dart').readAsStringSync();
    expect(source, contains('وضع بائع تجريبي'));
    expect(source, contains('لا يتم بث أو بيع عبر الخادم'));
    expect(source, contains('معاينة بث مباشر'));
    expect(source, contains('معاينة محلية'));
    expect(source, contains('مثال محلي:'));
    expect(source, contains('مخزون تجريبي'));
    expect(source, isNot(contains('حساب مزارع موثّق')));
    expect(source, isNot(contains("LiveChip(label: 'على الهواء')")));
  });

  test('role screen offers optional Arabic spoken guidance and truthful seller scope', () {
    final source = File('lib/features/onboarding/role_selection_screen.dart').readAsStringSync();
    expect(source, contains("ValueKey('role-audio-guide')"));
    expect(source, contains("label: 'اسمع الخيارات'"));
    expect(source, contains('معاينة بث محلية'));
    expect(source, contains('معاينة دفع فقط'));
    expect(source, isNot(contains("'محفظة أو دفع صديق'")));
  });
}
""",
    encoding='utf-8',
)

(out / 'SOURCE_CLEANUP.txt').write_text('\n'.join(log) + '\n', encoding='utf-8')
print('Qitaf v0.11 applied: seller truthfulness + spoken role guidance.')
for row in log:
    print('-', row)
