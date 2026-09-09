from pathlib import Path
r=Path.cwd()/'qitaf_app'
p=r/'lib/features/feed/feed_screen.dart'
s=p.read_text()
start=s.index('                  const QitafWordmark(onDark: true, compact: true),')
end=s.index('                  IconButton.filledTonal(',start)
s=s[:start]+'''                  const QitafWordmark(onDark: true, compact: true),
                  const SizedBox(width: 8),
                  if (MediaQuery.sizeOf(context).width >= 500) ...[
                    _topTab('لك', true), const SizedBox(width: 10),
                    _topTab('مباشر', false), const SizedBox(width: 10),
                  ],
                  Expanded(child: Align(alignment: Alignment.center, child: TextButton.icon(
                    onPressed: () => openHomeBasket(context),
                    style: TextButton.styleFrom(foregroundColor: const Color(0xFFFFD269), padding: const EdgeInsets.symmetric(horizontal: 8)),
                    icon: const Icon(Icons.shopping_basket_outlined, size: 19),
                    label: const Text('سلة البيت', style: TextStyle(fontWeight: FontWeight.w900)),
                  ))),
''' +s[end:]
p.write_text(s)
p=r/'lib/widgets/qitaf_shell.dart';s=p.read_text()
start=s.index('            child: Row(',s.index('class _QitafBottomBar'))
end=s.index('              ],\n            ),', start)
s=s[:end]+s[end:].replace('              ],\n            ),','              ].map<Widget>((child) => Expanded(child: child)).toList(),\n            ),',1)
p.write_text(s)
p=r/'test/basket_ui_test.dart';s=p.read_text().replace("    expect(find.text('حدّد ميزانيتك'), findsOneWidget);", """    await t.scrollUntilVisible(find.text('حدّد ميزانيتك'), 180,
      scrollable: find.descendant(of: find.byType(HomeBasketScreen), matching: find.byType(Scrollable)).first);
    await t.pumpAndSettle();
    expect(find.text('حدّد ميزانيتك'), findsOneWidget);""");p.write_text(s)
p=r/'lib/core/services/read_aloud.dart';s=p.read_text().replace('  void dispose() { _tts?.stop(); super.dispose(); }','''  void dispose() { _stopSafely(); super.dispose(); }
  Future<void> _stopSafely() async { try { await _tts?.stop(); } catch (_) {} }''').replace('if (_busy) { await _tts?.stop();','if (_busy) { await _stopSafely();');p.write_text(s)
readme='''# Qitaf 0.3.0+3 — سلة البيت

A Flutter LOCAL commerce demo. Not a production marketplace.

## New in 0.3
- Home Basket: deterministic quantity suggestions within a chosen budget, including the existing cart and one estimated delivery fee.
- Home (tomato/mango) and family gift (coffee/honey) purposes, based on four existing demo products only.
- Editable quantities with local stock and total-budget guards. Physical stock quantity is independent of discounted price multipliers.
- Existing cart is preserved; gift opens the existing recipient/address screen with another recipient selected.
- Real on-device cart and product bookmarks persistence through SharedPreferences. Malformed data is handled without blocking startup.
- Optional Arabic read-aloud of summaries using the device TTS engine. An Arabic voice must be available. This is not speech recognition.
- Responsive feed header/navigation and clearer demo labels.

## Running
Use Flutter 3.47.2 as the CI baseline; Android Java 17. Generated Android and web scaffolds and pubspec.lock are included in the build artifact.

    flutter pub get
    flutter analyze
    flutter test --reporter expanded
    flutter run
    flutter build apk --release
    flutter build web --release --no-web-resources-cdn

## Installation
The demo uses applicationId com.qitaf.qitaf.demo3, separate from the old com.qitaf.qitaf package. It installs alongside v0.2 and does not migrate v0.2 local data. It is signed for testing, not a Play Store production release.

## Scope and privacy
All farms, prices, stock, viewer counts, orders, wallets, friend-payment requests and delivery fees are illustrative. No money moves, no public livestream starts and no request is sent to a friend or seller. Do not enter real financial credentials or sensitive address data.
The existing farmer studio contains camera preview/recording code, but physical-device camera and microphone testing is still required. The feed uses local illustrative assets, not real farm livestreams. Voice product/address entry from earlier demos remains simulated.
Local persistence stores only product IDs/selections/quantities/bookmarks and the UI role; it is not backend authentication and not financial storage. There is no scheduled purchase, nutritional guarantee, or automatic budget spending.
The browser ZIP requires HTTP(S) hosting; index.html alone via file:// is not a complete deployed website. Camera permissions require the browser's supported secure context.

## Testing
See the accompanying build report for the actual CI results and artifact checksum. Unit/widget tests are not evidence of a physical handset test.
'''
(r/'README.md').write_text(readme)
(r/'BUILD_STATUS.md').write_text('''# Build scope\n\nVersion 0.3.0+3. The source is processed by GitHub Actions before artifacts are published. Inspect the corresponding workflow run for actual success/failure; this file is not a success certificate.\n\nNo live backend, real authentication, production wallet, inter-user livestream or delivery service is connected. Release mode is used for performance; the signing identity is a TEST identity. Android hardware and Arabic TTS must still be checked on the recipient device.\n''')
print('Responsive layouts, lazy-list test, voice cleanup and release documentation applied.')
