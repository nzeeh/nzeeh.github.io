from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'
out = Path.cwd().parent / 'qitaf-v10-output'
out.mkdir(parents=True, exist_ok=True)
log = []

# 1) Make demo availability explicit and expose the smallest package in the feed.
feed = root / 'lib/features/feed/feed_screen.dart'
s = feed.read_text(encoding='utf-8')
old_stock = "Text('متوفر الآن · ${product.stock} ${product.unitLabel}',"
new_stock = "Text('مخزون تجريبي · ${product.stock} ${product.unitLabel}',"
if s.count(old_stock) != 1:
    raise RuntimeError(f'Expected one feed stock label, found {s.count(old_stock)}')
s = s.replace(old_stock, new_stock, 1)
old_cta = "const Text('اختر واشترِ', style: TextStyle(fontSize: 13)),"
new_cta = "const Text('اختر الكمية', style: TextStyle(fontSize: 13)),"
if s.count(old_cta) != 1:
    raise RuntimeError(f'Expected one feed buy CTA, found {s.count(old_cta)}')
s = s.replace(old_cta, new_cta, 1)
stock_block = """                    Text('مخزون تجريبي · ${product.stock} ${product.unitLabel}',
                        style: const TextStyle(
                            color: QitafColors.terraceGreen,
                            fontSize: 12,
                            fontWeight: FontWeight.w700)),
"""
if s.count(stock_block) != 1:
    raise RuntimeError('Feed stock block anchor not found exactly once')
stock_plus = stock_block + """                    Text(
                        'أصغر عبوة: ${product.weightOptions.first.label}',
                        key: const ValueKey('smallest-pack-label'),
                        style: const TextStyle(
                            color: QitafColors.muted,
                            fontSize: 11,
                            fontWeight: FontWeight.w700)),
"""
s = s.replace(stock_block, stock_plus, 1)
feed.write_text(s, encoding='utf-8')
log.append('feed_screen.dart: demo stock is labeled explicitly; CTA no longer says purchase; smallest pack is visible.')

# 2) Keep the same trust wording in the product configurator.
product_sheet = root / 'lib/features/product/product_sheet.dart'
p = product_sheet.read_text(encoding='utf-8')
old_product_stock = "'المتوفر ${product.stock} ${product.unitLabel}',"
new_product_stock = "'مخزون تجريبي ${product.stock} ${product.unitLabel}',"
if p.count(old_product_stock) != 1:
    raise RuntimeError(f'Expected one product stock label, found {p.count(old_product_stock)}')
p = p.replace(old_product_stock, new_product_stock, 1)
old_buy_now = "Text(widget.buyNow ? 'اشترِ الآن' : 'أضف إلى السلة'),"
new_buy_now = "Text(widget.buyNow ? 'أضف وتابع' : 'أضف إلى السلة'),"
if p.count(old_buy_now) != 1:
    raise RuntimeError(f'Expected one buy-now CTA, found {p.count(old_buy_now)}')
p = p.replace(old_buy_now, new_buy_now, 1)
product_sheet.write_text(p, encoding='utf-8')
log.append('product_sheet.dart: stock is marked as demo and buy-now wording now describes the actual local action.')

# 3) Make buyer onboarding match the demo behavior without changing the path.
role = root / 'lib/features/onboarding/role_selection_screen.dart'
r = role.read_text(encoding='utf-8')
replacements = {
    'أشاهد المزارعين وأشتري المنتج من أرضه.': 'أشاهد المزارعين وأجهّز طلبي من أرضه.',
    "'شراء سريع',": "'تجهيز سريع للسلة',",
}
for old, new in replacements.items():
    if r.count(old) != 1:
        raise RuntimeError(f'Expected one onboarding phrase {old!r}, found {r.count(old)}')
    r = r.replace(old, new, 1)
role.write_text(r, encoding='utf-8')
log.append('role_selection_screen.dart: buyer onboarding now says preparing a cart rather than completing a real purchase.')

