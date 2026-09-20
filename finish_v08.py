from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'
out = Path.cwd().parent / 'qitaf-v08-output'
out.mkdir(parents=True, exist_ok=True)
log = []

checkout = root / 'lib/features/checkout/checkout_flow.dart'
s = checkout.read_text(encoding='utf-8')

old_group = """          _paymentChoice(
            value: 'wallet',
            icon: Icons.account_balance_wallet_rounded,
            title: 'أدفع من محفظتي',
            subtitle: 'سيُفتح مزود المحفظة لإتمام العملية.',
            badge: 'الأسرع',
          ),
          const SizedBox(height: 10),
          _paymentChoice(
            value: 'friend',
            icon: Icons.handshake_rounded,
            title: 'صديقي يدفع لي',
            subtitle: 'نرسل له رابط دفع آمن دون كشف عنوان المستلم.',
            badge: 'ميزة قِطاف',
          ),
          if (method == 'friend') ...[
            const SizedBox(height: 10),
            TextField(
              controller: friendPhone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'رقم هاتف الصديق',
                hintText: 'مثال: 77 000 0000',
                prefixIcon: Icon(Icons.phone_android_rounded),
              ),
            ),
          ],
          const SizedBox(height: 10),
          _paymentChoice(
            value: 'cod',
            icon: Icons.payments_rounded,
            title: 'الدفع عند الاستلام',
            subtitle: 'تدفع للسائق عند وصول الطلب إذا كانت المنطقة مدعومة.',
          ),
"""
new_group = """          RadioGroup<String>(
            groupValue: method,
            onChanged: (next) {
              if (next != null) {
                setState(() => method = next);
              }
            },
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _paymentChoice(
                  value: 'wallet',
                  icon: Icons.account_balance_wallet_rounded,
                  title: 'أدفع من محفظتي',
                  subtitle: 'محاكاة محلية فقط؛ لا تُفتح محفظة حقيقية ولا يُخصم مبلغ.',
                  badge: 'تجريبي',
                ),
                const SizedBox(height: 10),
                _paymentChoice(
                  value: 'friend',
                  icon: Icons.handshake_rounded,
                  title: 'صديقي يدفع لي',
                  subtitle: 'استعرض شكل طلب الدفع لصديق؛ لا يُرسل رابط فعلي في هذه النسخة.',
                  badge: 'تجريبي',
                ),
                if (method == 'friend') ...[
                  const SizedBox(height: 10),
                  TextField(
                    controller: friendPhone,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'رقم هاتف تجريبي',
                      hintText: 'مثال: 77 000 0000',
                      helperText: 'لا يُرسل أي اتصال أو رسالة من هذه النسخة.',
                      prefixIcon: Icon(Icons.phone_android_rounded),
                    ),
                  ),
                ],
                const SizedBox(height: 10),
                _paymentChoice(
                  value: 'cod',
                  icon: Icons.payments_rounded,
                  title: 'الدفع عند الاستلام',
                  subtitle: 'محاكاة لمسار الدفع عند الاستلام؛ التوصيل غير متصل بخدمة فعلية.',
                ),
              ],
            ),
          ),
"""
if old_group not in s:
    raise RuntimeError('Payment choice block did not match the tested v0.7 source')
s = s.replace(old_group, new_group, 1)

# v0.7 is formatted after safe fixes, so migrate the deprecated Radio by semantics
# rather than by exact indentation/line breaks.
radio_pattern = re.compile(
    r"Radio<String>\(\s*"
    r"value\s*:\s*value\s*,\s*"
    r"groupValue\s*:\s*method\s*,\s*"
    r"onChanged\s*:\s*\(next\)\s*=>\s*"
    r"setState\(\s*\(\)\s*=>\s*method\s*=\s*next!\s*\)\s*,?\s*"
    r"\)",
    re.MULTILINE,
)
s, radio_count = radio_pattern.subn('Radio<String>(value: value)', s, count=1)
if radio_count != 1:
    context = '\n'.join(
        line for line in s.splitlines()
        if 'Radio<String>' in line or 'groupValue:' in line or 'onChanged:' in line
    )
    raise RuntimeError(
        'Deprecated Radio block was not migrated exactly once. '
        f'Matched {radio_count}. Relevant source lines:\n{context}'
    )

