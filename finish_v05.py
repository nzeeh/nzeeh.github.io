from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'

# 1) Demo-data integrity: do not present illustrative social proof or verification
# as if it were real. The production model can still carry these fields later,
# but the local demo starts unverified and uses zero illustrative counters.
model = root / 'lib/core/models/product.dart'
text = model.read_text(encoding='utf-8')
text, verified_default = re.subn(r'this\.isVerified\s*=\s*true', 'this.isVerified = false', text, count=1)
if verified_default != 1:
    raise RuntimeError('Could not change Product.isVerified demo default safely')
text, like_count = re.subn(r'(?m)^(\s*likes:\s*)\d+(,\s*)$', r'\g<1>0\g<2>', text)
text, viewer_count = re.subn(r'(?m)^(\s*viewers:\s*)\d+(,\s*)$', r'\g<1>0\g<2>', text)
if like_count < 4 or viewer_count < 4:
    raise RuntimeError(f'Expected at least four demo like/viewer rows, got likes={like_count}, viewers={viewer_count}')
text = text.replace(
    "shortDescription: 'تعبئة مباشرة أمامك من خلية موثقة',",
    "shortDescription: 'تعبئة مباشرة أمامك — بيانات تجريبية من المنحل',",
)
model.write_text(text, encoding='utf-8')

# 2) Feed: preserve the interaction prototype, but remove fake-looking public
# counters and make the demo state unmistakable. A user's own local like remains
# a simple on-device toggle; it is not a public count.
feed = root / 'lib/features/feed/feed_screen.dart'
f = feed.read_text(encoding='utf-8')
old_like = "label: compactCount(product.likes + (liked ? 1 : 0)),"
if old_like not in f:
    raise RuntimeError('Could not find feed like counter')
f = f.replace(old_like, "label: liked ? 'تم' : 'إعجاب',", 1)
f = f.replace("_topTab('مباشر', false)", "_topTab('عرض', false)")
f = f.replace("'أرقام توضيحية'", "'بيانات تجريبية'")
feed.write_text(f, encoding='utf-8')

# 3) Price clarity: show what the currently selected package actually costs and
# the comparable price per base unit. This responds to budget-conscious shopping
# without personalized pricing or invented discounts.
sheet = root / 'lib/features/product/product_sheet.dart'
s = sheet.read_text(encoding='utf-8')
needle = "    final bottomPadding = MediaQuery.viewInsetsOf(context).bottom;\n"
if needle not in s:
    raise RuntimeError('Could not find product sheet build preamble')
s = s.replace(
    needle,
    needle +
    "    final selectedPackagePrice = selection.unitTotal(product);\n"
    "    final selectedBaseUnits = selection.weight.quantityInBaseUnits;\n"
    "    final comparableUnitPrice = selectedBaseUnits > 0\n"
    "        ? selectedPackagePrice / selectedBaseUnits\n"
    "        : selectedPackagePrice;\n",
    1,
)
anchor = """                 _choiceSection('الوزن أو العبوة', product.weightOptions, selection.weight, (value) {
                   setState(() => selection = selection.copyWith(weight: value));
                 }),
"""
if anchor not in s:
    raise RuntimeError('Could not find weight choice section')
