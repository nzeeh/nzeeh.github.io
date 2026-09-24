from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'
out = Path.cwd().parent / 'qitaf-v12-output'
out.mkdir(parents=True, exist_ok=True)
log = []

checkout = root / 'lib/features/checkout/checkout_flow.dart'
s = checkout.read_text(encoding='utf-8')

# 1) Optional Arabic read-aloud guide for the address step; never pretend to listen to the microphone.
if "../../core/services/read_aloud.dart" not in s:
    anchor = "import '../../core/state/app_store.dart';\n"
    if s.count(anchor) != 1:
        raise RuntimeError('checkout import anchor missing')
    s = s.replace(anchor, anchor + "import '../../core/services/read_aloud.dart';\n", 1)

# 2) Remove realistic prefilled personal/address data from demo fields.
controller_patterns = {
    r"final nameController\s*=\s*TextEditingController\(text:\s*'محمد'\);": "final nameController = TextEditingController();",
    r"final phoneController\s*=\s*TextEditingController\(text:\s*'77 123 4567'\);": "final phoneController = TextEditingController();",
    r"final cityController\s*=\s*TextEditingController\(text:\s*'صنعاء'\);": "final cityController = TextEditingController();",
    r"final districtController\s*=\s*TextEditingController\(text:\s*'شملان'\);": "final districtController = TextEditingController();",
    r"final streetController\s*=\s*TextEditingController\(text:\s*'شارع الثلاثين'\);": "final streetController = TextEditingController();",
    r"final landmarkController\s*=\s*TextEditingController\(text:\s*'جوار مدرسة الوحدة'\);": "final landmarkController = TextEditingController();",
    r"final detailsController\s*=\s*TextEditingController\(text:\s*'البيت ذو الباب الأخضر'\);": "final detailsController = TextEditingController();",
}
for pattern, replacement in controller_patterns.items():
    s, count = re.subn(pattern, replacement, s, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f'controller pattern failed: {pattern}')

for old, new in {
    "Text('قل العنوان بدل الكتابة',": "Text('اكتب العنوان أو اسمع الإرشاد',",
    "Text('مثال: صنعاء، شملان، جوار مدرسة الوحدة',": "Text('الإملاء الصوتي غير متصل بعد؛ لن يشغّل هذا الزر الميكروفون.',",
    "Text('حدد الباب على الخريطة',": "Text('معاينة مكان الباب',",
    "تم تثبيت نقطة تجريبية على الخريطة.": "معاينة فقط: الخريطة غير متصلة ولا تُحفظ إحداثيات أو موقع حقيقي.",
}.items():
    if s.count(old) != 1:
        raise RuntimeError(f'checkout phrase {old!r}: expected one, found {s.count(old)}')
    s = s.replace(old, new, 1)

button_pattern = re.compile(
    r"TextButton\(\s*onPressed:\s*_simulateVoiceAddress,\s*child:\s*const Text\('تكلّم'\)\s*\)",
    re.S,
)
spoken = """const ReadAloudButton(
                  key: ValueKey('address-audio-guide'),
                  label: 'اسمع الطريقة',
                  text:
                      'اكتب المحافظة أو المدينة، ثم المنطقة أو الحي، ثم الشارع وأقرب معلم معروف، وبعدها صف الباب أو المنزل باختصار. هذه النسخة لا تستمع إلى الميكروفون ولا تحفظ موقعًا حقيقيًا على الخريطة.',
                )"""
if len(button_pattern.findall(s)) != 1:
    raise RuntimeError('voice demo button not found exactly once')
s = button_pattern.sub(spoken, s, count=1)

voice_method = re.compile(r"\n  Future<void> _simulateVoiceAddress\(\) async \{.*?\n  \}\n\n  void _continue\(\)", re.S)
if len(voice_method.findall(s)) != 1:
    raise RuntimeError('voice simulation method not found exactly once')
s = voice_method.sub("\n  void _continue()", s, count=1)

