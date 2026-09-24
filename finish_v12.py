from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'
out = Path.cwd().parent / 'qitaf-v12-output'
out.mkdir(parents=True, exist_ok=True)
log = []

checkout = root / 'lib/features/checkout/checkout_flow.dart'
s = checkout.read_text(encoding='utf-8')

# 1) Optional Arabic read-aloud guide for the address step; do not pretend to listen to microphone.
if "../../core/services/read_aloud.dart" not in s:
    anchor = "import '../../core/state/app_store.dart';\n"
    if s.count(anchor) != 1:
        raise RuntimeError('checkout import anchor missing')
    s = s.replace(anchor, anchor + "import '../../core/services/read_aloud.dart';\n", 1)

# 2) Do not prefill realistic personal/address data in demo fields.
replacements = {
    "final nameController = TextEditingController(text: 'محمد');": "final nameController = TextEditingController();",
    "final phoneController = TextEditingController(text: '77 123 4567');": "final phoneController = TextEditingController();",
    "final cityController = TextEditingController(text: 'صنعاء');": "final cityController = TextEditingController();",
    "final districtController = TextEditingController(text: 'شملان');": "final districtController = TextEditingController();",
    "final streetController = TextEditingController(text: 'شارع الثلاثين');": "final streetController = TextEditingController();",
    "final landmarkController = TextEditingController(text: 'جوار مدرسة الوحدة');": "final landmarkController = TextEditingController();",
    "final detailsController = TextEditingController(text: 'البيت ذو الباب الأخضر');": "final detailsController = TextEditingController();",
    "Text('قل العنوان بدل الكتابة',": "Text('اكتب العنوان أو اسمع الإرشاد',",
    "Text('مثال: صنعاء، شملان، جوار مدرسة الوحدة',": "Text('الإملاء الصوتي غير متصل بعد؛ لن يشغّل هذا الزر الميكروفون.',",
    "TextButton(\n                    onPressed: _simulateVoiceAddress,\n                    child: const Text('تكلّم')),": "const ReadAloudButton(\n                  key: ValueKey('address-audio-guide'),\n                  label: 'اسمع الطريقة',\n                  text:\n                      'اكتب المحافظة أو المدينة، ثم المنطقة أو الحي، ثم الشارع وأقرب معلم معروف، وبعدها صف الباب أو المنزل باختصار. هذه النسخة لا تستمع إلى الميكروفون ولا تحفظ موقعًا حقيقيًا على الخريطة.',\n                ),",
    "const SnackBar(\n                  content: Text('تم تثبيت نقطة تجريبية على الخريطة.')),": "const SnackBar(\n                  content: Text('معاينة فقط: الخريطة غير متصلة ولا تُحفظ إحداثيات أو موقع حقيقي.')),",
    "Text('حدد الباب على الخريطة',": "Text('معاينة مكان الباب',",
}
for old, new in replacements.items():
    count = s.count(old)
    if count != 1:
        raise RuntimeError(f'checkout phrase {old!r}: expected one, found {count}')
    s = s.replace(old, new, 1)

field_calls = {
    "_field(nameController, 'اسم المستلم', Icons.person_outline_rounded)": "_field(nameController, 'اسم المستلم', Icons.person_outline_rounded, hintText: 'مثال: أحمد')",
    "_field(phoneController, 'رقم هاتف المستلم', Icons.phone_outlined,\n                keyboardType: TextInputType.phone)": "_field(phoneController, 'رقم هاتف المستلم', Icons.phone_outlined,\n                keyboardType: TextInputType.phone, hintText: 'مثال: 77 000 0000')",
    "_field(cityController, 'المحافظة / المدينة',\n                      Icons.location_city_outlined)": "_field(cityController, 'المحافظة / المدينة',\n                      Icons.location_city_outlined, hintText: 'مثال: صنعاء')",
    "_field(districtController, 'المنطقة أو الحي',\n                      Icons.map_outlined)": "_field(districtController, 'المنطقة أو الحي',\n                      Icons.map_outlined, hintText: 'مثال: شملان')",
    "_field(streetController, 'الشارع', Icons.signpost_outlined)": "_field(streetController, 'الشارع', Icons.signpost_outlined, hintText: 'مثال: شارع الثلاثين')",
    "_field(landmarkController, 'أقرب معلم معروف', Icons.place_outlined)": "_field(landmarkController, 'أقرب معلم معروف', Icons.place_outlined, hintText: 'مثال: جوار مدرسة أو مسجد معروف')",
    "_field(detailsController, 'وصف الباب أو المنزل وملاحظة للسائق',\n              Icons.home_outlined,\n              maxLines: 2)": "_field(detailsController, 'وصف الباب أو المنزل وملاحظة للسائق',\n              Icons.home_outlined,\n              maxLines: 2, hintText: 'مثال: لون الباب أو علامة واضحة')",
}
for old, new in field_calls.items():
    count = s.count(old)
    if count != 1:
        raise RuntimeError(f'field call {old!r}: expected one, found {count}')
    s = s.replace(old, new, 1)

