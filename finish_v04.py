from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'
home = root / 'lib/features/basket/home_basket_screen.dart'
text = home.read_text(encoding='utf-8')

# v0.3 already has a sound budget selector. Make the entry points friendlier to
# smaller and medium baskets without changing any product price or fee.
pattern = re.compile(r'\[\s*4000\s*,\s*7000\s*,\s*10000\s*,\s*20000\s*\]')
text, occurrences = pattern.subn('[3000, 5000, 10000, 20000]', text)
if occurrences < 1:
    raise RuntimeError('Could not find the v0.3 quick-budget values')

# Inclusive language: choices describe shopping intent, never income class.
text = text.replace("'لبيتي'", "'للبيت والعائلة'")
text = text.replace("'هدية لأهلي'", "'مختارات وهدايا'")
text = text.replace(
    "'تشمل السلة الحالية والتوصيل التقديري'",
    "'اختر مبلغًا سريعًا أو «مبلغ آخر» • يشمل الإجمالي سلتك الحالية والتوصيل التقديري'",
)
home.write_text(text, encoding='utf-8')

# Keep existing widget tests meaningful after copy changes instead of weakening
# them or skipping failures.
ui_test = root / 'test/basket_ui_test.dart'
ui = ui_test.read_text(encoding='utf-8')
ui = ui.replace("'هدية لأهلي'", "'مختارات وهدايا'")
ui = ui.replace("'لبيتي'", "'للبيت والعائلة'")
ui_test.write_text(ui, encoding='utf-8')

# Version the Flutter project. Android application id is preserved by CI.
pubspec = root / 'pubspec.yaml'
pub = pubspec.read_text(encoding='utf-8')
pub, n = re.subn(r'(?m)^version:\s*[^\n]+$', 'version: 0.4.0+4', pub, count=1)
if n != 1:
    raise RuntimeError('Could not update pubspec version')
pubspec.write_text(pub, encoding='utf-8')

readme = root / 'README.md'
if readme.exists():
    r = readme.read_text(encoding='utf-8')
    r = r.replace('# Qitaf 0.3.0+3 — سلة البيت', '# Qitaf 0.4.0+4 — سلة البيت')
    if '## New in 0.4' not in r:
        insertion = """
## New in 0.4
- Friendlier quick budget choices (3,000 / 5,000 / 10,000 / 20,000 YER) inside Home Basket, while keeping the existing manual “other amount” option.
- Clearer inclusive paths: «للبيت والعائلة» and «مختارات وهدايا».
- The helper copy makes it explicit that the visible total includes the current cart and estimated delivery.
- No personalized pricing: the budget chips only change the amount selected by the buyer; they never change product prices or fees.
- Android application id remains com.qitaf.qitaf.demo3.

"""
        marker = '\n## New in 0.3\n'
        if marker not in r:
            raise RuntimeError('README v0.3 insertion marker not found')
        r = r.replace(marker, insertion + '## New in 0.3\n', 1)
    readme.write_text(r, encoding='utf-8')

status = root / 'BUILD_STATUS.md'
if status.exists():
    st = status.read_text(encoding='utf-8').replace(
        'Version 0.3.0+3.', 'Version 0.4.0+4.'
    )
    status.write_text(st, encoding='utf-8')

# Source regression test supplements the existing functional/widget tests.
test = root / 'test/budget_shortcuts_source_test.dart'
test.write_text(
    """import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Home Basket exposes inclusive quick budgets and manual amount', () {
    final source = File('lib/features/basket/home_basket_screen.dart').readAsStringSync();
    expect(RegExp(r'\\[\\s*3000\\s*,\\s*5000\\s*,\\s*10000\\s*,\\s*20000\\s*\\]').hasMatch(source), isTrue);
    expect(source, contains('_refresh(() => _budget = value)'));
    expect(source, contains('مبلغ آخر'));
    expect(source, contains('للبيت والعائلة'));
    expect(source, contains('مختارات وهدايا'));
    expect(source, contains('التوصيل التقديري'));
  });
}
""",
    encoding='utf-8',
)

print(f'Qitaf v0.4 budget tiers applied to {occurrences} source list(s); inclusive copy and tests updated.')
