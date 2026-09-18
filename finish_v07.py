from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'
out = Path.cwd().parent / 'qitaf-v07-output'
out.mkdir(parents=True, exist_ok=True)
cleanup_log = []

# 1) Make the budget entry point more welcoming to any amount without inventing
# a special price tier. Manual budget entry already exists; this copy makes that
# affordance obvious to people whose budget is below/between the quick chips.
home = root / 'lib/features/basket/home_basket_screen.dart'
text = home.read_text(encoding='utf-8')
old_helper = 'اختر مبلغًا سريعًا أو «مبلغ آخر» • يشمل الإجمالي سلتك الحالية والتوصيل التقديري • يمكنك تعديل الكميات قبل الإضافة ولا يوجد شراء تلقائي'
new_helper = 'اختر مبلغًا سريعًا أو «مبلغ آخر» • ميزانيتك أقل أو مختلفة؟ اكتب المبلغ الذي يناسبك • يشمل الإجمالي سلتك الحالية والتوصيل التقديري • يمكنك تعديل الكميات قبل الإضافة ولا يوجد شراء تلقائي'
if old_helper not in text:
    raise RuntimeError('Could not find the v0.6 Home Basket helper copy safely')
text = text.replace(old_helper, new_helper, 1)
home.write_text(text, encoding='utf-8')
cleanup_log.append('Home Basket: clarified that a lower/different manual budget is accepted; no pricing behavior changed.')

# 2) Remove three behavior-preserving curly-brace analyzer lints. Limit the
# transformation to the exact three files reported by v0.6 analyzer. Every
# single-line if with a semicolon body becomes the equivalent braced form.
def brace_single_line_ifs(path: Path) -> int:
    lines = path.read_text(encoding='utf-8').splitlines()
    out_lines = []
    changed = 0
    pattern = re.compile(r'^(\s*)if\s*\((.*)\)\s+([^{}].*;)\s*$')
    for line in lines:
        m = pattern.match(line)
        if m:
            indent, condition, statement = m.groups()
            out_lines.extend([
                f'{indent}if ({condition}) {{',
                f'{indent}  {statement.strip()}',
                f'{indent}}}',
            ])
            changed += 1
        else:
            out_lines.append(line)
    if changed:
        path.write_text('\n'.join(out_lines) + '\n', encoding='utf-8')
    return changed

brace_targets = [
    root / 'lib/core/models/basket_plan.dart',
    root / 'lib/core/state/app_store.dart',
    root / 'lib/features/cart/cart_screen.dart',
]
brace_counts = {str(p.relative_to(root)): brace_single_line_ifs(p) for p in brace_targets}
for name, count in brace_counts.items():
    if count < 1:
        raise RuntimeError(f'Expected at least one single-line if cleanup in {name}')
    cleanup_log.append(f'{name}: wrapped {count} single-line if statement(s) in braces.')

# 3) Replace the one deprecated Switch activeColor property reported by v0.6
# with Flutter's current activeThumbColor equivalent. This is visual only.
checkout = root / 'lib/features/checkout/checkout_flow.dart'
s = checkout.read_text(encoding='utf-8')
active_count = s.count('activeColor:')
if active_count != 1:
    raise RuntimeError(f'Expected exactly one activeColor occurrence, found {active_count}')
s = s.replace('activeColor:', 'activeThumbColor:', 1)
checkout.write_text(s, encoding='utf-8')
cleanup_log.append('checkout_flow.dart: migrated one deprecated activeColor property to activeThumbColor.')

# 4) Version and documentation.
pubspec = root / 'pubspec.yaml'
pub = pubspec.read_text(encoding='utf-8')
pub, n = re.subn(r'(?m)^version:\s*[^\n]+$', 'version: 0.7.0+7', pub, count=1)
if n != 1:
    raise RuntimeError('Could not update pubspec version to 0.7.0+7')
pubspec.write_text(pub, encoding='utf-8')

readme = root / 'README.md'
if readme.exists():
    r = readme.read_text(encoding='utf-8')
    r = r.replace('# Qitaf 0.6.0+6 — سلة البيت', '# Qitaf 0.7.0+7 — سلة البيت')
    if '## New in 0.7' not in r:
        marker = '\n## New in 0.6\n'
        if marker not in r:
            raise RuntimeError('README v0.6 insertion marker not found')
        section = """
## New in 0.7
- Home Basket explicitly welcomes a lower or different manual budget through the existing “other amount” field; no personalized pricing is introduced.
- Cleans the three remaining single-line-if analyzer findings with behavior-preserving braces.
- Migrates the reported deprecated Switch activeColor property to activeThumbColor.
- CI enforces a small analyzer issue budget so lint regressions cannot silently grow.
- Android application id remains com.qitaf.qitaf.demo3.

"""
        r = r.replace(marker, section + '## New in 0.6\n', 1)
    readme.write_text(r, encoding='utf-8')

status = root / 'BUILD_STATUS.md'
if status.exists():
    st = status.read_text(encoding='utf-8').replace('Version 0.6.0+6.', 'Version 0.7.0+7.')
    status.write_text(st, encoding='utf-8')

# 5) Regression guards for today's accessibility copy and lint cleanups.
test = root / 'test/v07_accessibility_quality_source_test.dart'
test.write_text(
    """import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Home Basket welcomes lower or different manual budgets', () {
    final source = File('lib/features/basket/home_basket_screen.dart').readAsStringSync();
    expect(source, contains('ميزانيتك أقل أو مختلفة؟'));
    expect(source, contains('اكتب المبلغ الذي يناسبك'));
    expect(source, contains('مبلغ آخر'));
    expect(source, contains('لا يوجد شراء تلقائي'));
  });

  test('reported single-line if lints stay cleaned up', () {
    final paths = [
      'lib/core/models/basket_plan.dart',
      'lib/core/state/app_store.dart',
      'lib/features/cart/cart_screen.dart',
    ];
    final oneLineIf = RegExp(r'^\\s*if\\s*\\(.*\\)\\s+[^\\{\\n].*;\\s*$', multiLine: true);
    for (final path in paths) {
      final source = File(path).readAsStringSync();
      expect(oneLineIf.hasMatch(source), isFalse, reason: path);
    }
  });

  test('deprecated activeColor property stays removed from checkout', () {
    final source = File('lib/features/checkout/checkout_flow.dart').readAsStringSync();
    expect(source, isNot(contains('activeColor:')));
    expect(source, contains('activeThumbColor:'));
  });
}
""",
    encoding='utf-8',
)

(out / 'SOURCE_CLEANUP.txt').write_text('\n'.join(cleanup_log) + '\n', encoding='utf-8')
print('Qitaf v0.7 applied: inclusive manual-budget guidance plus analyzer cleanup guards.')
for row in cleanup_log:
    print('-', row)
