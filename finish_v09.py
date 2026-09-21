from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'
out = Path.cwd().parent / 'qitaf-v09-output'
out.mkdir(parents=True, exist_ok=True)
log = []

# 1) Remove the last payment-section wording that could sound like a real send.
checkout = root / 'lib/features/checkout/checkout_flow.dart'
s = checkout.read_text(encoding='utf-8')
old_payment_copy = 'يمكنك الدفع من محفظتك، أو إرسال طلب آمن إلى صديق، أو الدفع عند الاستلام.'
new_payment_copy = 'اختر مسارًا تجريبيًا للمعاينة: محفظة، دفع صديق، أو دفع عند الاستلام. لا يتم إرسال أو خصم أي مبلغ في هذه النسخة.'
if s.count(old_payment_copy) != 1:
    raise RuntimeError(f'Expected one legacy payment subtitle, found {s.count(old_payment_copy)}')
s = s.replace(old_payment_copy, new_payment_copy, 1)
checkout.write_text(s, encoding='utf-8')
log.append('checkout_flow.dart: replaced the final payment-section sentence that implied a real friend-payment send.')

# 2) Add an accessible visual budget meter to Home Basket using semantic anchors,
# not indentation-sensitive source matching.
basket = root / 'lib/features/basket/home_basket_screen.dart'
b = basket.read_text(encoding='utf-8')
remaining_line = 'final remaining = (_budget * 100 - totalMinor) / 100;'
if b.count(remaining_line) != 1:
    raise RuntimeError(f'Expected one remaining-budget calculation, found {b.count(remaining_line)}')
b = b.replace(
    remaining_line,
    remaining_line + "\n    final usedFraction = _budget <= 0\n        ? 0.0\n        : (totalMinor / (_budget * 100)).clamp(0.0, 1.0).toDouble();",
    1,
)

old_summary = 'التوصيل التقديري ${AppStore.deliveryRiyals} ريال. الإجمالي ${formatMoney(totalMinor / 100)} ريال.'
new_summary = "التوصيل التقديري ${AppStore.deliveryRiyals} ريال. الإجمالي ${formatMoney(totalMinor / 100)} ريال. ${remaining >= 0 ? 'المتبقي من الميزانية ${formatMoney(remaining)} ريال' : 'التجاوز عن الميزانية ${formatMoney(-remaining)} ريال'}."
if b.count(old_summary) != 1:
    raise RuntimeError(f'Expected one read-aloud summary tail, found {b.count(old_summary)}')
b = b.replace(old_summary, new_summary, 1)

anchor = 'if (store.storageWarning != null)'
if b.count(anchor) != 1:
    raise RuntimeError(f'Expected one storage-warning anchor, found {b.count(anchor)}')
meter = """const SizedBox(height: 12),
            Container(
              key: const ValueKey('budget-meter-card'),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'استخدمت ${formatMoney(totalMinor / 100)} من ${formatMoney(_budget.toDouble())} ريال',
                    key: const ValueKey('budget-usage-text'),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: QitafColors.muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Semantics(
                    label: 'مؤشر الميزانية',
                    value: remaining >= 0
                        ? 'المتبقي ${formatMoney(remaining)} ريال'
                        : 'تجاوز الميزانية ${formatMoney(-remaining)} ريال',
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(99),
                      child: LinearProgressIndicator(
                        key: const ValueKey('budget-progress'),
                        value: usedFraction,
                        minHeight: 10,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            """
b = b.replace(anchor, meter + anchor, 1)
basket.write_text(b, encoding='utf-8')
log.append('home_basket_screen.dart: added a visible, screen-reader-friendly budget-usage meter.')
log.append('home_basket_screen.dart: Arabic read-aloud summary now includes remaining or exceeded budget.')

# 3) Version and documentation.
pubspec = root / 'pubspec.yaml'
pub = pubspec.read_text(encoding='utf-8')
pub, n = re.subn(r'(?m)^version:\s*[^\n]+$', 'version: 0.9.0+9', pub, count=1)
if n != 1:
    raise RuntimeError('Could not update pubspec version to 0.9.0+9')
pubspec.write_text(pub, encoding='utf-8')

readme = root / 'README.md'
if readme.exists():
    r = readme.read_text(encoding='utf-8')
    r = r.replace('# Qitaf 0.8.0+8 — سلة البيت', '# Qitaf 0.9.0+9 — سلة البيت')
    if '## New in 0.9' not in r:
        marker = '\n## New in 0.8\n'
        if marker not in r:
            raise RuntimeError('README v0.8 insertion marker not found')
        section = """
## New in 0.9
- Fixes the remaining payment heading that could still sound like a real payment link was sent; every payment path is explicitly a local demo.
- Adds a visual budget-usage meter to Home Basket with accessible semantics for screen readers.
- Extends the optional Arabic read-aloud summary to say how much of the budget remains or how far it is exceeded.
- Android application id remains com.qitaf.qitaf.demo3. Production payment, delivery, authentication and inter-user livestream services remain disconnected.

"""
        r = r.replace(marker, section + '## New in 0.8\n', 1)
    readme.write_text(r, encoding='utf-8')

status = root / 'BUILD_STATUS.md'
if status.exists():
    st = status.read_text(encoding='utf-8').replace('Version 0.8.0+8.', 'Version 0.9.0+9.')
    status.write_text(st, encoding='utf-8')

# 4) Regression guards.
test = root / 'test/v09_budget_accessibility_source_test.dart'
test.write_text(
    """import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('payment heading no longer implies a real friend-payment send', () {
    final source = File('lib/features/checkout/checkout_flow.dart').readAsStringSync();
    expect(source, contains('اختر مسارًا تجريبيًا للمعاينة'));
    expect(source, contains('لا يتم إرسال أو خصم أي مبلغ في هذه النسخة'));
    expect(source, isNot(contains('أو إرسال طلب آمن إلى صديق')));
  });

  test('home basket exposes accessible budget usage meter', () {
    final source = File('lib/features/basket/home_basket_screen.dart').readAsStringSync();
    expect(source, contains("ValueKey('budget-meter-card')"));
    expect(source, contains("ValueKey('budget-usage-text')"));
    expect(source, contains("ValueKey('budget-progress')"));
    expect(source, contains("label: 'مؤشر الميزانية'"));
    expect(source, contains('المتبقي من الميزانية'));
    expect(source, contains('التجاوز عن الميزانية'));
  });
}
""",
    encoding='utf-8',
)

(out / 'SOURCE_CLEANUP.txt').write_text('\n'.join(log) + '\n', encoding='utf-8')
print('Qitaf v0.9 applied: truthful payment heading plus accessible Home Basket budget meter.')
for row in log:
    print('-', row)
