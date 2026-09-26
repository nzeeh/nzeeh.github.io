from pathlib import Path

root = Path.cwd() / 'qitaf_app'
out = Path.cwd().parent / 'qitaf-v13-output'
out.mkdir(parents=True, exist_ok=True)
log = []

product = root / 'lib/core/models/product.dart'
s = product.read_text(encoding='utf-8')
anchor = "weightOptions: [\n      ChoiceOption(label: '1 كجم'),"
if s.count(anchor) != 2:
    raise RuntimeError('expected two household weight anchors')
replacement = (
    "weightOptions: [\n"
    "      ChoiceOption(\n"
    "          label: '500 جم', priceMultiplier: 0.5, quantityInBaseUnits: 0.5),\n"
    "      ChoiceOption(label: '1 كجم'),"
)
s = s.replace(anchor, replacement, 2)
for old, new in {
    "label: 'صندوق 10 كجم', priceMultiplier: 9.2, quantityInBaseUnits: 10":
        "label: 'صندوق 10 كجم', priceMultiplier: 10, quantityInBaseUnits: 10",
    "label: 'صندوق 5 كجم', priceMultiplier: 4.7, quantityInBaseUnits: 5":
        "label: 'صندوق 5 كجم', priceMultiplier: 5, quantityInBaseUnits: 5",
    "label: 'صندوق 10 كجم', priceMultiplier: 9, quantityInBaseUnits: 10":
        "label: 'صندوق 10 كجم', priceMultiplier: 10, quantityInBaseUnits: 10",
}.items():
    if s.count(old) != 1:
        raise RuntimeError('bulk pricing pattern changed')
    s = s.replace(old, new, 1)
product.write_text(s, encoding='utf-8')
log.append('Added 500 g tomato/mango demo packs and removed implicit bulk discounts.')

sheet = root / 'lib/features/product/product_sheet.dart'
s = sheet.read_text(encoding='utf-8')
anchor = """const Text(
                        'السعر نفسه للجميع؛ يتغير فقط حسب الوزن أو التجهيز أو التغليف الذي تختاره',
                        key: ValueKey('same-price-rule'),
                        style: TextStyle(
                            color: QitafColors.muted,
                            fontSize: 11,
                            fontWeight: FontWeight.w700),
                      ),"""
if s.count(anchor) != 1:
    raise RuntimeError('pricing disclosure anchor changed')
addition = anchor + """
                      const SizedBox(height: 4),
                      const Text(
                        'لا يوجد خصم تلقائي للكمية في البيانات التجريبية؛ قارن دائمًا سعر الوحدة قبل الإضافة.',
                        key: ValueKey('no-demo-bulk-discount'),
                        style: TextStyle(
                            color: QitafColors.muted,
                            fontSize: 11,
                            fontWeight: FontWeight.w700),
                      ),"""
sheet.write_text(s.replace(anchor, addition, 1), encoding='utf-8')
log.append('Added explicit no-hidden-bulk-discount notice.')

test_file = root / 'test/v13_small_pack_fair_pricing_test.dart'
test_file.write_text("""import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:qitaf/core/models/product.dart';

void main() {
  test('household staples offer a 500 g demo pack', () {
    for (final id in ['tomato-001', 'mango-001']) {
      final product = demoProducts.firstWhere((p) => p.id == id);
      final small = product.weightOptions.firstWhere((o) => o.label == '500 جم');
      expect(small.quantityInBaseUnits, 0.5);
      expect(small.priceMultiplier, 0.5);
    }
  });

  test('tomato and mango demo weight prices stay linear with weight', () {
    for (final id in ['tomato-001', 'mango-001']) {
      final product = demoProducts.firstWhere((p) => p.id == id);
      for (final option in product.weightOptions) {
        expect(option.priceMultiplier, closeTo(option.quantityInBaseUnits, 0.000001));
      }
    }
  });

  test('product sheet keeps unit pricing disclosure', () {
    final source = File('lib/features/product/product_sheet.dart').readAsStringSync();
    expect(source, contains("ValueKey('comparable-unit-price')"));
    expect(source, contains("ValueKey('no-demo-bulk-discount')"));
  });
}
""", encoding='utf-8')
log.append('Added three regression tests for small packs and transparent weight pricing.')

pubspec = root / 'pubspec.yaml'
p = pubspec.read_text(encoding='utf-8')
if p.count('version: 0.12.0+12') != 1:
    raise RuntimeError('pubspec v0.12 version not found exactly once')
pubspec.write_text(p.replace('version: 0.12.0+12', 'version: 0.13.0+13', 1), encoding='utf-8')
log.append('Version 0.13.0+13.')

(out / 'SOURCE_CLEANUP.txt').write_text('\n'.join(log) + '\n', encoding='utf-8')
print('\n'.join(log))