replacements = {
    "? 'إرسال طلب الدفع للصديق'": "? 'معاينة طلب الدفع للصديق'",
    "appBar: AppBar(title: const Text('بانتظار دفع الصديق'))": "appBar: AppBar(title: const Text('محاكاة دفع الصديق'))",
    "const Text('أرسلنا طلب الدفع',": "const Text('معاينة طلب الدفع',",
    "'تم إرسال رابط آمن إلى ${widget.phone}. حجزنا المحصول مؤقتًا حتى يوافق الصديق أو تنتهي المهلة.'": "'لم يُرسل أي رابط إلى ${widget.phone}. هذه شاشة تجريبية توضح المسار فقط، ولا يوجد حجز فعلي للمحصول أو تحويل أموال. مؤقت تجريبي فقط ولا يمثل مهلة حقيقية.'",
    "const Text('المبلغ المطلوب من الصديق',": "const Text('المبلغ المعروض في المحاكاة',",
    "'لن نعرض عنوان المستلم التفصيلي للصديق الدافع.'": "'في الخدمة المستقبلية يجب ألا يظهر عنوان المستلم التفصيلي للصديق الدافع.'",
}
for old, new in replacements.items():
    if old not in s:
        raise RuntimeError(f'Expected checkout copy not found: {old}')
    s = s.replace(old, new, 1)

checkout.write_text(s, encoding='utf-8')
log.append('checkout_flow.dart: migrated payment radios to RadioGroup<String>; deprecated Radio groupValue/onChanged removed.')
log.append('checkout_flow.dart: wallet/friend/COD copy now states clearly that v0.8 is a local simulation and sends no real link or money.')
log.append('checkout_flow.dart: friend-payment countdown is described in the visible status text as a demo timer, not a real crop reservation.')

pubspec = root / 'pubspec.yaml'
pub = pubspec.read_text(encoding='utf-8')
pub, n = re.subn(r'(?m)^version:\s*[^\n]+$', 'version: 0.8.0+8', pub, count=1)
if n != 1:
    raise RuntimeError('Could not update pubspec version to 0.8.0+8')
pubspec.write_text(pub, encoding='utf-8')

readme = root / 'README.md'
if readme.exists():
    r = readme.read_text(encoding='utf-8')
    r = r.replace('# Qitaf 0.7.0+7 — سلة البيت', '# Qitaf 0.8.0+8 — سلة البيت')
    if '## New in 0.8' not in r:
        marker = '\n## New in 0.7\n'
        if marker not in r:
            raise RuntimeError('README v0.7 insertion marker not found')
        section = """
## New in 0.8
- Migrates payment selection to Flutter RadioGroup, removing the final analyzer deprecations and improving grouped-radio keyboard/semantics behavior.
- Rewrites friend-payment, wallet, and cash-on-delivery demo copy so no screen claims a real link, payment, delivery, or crop reservation occurred.
- Marks the friend-payment countdown in the status copy as a demo timer and the phone field as a non-sending test field.
- Android application id remains com.qitaf.qitaf.demo3. Production payment, delivery, authentication and inter-user livestream services remain disconnected.

"""
        r = r.replace(marker, section + '## New in 0.7\n', 1)
    readme.write_text(r, encoding='utf-8')

status = root / 'BUILD_STATUS.md'
if status.exists():
    st = status.read_text(encoding='utf-8').replace('Version 0.7.0+7.', 'Version 0.8.0+8.')
    status.write_text(st, encoding='utf-8')

test = root / 'test/v08_payment_truthfulness_source_test.dart'
test.write_text(
    """import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('payment selection uses RadioGroup without deprecated Radio callbacks', () {
    final source = File('lib/features/checkout/checkout_flow.dart').readAsStringSync();
    expect(source, contains('RadioGroup<String>('));
    expect(source, contains('Radio<String>(value: value)'));
    expect(source, isNot(contains('groupValue: method,\\n                onChanged:')));
  });

  test('friend payment is explicitly a non-sending simulation', () {
    final source = File('lib/features/checkout/checkout_flow.dart').readAsStringSync();
    expect(source, contains('لا يُرسل رابط فعلي في هذه النسخة'));
    expect(source, contains('لا يُرسل أي اتصال أو رسالة من هذه النسخة'));
    expect(source, contains('لم يُرسل أي رابط إلى'));
    expect(source, contains('لا يوجد حجز فعلي للمحصول أو تحويل أموال'));
    expect(source, contains('مؤقت تجريبي'));
    expect(source, isNot(contains('أرسلنا طلب الدفع')));
    expect(source, isNot(contains('تم إرسال رابط آمن إلى')));
  });
}
""",
    encoding='utf-8',
)

(out / 'SOURCE_CLEANUP.txt').write_text('\n'.join(log) + '\n', encoding='utf-8')
print('Qitaf v0.8 applied: payment truthfulness plus RadioGroup accessibility migration.')
for row in log:
    print('-', row)