# Keep the existing widget smoke test aligned with the clearer feed CTA.
widget_test = root / 'test/widget_test.dart'
wt = widget_test.read_text(encoding='utf-8')
old_expectation = "expect(find.text('اختر واشترِ'), findsOneWidget);"
new_expectation = "expect(find.text('اختر الكمية'), findsOneWidget);"
if wt.count(old_expectation) != 1:
    raise RuntimeError(f'Expected one legacy feed CTA widget assertion, found {wt.count(old_expectation)}')
widget_test.write_text(wt.replace(old_expectation, new_expectation, 1), encoding='utf-8')
log.append('widget_test.dart: updated the buyer feed smoke test for the clearer quantity CTA.')

# 4) Version and documentation.
pubspec = root / 'pubspec.yaml'
pub = pubspec.read_text(encoding='utf-8')
pub, n = re.subn(r'(?m)^version:\s*[^\n]+$', 'version: 0.10.0+10', pub, count=1)
if n != 1:
    raise RuntimeError('Could not update pubspec version to 0.10.0+10')
pubspec.write_text(pub, encoding='utf-8')

readme = root / 'README.md'
if readme.exists():
    rd = readme.read_text(encoding='utf-8')
    rd = rd.replace('# Qitaf 0.9.0+9 — سلة البيت', '# Qitaf 0.10.0+10 — سلة البيت')
    if '## New in 0.10' not in rd:
        marker = '\n## New in 0.9\n'
        if marker not in rd:
            raise RuntimeError('README v0.9 insertion marker not found')
        section = """
## New in 0.10
- Marks product availability as demo stock in both the feed and configurator so sample quantities cannot be mistaken for live inventory.
- Rewords the feed and buy-now CTAs to describe the actual local action: choose quantity / add and continue, not a completed purchase.
- Shows the smallest available demo pack directly on each feed product card to help budget-conscious buyers spot smaller quantities quickly.
- Rewords buyer onboarding from “buy” to “prepare my order” while preserving the same buyer path and cart behavior.
- Android application id remains com.qitaf.qitaf.demo3. Production payment, delivery, authentication, live inventory and inter-user livestream services remain disconnected.

"""
        rd = rd.replace(marker, section + '## New in 0.9\n', 1)
    readme.write_text(rd, encoding='utf-8')

status = root / 'BUILD_STATUS.md'
if status.exists():
    st = status.read_text(encoding='utf-8').replace('Version 0.9.0+9.', 'Version 0.10.0+10.')
    status.write_text(st, encoding='utf-8')

# 5) Regression guards.
test = root / 'test/v10_truthful_inventory_cta_source_test.dart'
test.write_text(
    """import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('feed labels demo inventory and exposes smallest pack', () {
    final source = File('lib/features/feed/feed_screen.dart').readAsStringSync();
    expect(source, contains('مخزون تجريبي'));
    expect(source, contains("ValueKey('smallest-pack-label')"));
    expect(source, contains('أصغر عبوة:'));
    expect(source, contains('اختر الكمية'));
    expect(source, isNot(contains('متوفر الآن ·')));
    expect(source, isNot(contains('اختر واشترِ')));
  });

  test('product configurator describes local add action, not a completed purchase', () {
    final source = File('lib/features/product/product_sheet.dart').readAsStringSync();
    expect(source, contains('مخزون تجريبي'));
    expect(source, contains("widget.buyNow ? 'أضف وتابع' : 'أضف إلى السلة'"));
    expect(source, isNot(contains("widget.buyNow ? 'اشترِ الآن'")));
  });

  test('buyer onboarding says prepare order instead of completed purchase', () {
    final source = File('lib/features/onboarding/role_selection_screen.dart').readAsStringSync();
    expect(source, contains('أشاهد المزارعين وأجهّز طلبي من أرضه.'));
    expect(source, contains('تجهيز سريع للسلة'));
    expect(source, isNot(contains('أشاهد المزارعين وأشتري المنتج من أرضه.')));
  });
}
""",
    encoding='utf-8',
)

(out / 'SOURCE_CLEANUP.txt').write_text('\n'.join(log) + '\n', encoding='utf-8')
print('Qitaf v0.10 applied: truthful demo inventory/CTAs plus smallest-pack visibility.')
for row in log:
    print('-', row)