old_sig = """    TextInputType? keyboardType,
    int maxLines = 1,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
    );
  }
"""
new_sig = """    TextInputType? keyboardType,
    int maxLines = 1,
    String? hintText,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        hintText: hintText,
        prefixIcon: Icon(icon),
      ),
    );
  }
"""
if s.count(old_sig) != 1:
    raise RuntimeError(f'_field signature body expected once, found {s.count(old_sig)}')
s = s.replace(old_sig, new_sig, 1)

pattern = re.compile(r"\n  Future<void> _simulateVoiceAddress\(\) async \{.*?\n  \}\n\n  void _continue\(\)", re.S)
if len(pattern.findall(s)) != 1:
    raise RuntimeError('voice simulation method not found exactly once')
s = pattern.sub("\n  void _continue()", s, count=1)

pattern_dialog = re.compile(r"\nclass _ListeningDialog extends StatelessWidget \{.*?\n\}\n", re.S)
if len(pattern_dialog.findall(s)) != 1:
    raise RuntimeError('listening dialog class not found exactly once')
s = pattern_dialog.sub("\n", s, count=1)

checkout.write_text(s, encoding='utf-8')
log.append('checkout_flow.dart: removed realistic prefilled personal data and fake speech/map actions; added example hints and optional Arabic read-aloud address guidance.')

test_file = root / 'test/v12_address_truth_accessibility_source_test.dart'
test_file.write_text(r'''import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('recipient fields are blank by default and examples are hints only', () {
    final source =
        File('lib/features/checkout/checkout_flow.dart').readAsStringSync();
    expect(source, contains('final nameController = TextEditingController();'));
    expect(source, contains('final phoneController = TextEditingController();'));
    expect(source, contains("hintText: 'مثال: صنعاء'"));
    expect(source, contains("hintText: 'مثال: 77 000 0000'"));
    expect(source, isNot(contains("TextEditingController(text: 'محمد')")));
    expect(source, isNot(contains("TextEditingController(text: '77 123 4567')")));
  });

  test('address audio is read-aloud guidance and never pretends to hear speech', () {
    final source =
        File('lib/features/checkout/checkout_flow.dart').readAsStringSync();
    expect(source, contains("ValueKey('address-audio-guide')"));
    expect(source, contains("label: 'اسمع الطريقة'"));
    expect(source, contains('هذه النسخة لا تستمع إلى الميكروفون'));
    expect(source, isNot(contains('_simulateVoiceAddress')));
    expect(source, isNot(contains('فهمت العنوان وملأت الحقول')));
  });

  test('map action is explicitly a preview and does not claim saved coordinates', () {
    final source =
        File('lib/features/checkout/checkout_flow.dart').readAsStringSync();
    expect(source, contains('معاينة مكان الباب'));
    expect(source, contains('الخريطة غير متصلة ولا تُحفظ إحداثيات أو موقع حقيقي'));
    expect(source, isNot(contains('تم تثبيت نقطة تجريبية على الخريطة')));
    expect(source, isNot(contains('حدد الباب على الخريطة')));
  });
}
''', encoding='utf-8')
log.append('v12_address_truth_accessibility_source_test.dart: three regression tests added for blank demo fields, truthful voice guidance and truthful map preview.')

pubspec = root / 'pubspec.yaml'
p = pubspec.read_text(encoding='utf-8')
if p.count('version: 0.11.0+11') != 1:
    raise RuntimeError('pubspec v0.11 version not found exactly once')
pubspec.write_text(p.replace('version: 0.11.0+11', 'version: 0.12.0+12', 1), encoding='utf-8')
log.append('pubspec.yaml: version 0.12.0+12.')

(out / 'SOURCE_CLEANUP.txt').write_text('\n'.join(log) + '\n', encoding='utf-8')
print('\n'.join(log))