listening_dialog = re.compile(r"\nclass _ListeningDialog extends StatelessWidget \{.*?\n\}\n", re.S)
if len(listening_dialog.findall(s)) != 1:
    raise RuntimeError('listening dialog class not found exactly once')
s = listening_dialog.sub("\n", s, count=1)

checkout.write_text(s, encoding='utf-8')
log.append('checkout_flow.dart: blank recipient/address fields by default; fake speech recognition removed; optional Arabic read-aloud guidance and truthful map preview added.')

# 3) Align one pre-existing widget test with the truthful UI. Overlay-generated
# tests can move between files, so search all tests for the exact stale visible
# expectation rather than a file name or test title. Require exactly one hit.
needle_text = "expect(find.text('تكلّم'), findsOneWidget);"
matches = []
for candidate in sorted((root / 'test').rglob('*.dart')):
    text = candidate.read_text(encoding='utf-8')
    if needle_text in text:
        matches.append((candidate, text))
if len(matches) != 1:
    found = ', '.join(str(path.relative_to(root)) for path, _ in matches) or 'none'
    raise RuntimeError(f'expected exactly one stale voice-address assertion, found {len(matches)}: {found}')
widget_test, wt = matches[0]
needle_at = wt.find(needle_text)
start = wt.rfind('testWidgets(', 0, needle_at)
if start < 0:
    raise RuntimeError(f'legacy checkout voice-address test start not found in {widget_test}')
# Find the next sibling test; otherwise use the enclosing main close.
boundaries = []
for marker in ('\n  testWidgets(', '\n  test('):
    pos = wt.find(marker, needle_at + len(needle_text))
    if pos >= 0:
        boundaries.append(pos)
main_close = wt.rfind('\n}')
if main_close > needle_at:
    boundaries.append(main_close)
if not boundaries:
    raise RuntimeError(f'could not determine legacy checkout widget-test boundary in {widget_test}')
end = min(boundaries)
block = wt[start:end]
local_needle = block.find(needle_text)
if local_needle < 0:
    raise RuntimeError(f'legacy voice-address expectation escaped test boundary in {widget_test}')
line_start = block.rfind('\n', 0, local_needle) + 1
# Preserve navigation/setup and only replace stale assertions after reaching address step.
prefix = block[:line_start]
replacement_block = prefix + """    expect(find.text('اسمع الطريقة'), findsOneWidget);
    expect(
      find.text('الإملاء الصوتي غير متصل بعد؛ لن يشغّل هذا الزر الميكروفون.'),
      findsOneWidget,
    );
  });
"""
wt = wt[:start] + replacement_block + wt[end:]
widget_test.write_text(wt, encoding='utf-8')
log.append(f'{widget_test.relative_to(root)}: stale fake-dictation assertion updated to verify truthful read-aloud guidance without bypassing checkout navigation.')

# 4) Regression tests for trust/accessibility behavior.
test_file = root / 'test/v12_address_truth_accessibility_source_test.dart'
test_file.write_text(r'''import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('recipient fields are blank by default instead of realistic demo data', () {
    final source =
        File('lib/features/checkout/checkout_flow.dart').readAsStringSync();
    expect(source, contains('final nameController = TextEditingController();'));
    expect(source, contains('final phoneController = TextEditingController();'));
    expect(source, contains('final cityController = TextEditingController();'));
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
log.append('test/v12_address_truth_accessibility_source_test.dart: three regression tests added for blank demo fields, truthful voice guidance and truthful map preview.')

# 5) Version bump.
pubspec = root / 'pubspec.yaml'
p = pubspec.read_text(encoding='utf-8')
if p.count('version: 0.11.0+11') != 1:
    raise RuntimeError('pubspec v0.11 version not found exactly once')
pubspec.write_text(p.replace('version: 0.11.0+11', 'version: 0.12.0+12', 1), encoding='utf-8')
log.append('pubspec.yaml: version 0.12.0+12.')

(out / 'SOURCE_CLEANUP.txt').write_text('\n'.join(log) + '\n', encoding='utf-8')
print('\n'.join(log))
