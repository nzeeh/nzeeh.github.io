from pathlib import Path
import re

root = Path.cwd() / 'qitaf_app'
home = root / 'lib/features/basket/home_basket_screen.dart'
text = home.read_text(encoding='utf-8')


def matching_paren_end(source: str, open_index: int) -> int:
    depth = 0
    quote = None
    triple = False
    escaped = False
    i = open_index
    while i < len(source):
        ch = source[i]
        nxt = source[i:i+3]
        if quote:
            if triple:
                if nxt == quote * 3:
                    quote = None
                    triple = False
                    i += 3
                    continue
            else:
                if escaped:
                    escaped = False
                elif ch == '\\':
                    escaped = True
                elif ch == quote:
                    quote = None
            i += 1
            continue
        if nxt in ("'''", '\"\"\"'):
            quote = nxt[0]
            triple = True
            i += 3
            continue
        if ch in ("'", '"'):
            quote = ch
            i += 1
            continue
        if source.startswith('//', i):
            nl = source.find('\n', i)
            i = len(source) if nl < 0 else nl + 1
            continue
        if source.startswith('/*', i):
            end = source.find('*/', i + 2)
            i = len(source) if end < 0 else end + 2
            continue
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    raise RuntimeError('Unbalanced Dart widget parentheses')

marker = 'على قدّ ميزانيتك'
if marker not in text:
    controller_anchor = text.find('controller: _budgetController')
    if controller_anchor < 0:
        raise RuntimeError('Could not find the Home Basket budget controller')
    start = text.rfind('TextField(', max(0, controller_anchor - 2500), controller_anchor)
    widget_name = 'TextField('
    if start < 0:
        start = text.rfind('TextFormField(', max(0, controller_anchor - 2500), controller_anchor)
        widget_name = 'TextFormField('
    if start < 0:
        raise RuntimeError('Could not find the budget input widget')
    open_index = start + len(widget_name) - 1
    end = matching_paren_end(text, open_index)
    after = end + 1
    while after < len(text) and text[after] in ' \t':
        after += 1
    if after < len(text) and text[after] == ',':
        after += 1
    line_start = text.rfind('\n', 0, start) + 1
    indent = text[line_start:start]
    block = f"""
{indent}const SizedBox(height: 10),
{indent}Align(
{indent}  alignment: Alignment.centerRight,
{indent}  child: Text(
{indent}    'على قدّ ميزانيتك',
{indent}    style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w900),
{indent}  ),
{indent}),
{indent}const SizedBox(height: 4),
{indent}Text(
{indent}  'اختر مبلغًا سريعًا أو اكتب ميزانيتك بنفسك. سيظل الإجمالي ورسوم التوصيل ظاهرين قبل متابعة الطلب.',
{indent}  style: Theme.of(context).textTheme.bodySmall,
{indent}),
{indent}const SizedBox(height: 8),
{indent}Wrap(
{indent}  spacing: 8,
{indent}  runSpacing: 8,
{indent}  children: [
{indent}    ActionChip(
{indent}      avatar: const Icon(Icons.payments_outlined, size: 18),
{indent}      label: const Text('٣٬٠٠٠ ر.ي'),
{indent}      onPressed: () => setState(() => _budgetController.text = '3000'),
{indent}    ),
{indent}    ActionChip(
{indent}      avatar: const Icon(Icons.payments_outlined, size: 18),
{indent}      label: const Text('٥٬٠٠٠ ر.ي'),
{indent}      onPressed: () => setState(() => _budgetController.text = '5000'),
{indent}    ),
{indent}    ActionChip(
{indent}      avatar: const Icon(Icons.payments_outlined, size: 18),
{indent}      label: const Text('١٠٬٠٠٠ ر.ي'),
{indent}      onPressed: () => setState(() => _budgetController.text = '10000'),
{indent}    ),
{indent}    ActionChip(
{indent}      avatar: const Icon(Icons.payments_outlined, size: 18),
{indent}      label: const Text('١٥٬٠٠٠ ر.ي'),
{indent}      onPressed: () => setState(() => _budgetController.text = '15000'),
{indent}    ),
{indent}  ],
{indent}),
"""
    text = text[:after] + block + text[after:]

# Use inclusive shopping-language labels where the v0.3 labels exist.
text = text.replace("'لبيتي'", "'للبيت والعائلة'")
text = text.replace("'هدية لأهلي'", "'مختارات وهدايا'")
home.write_text(text, encoding='utf-8')

# Version the Flutter project without changing the Android application id.
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
        insertion = """\n## New in 0.4\n- Quick budget shortcuts (3,000 / 5,000 / 10,000 / 15,000 YER) inside Home Basket, while keeping manual budget entry.\n- Clearer inclusive paths: «للبيت والعائلة» and «مختارات وهدايا» when the corresponding v0.3 labels are present.\n- No personalized pricing: shortcuts only set the buyer's own budget; they never change product prices.\n- Android application id remains com.qitaf.qitaf.demo3.\n\n"""
        marker2 = '\n## New in 0.3\n'
        r = r.replace(marker2, insertion + '## New in 0.3\n', 1)
    readme.write_text(r, encoding='utf-8')

status = root / 'BUILD_STATUS.md'
if status.exists():
    st = status.read_text(encoding='utf-8').replace('Version 0.3.0+3.', 'Version 0.4.0+4.')
    status.write_text(st, encoding='utf-8')

# A small source-level regression test complements the existing Home Basket widget tests.
test = root / 'test/budget_shortcuts_source_test.dart'
test.write_text("""import 'dart:io';\n\nimport 'package:flutter_test/flutter_test.dart';\n\nvoid main() {\n  test('Home Basket keeps manual budget entry and exposes quick shortcuts', () {\n    final source = File('lib/features/basket/home_basket_screen.dart').readAsStringSync();\n    expect(source, contains('controller: _budgetController'));\n    expect(source, contains('على قدّ ميزانيتك'));\n    expect(source, contains("_budgetController.text = '3000'"));\n    expect(source, contains("_budgetController.text = '5000'"));\n    expect(source, contains("_budgetController.text = '10000'"));\n    expect(source, contains("_budgetController.text = '15000'"));\n  });\n}\n""", encoding='utf-8')

print('Qitaf v0.4 quick-budget and inclusive-path patch applied.')