price_panel = anchor + """                 Container(
                   key: const ValueKey('unit-price-breakdown'),
                   margin: const EdgeInsets.only(bottom: 22),
                   padding: const EdgeInsets.all(14),
                   decoration: BoxDecoration(
                     color: const Color(0xFFFFF3DC),
                     borderRadius: BorderRadius.circular(18),
                     border: Border.all(color: const Color(0xFFE7D3AE)),
                   ),
                   child: Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                       const Row(children: [
                         Icon(Icons.receipt_long_outlined, size: 19, color: QitafColors.burgundy),
                         SizedBox(width: 7),
                         Text('السعر حسب اختيارك', style: TextStyle(fontWeight: FontWeight.w900)),
                       ]),
                       const SizedBox(height: 7),
                       Text(
                         '${formatMoney(selectedPackagePrice)} ر.ي للعبوة المختارة',
                         style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: QitafColors.burgundy),
                       ),
                       Text(
                         'يعادل ${formatMoney(comparableUnitPrice)} ر.ي / ${product.unitLabel}',
                         key: const ValueKey('comparable-unit-price'),
                         style: const TextStyle(fontWeight: FontWeight.w800),
                       ),
                       const SizedBox(height: 3),
                       const Text(
                         'قبل التوصيل • الأسعار والمنتجات في هذه النسخة تجريبية',
                         style: TextStyle(color: QitafColors.muted, fontSize: 11),
                       ),
                     ],
                   ),
                 ),
"""
s = s.replace(anchor, price_panel, 1)
sheet.write_text(s, encoding='utf-8')

# 4) Version and documentation.
pubspec = root / 'pubspec.yaml'
pub = pubspec.read_text(encoding='utf-8')
pub, n = re.subn(r'(?m)^version:\s*[^\n]+$', 'version: 0.5.0+5', pub, count=1)
if n != 1:
    raise RuntimeError('Could not update pubspec version to 0.5.0+5')
pubspec.write_text(pub, encoding='utf-8')

readme = root / 'README.md'
if readme.exists():
    r = readme.read_text(encoding='utf-8')
    r = r.replace('# Qitaf 0.4.0+4 — سلة البيت', '# Qitaf 0.5.0+5 — سلة البيت')
    if '## New in 0.5' not in r:
        marker = '\n## New in 0.4\n'
        if marker not in r:
            raise RuntimeError('README v0.4 insertion marker not found')
        section = """
## New in 0.5
- Removes illustrative public like/viewer counts and demo verification badges so social proof cannot be mistaken for real activity.
- Rewords the honey demo description to avoid an unsupported verification claim.
- Adds a live price breakdown in the product configurator: selected package price plus comparable price per base unit.
- Keeps all prices global and selection-based; there is no personalized pricing.
- Android application id remains com.qitaf.qitaf.demo3.

"""
        r = r.replace(marker, section + '## New in 0.4\n', 1)
    readme.write_text(r, encoding='utf-8')

status = root / 'BUILD_STATUS.md'
if status.exists():
    st = status.read_text(encoding='utf-8').replace('Version 0.4.0+4.', 'Version 0.5.0+5.')
    status.write_text(st, encoding='utf-8')

# 5) Regression guard: source-level checks complement existing unit/widget tests.
test = root / 'test/v05_integrity_source_test.dart'
test.write_text(
    """import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('demo social proof is not presented as real data', () {
    final model = File('lib/core/models/product.dart').readAsStringSync();
    final feed = File('lib/features/feed/feed_screen.dart').readAsStringSync();
    expect(model, contains('this.isVerified = false'));
    expect(RegExp(r'likes:\\s*[1-9]').hasMatch(model), isFalse);
    expect(RegExp(r'viewers:\\s*[1-9]').hasMatch(model), isFalse);
    expect(model, isNot(contains('خلية موثقة')));
    expect(feed, isNot(contains('compactCount(product.likes')));
    expect(feed, contains("liked ? 'تم' : 'إعجاب'"));
    expect(feed, contains('بيانات تجريبية'));
  });

  test('product configurator exposes comparable unit price', () {
    final source = File('lib/features/product/product_sheet.dart').readAsStringSync();
    expect(source, contains("ValueKey('unit-price-breakdown')"));
    expect(source, contains("ValueKey('comparable-unit-price')"));
    expect(source, contains('selectedPackagePrice / selectedBaseUnits'));
    expect(source, contains('قبل التوصيل'));
  });
}
""",
    encoding='utf-8',
)

print('Qitaf v0.5 applied: demo trust signals neutralized, price-per-unit clarity added, version/tests updated.')
