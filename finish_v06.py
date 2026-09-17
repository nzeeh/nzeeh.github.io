from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'

# 1) Home Basket: make the last step easier to understand for people who want
# a short, low-risk shopping path. This is copy only: it does not alter prices,
# stock, delivery fees, or payment behavior.
home = root / 'lib/features/basket/home_basket_screen.dart'
text = home.read_text(encoding='utf-8')
old_helper = 'اختر مبلغًا سريعًا أو «مبلغ آخر» • يشمل الإجمالي سلتك الحالية والتوصيل التقديري'
new_helper = 'اختر مبلغًا سريعًا أو «مبلغ آخر» • يشمل الإجمالي سلتك الحالية والتوصيل التقديري • يمكنك تعديل الكميات قبل الإضافة ولا يوجد شراء تلقائي'
if old_helper not in text:
    raise RuntimeError('Could not find the v0.5 Home Basket helper copy safely')
text = text.replace(old_helper, new_helper, 1)
home.write_text(text, encoding='utf-8')

# 2) Product price panel: state the pricing rule explicitly. The same visible
# selection has the same price for every demo user; price changes are tied only
# to visible product choices, never income/profile classification.
sheet = root / 'lib/features/product/product_sheet.dart'
s = sheet.read_text(encoding='utf-8')
price_note = "'قبل التوصيل • الأسعار والمنتجات في هذه النسخة تجريبية',"
if price_note not in s:
    raise RuntimeError('Could not find the v0.5 price-note location safely')
replacement = """'قبل التوصيل • الأسعار والمنتجات في هذه النسخة تجريبية',
                         style: TextStyle(color: QitafColors.muted, fontSize: 11),
                       ),
                       const SizedBox(height: 5),
                       const Text(
                         'السعر نفسه للجميع؛ يتغير فقط حسب الوزن أو التجهيز أو التغليف الذي تختاره',
                         key: ValueKey('same-price-rule'),
                         style: TextStyle(color: QitafColors.muted, fontSize: 11, fontWeight: FontWeight.w700),
                       """
s = s.replace(
    """'قبل التوصيل • الأسعار والمنتجات في هذه النسخة تجريبية',
                         style: TextStyle(color: QitafColors.muted, fontSize: 11),
                       """,
    replacement,
    1,
)
sheet.write_text(s, encoding='utf-8')

# 3) Version and documentation.
pubspec = root / 'pubspec.yaml'
pub = pubspec.read_text(encoding='utf-8')
pub, n = re.subn(r'(?m)^version:\s*[^\n]+$', 'version: 0.6.0+6', pub, count=1)
if n != 1:
    raise RuntimeError('Could not update pubspec version to 0.6.0+6')
pubspec.write_text(pub, encoding='utf-8')

readme = root / 'README.md'
if readme.exists():
    r = readme.read_text(encoding='utf-8')
    r = r.replace('# Qitaf 0.5.0+5 — سلة البيت', '# Qitaf 0.6.0+6 — سلة البيت')
    if '## New in 0.6' not in r:
        marker = '\n## New in 0.5\n'
        if marker not in r:
            raise RuntimeError('README v0.5 insertion marker not found')
        section = """
## New in 0.6
- Home Basket now states clearly that quantities remain editable and no purchase happens automatically.
- Product configuration states the pricing rule in plain Arabic: the same visible selection has the same price for everyone; changes come only from visible weight/preparation/packaging choices.
- CI applies safe Dart automatic fixes before formatting, then still runs analyzer and the complete test suite; the fix log is shipped with the release package.
- Android application id remains com.qitaf.qitaf.demo3.

"""
        r = r.replace(marker, section + '## New in 0.5\n', 1)
    readme.write_text(r, encoding='utf-8')

status = root / 'BUILD_STATUS.md'
if status.exists():
    st = status.read_text(encoding='utf-8').replace('Version 0.5.0+5.', 'Version 0.6.0+6.')
    status.write_text(st, encoding='utf-8')

# 4) Regression guards. These are deliberately source-level because the text
# is user-facing trust/safety copy and should not silently disappear later.
test = root / 'test/v06_clarity_source_test.dart'
test.write_text(
    """import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Home Basket explains editability and no automatic purchase', () {
    final source = File('lib/features/basket/home_basket_screen.dart').readAsStringSync();
    expect(source, contains('يمكنك تعديل الكميات قبل الإضافة'));
    expect(source, contains('لا يوجد شراء تلقائي'));
    expect(source, contains('التوصيل التقديري'));
  });

  test('Product configurator states the same-price rule', () {
    final source = File('lib/features/product/product_sheet.dart').readAsStringSync();
    expect(source, contains("ValueKey('same-price-rule')"));
    expect(source, contains('السعر نفسه للجميع'));
    expect(source, contains('الوزن أو التجهيز أو التغليف'));
    expect(source, contains("ValueKey('comparable-unit-price')"));
  });
}
""",
    encoding='utf-8',
)

print('Qitaf v0.6 applied: clearer budget/checkout expectations, explicit equal-pricing rule, version/tests updated.')
